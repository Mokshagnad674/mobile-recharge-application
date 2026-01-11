const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const { connectDB } = require('./database');

// Import schemas
const { Subscription, Plan } = require('./schemas');
const { SupportTicket } = require('./supportTicketSchema');
const { Notification } = require('./notificationSchema');
const { Refund } = require('./refundSchema');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Initialize default plans
const initializePlans = async () => {
  try {
    const planCount = await Plan.countDocuments();
    if (planCount === 0) {
      const defaultPlans = [
        { planName: "Basic Plan", price: 199, dataLimit: "1GB/day", validity: 28, planStatus: "Active" },
        { planName: "Premium Plan", price: 399, dataLimit: "2GB/day", validity: 30, planStatus: "Active" },
        { planName: "Ultra Plan", price: 699, dataLimit: "3GB/day", validity: 60, planStatus: "Active" }
      ];
      await Plan.insertMany(defaultPlans);
      console.log('Default plans initialized');
    }
  } catch (error) {
    console.log('Plans initialization skipped:', error.message);
  }
};

// Initialize plans after connection
setTimeout(initializePlans, 1000);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Mobile Recharge API is running',
    timestamp: new Date().toISOString()
  });
});

// Import and use route handlers
// Store OTPs temporarily (use Redis in production)
const otpStore = new Map();

// Send OTP
app.post('/auth/send-otp', async (req, res) => {
  const { mobile } = req.body;

  if (!mobile || mobile.length !== 10) {
    return res.status(400).json({ success: false, message: 'Invalid mobile number' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with 5-minute expiry
  otpStore.set(mobile, { otp, expires: Date.now() + 5 * 60 * 1000 });

  // In production, send SMS via service like Twilio
  console.log(`OTP for ${mobile}: ${otp}`);

  res.json({ success: true, message: 'OTP sent successfully' });
});

// Verify OTP
app.post('/auth/verify-otp', async (req, res) => {
  const { mobile, otp } = req.body;

  const storedOTP = otpStore.get(mobile);

  if (!storedOTP || storedOTP.expires < Date.now()) {
    return res.status(400).json({ success: false, message: 'OTP expired' });
  }

  if (storedOTP.otp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  // Clear OTP
  otpStore.delete(mobile);

  // Create user session

  const user = { mobile, role: mobile === '7075816778' ? 'admin' : 'user' };
  const token = jwt.sign(user, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });

  res.json({
    success: true,
    token,
    user,
    message: 'Login successful'
  });
});

// Logout
app.post('/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Role-based middleware
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user?.role !== requiredRole) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
};

// User Routes
app.get('/user/plans', authenticateToken, async (req, res) => {
  try {
    const plans = await Plan.find({ planStatus: 'Active' });
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch plans' });
  }
});

// Temporary in-memory storage for subscriptions (until MongoDB is connected)
const tempSubscriptions = [];

// Subscribe to a plan
app.post('/subscribe', authenticateToken, async (req, res) => {
  try {
    const { username, planname, subscriptionDuration } = req.body;

    if (!username || !planname || !subscriptionDuration) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user already has an active subscription
    const existingSubscription = tempSubscriptions.find(sub =>
      sub.username === username && sub.status === 'Active'
    );

    let status = 'Active';
    if (existingSubscription) {
      status = 'Prepaid';
    }

    const subscription = {
      username,
      planname,
      subscriptionDuration: parseInt(subscriptionDuration),
      status: status,
      subscriptionDate: new Date(),
      expiryDate: new Date(Date.now() + parseInt(subscriptionDuration) * 24 * 60 * 60 * 1000)
    };

    // Try MongoDB first, fallback to memory
    let finalSubscription = subscription;
    try {
      const mongoSubscription = new Subscription(subscription);
      const savedSubscription = await mongoSubscription.save();
      finalSubscription = savedSubscription;
      console.log('Subscription saved to MongoDB:', savedSubscription);
    } catch (mongoError) {
      console.log('MongoDB save failed, using memory storage:', mongoError.message);
      // Add ID for memory storage
      finalSubscription._id = Date.now().toString();
      tempSubscriptions.push(finalSubscription);
    }

    res.json({ success: true, subscription: finalSubscription, message: 'Recharge successful' });
  } catch (error) {
    console.log('Subscription error:', error);
    res.status(500).json({ success: false, message: 'Recharge failed: ' + error.message });
  }
});

// Get user's active subscription
app.get('/user/subscription/:mobile', authenticateToken, async (req, res) => {
  try {
    let subscription = null;

    // Try MongoDB first
    try {
      subscription = await Subscription.findOne({
        username: req.params.mobile,
        status: { $in: ['Active', 'Prepaid'] }
      }).sort({ subscriptionDate: -1 });
    } catch (mongoError) {
      console.log('MongoDB query failed, checking memory storage');
      // Fallback to memory storage
      subscription = tempSubscriptions
        .filter(sub => sub.username === req.params.mobile && ['Active', 'Prepaid'].includes(sub.status))
        .sort((a, b) => new Date(b.subscriptionDate) - new Date(a.subscriptionDate))[0];
    }

    if (subscription) {
      // Format subscription data for frontend
      const formattedSubscription = {
        mobile: subscription.username,
        planName: subscription.planname,
        amount: subscription.planname.includes('Basic') ? 199 :
          subscription.planname.includes('Premium') ? 399 : 699,
        dataLimit: subscription.planname.includes('Basic') ? '1GB/day' :
          subscription.planname.includes('Premium') ? '2GB/day' : '3GB/day',
        validity: subscription.subscriptionDuration,
        status: subscription.status,
        transactionTime: new Date(subscription.subscriptionDate).toLocaleString(),
        startDate: new Date(subscription.subscriptionDate).toLocaleDateString(),
        endDate: new Date(subscription.expiryDate).toLocaleDateString()
      };
      res.json({ success: true, subscription: formattedSubscription });
    } else {
      res.json({ success: true, subscription: null });
    }
  } catch (error) {
    console.log('Subscription fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscription' });
  }
});

// Get user's recharge history
app.get('/user/recharge-history/:mobile', authenticateToken, async (req, res) => {
  try {
    const history = await Subscription.find({ username: req.params.mobile })
      .sort({ subscriptionDate: -1 })
      .select('planname subscriptionDate subscriptionDuration status expiryDate')
      .lean();

    const formattedHistory = history.map(item => ({
      id: item._id,
      date: item.subscriptionDate,
      planName: item.planname,
      amount: item.planname.includes('Basic') ? 199 : item.planname.includes('Premium') ? 399 : 699,
      validity: item.subscriptionDuration,
      status: 'Success'
    }));

    res.json({ success: true, history: formattedHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

// Support ticket routes
app.post('/support/tickets', authenticateToken, async (req, res) => {
  try {
    const { mobile, issueType, description } = req.body;

    const ticketId = 'SUP' + Date.now().toString().slice(-6);

    const ticket = new SupportTicket({
      ticketId,
      mobile,
      issueType,
      description,
      status: 'Open'
    });

    await ticket.save();

    // Create notification for ticket submission
    const notification = new Notification({
      mobile,
      title: 'Support Ticket Created',
      message: `Your support ticket has been submitted successfully. Ticket ID: #${ticketId}`,
      type: 'support'
    });
    await notification.save();

    res.json({ success: true, ticketId: ticketId, ticket });
  } catch (error) {
    console.log('Support ticket error:', error);
    res.status(500).json({ success: false, message: 'Failed to create ticket' });
  }
});

app.get('/support/tickets/:mobile', authenticateToken, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ mobile: req.params.mobile })
      .sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
});

// Get user's subscription history for refund requests
app.get('/user/subscription-history/:mobile', authenticateToken, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ username: req.params.mobile })
      .sort({ subscriptionDate: -1 });
    res.json({ success: true, subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscription history' });
  }
});

// Request refund
app.post('/refunds/request', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.body;

    // Find the subscription to refund
    const subscription = await Subscription.findById(planId);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.username !== req.user.mobile && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const refundId = 'REF' + Date.now().toString().slice(-6);

    const refund = new Refund({
      ticketId: refundId,
      mobile: subscription.username,
      planName: subscription.planname, // Note: Schema uses 'planname' (lowercase n) based on schema.js
      amount: subscription.planname.includes('Basic') ? 199 :
        subscription.planname.includes('Premium') ? 399 : 699,
      status: 'Pending'
    });

    await refund.save();

    // Create notification
    const notification = new Notification({
      mobile: subscription.username,
      title: 'Refund Requested',
      message: `Refund request initiated for ${subscription.planname}. Ticket ID: #${refundId}`,
      type: 'system'
    });
    await notification.save();

    res.json({ success: true, refundId, refund });
  } catch (error) {
    console.error('Refund request error:', error);
    res.status(500).json({ success: false, message: 'Failed to create refund request' });
  }
});

// Get user refunds
app.get('/refunds/:mobile', authenticateToken, async (req, res) => {
  try {
    const { mobile } = req.params;

    // Strict Access Control: Users can only see their own refunds
    if (req.user.role !== 'admin' && req.user.mobile !== mobile) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to refund data' });
    }

    const refunds = await Refund.find({ mobile }).sort({ createdAt: -1 });

    // Map to frontend format if needed, but schema matches closely
    const formattedRefunds = refunds.map(r => ({
      id: r.ticketId,
      mobile: r.mobile,
      amount: r.amount,
      planName: r.planName,
      status: r.status,
      initiatedAt: r.initiatedAt,
      processedAt: r.processedAt,
      eta: r.eta
    }));

    res.json({ success: true, refunds: formattedRefunds });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch refunds' });
  }
});

// Admin: Get all refunds
app.get('/admin/refunds', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const refunds = await Refund.find().sort({ createdAt: -1 });

    const formattedRefunds = refunds.map(r => ({
      id: r.ticketId,
      mobile: r.mobile,
      amount: r.amount,
      planName: r.planName,
      status: r.status,
      initiatedAt: r.initiatedAt,
      processedAt: r.processedAt,
      eta: r.eta
    }));

    res.json({ success: true, refunds: formattedRefunds });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch refunds' });
  }
});

// Admin approve/reject refund
app.patch('/admin/refunds/:id/:action', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { id, action } = req.params; // id is ticketId like 'REF...'

    const status = action === 'approve' ? 'Refunded' : 'Rejected';
    const processedAt = new Date();

    const refund = await Refund.findOneAndUpdate(
      { ticketId: id },
      { status, processedAt },
      { new: true }
    );

    if (!refund) {
      return res.status(404).json({ success: false, message: 'Refund not found' });
    }

    // Create notification
    const notification = new Notification({
      mobile: refund.mobile,
      title: `Refund ${status}`,
      message: `Your refund request for ${refund.planName} has been ${status}.`,
      type: 'system'
    });
    await notification.save();

    res.json({ success: true, action, refund });
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({ success: false, message: 'Failed to process refund' });
  }
});
app.get('/notifications/:mobile', authenticateToken, async (req, res) => {
  try {
    const { mobile } = req.params;

    // strict security check
    if (req.user.role !== 'admin' && req.user.mobile !== mobile && mobile !== 'ALL_USERS') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to notifications' });
    }

    let notifications;

    if (mobile === 'ALL_USERS') {
      notifications = [];
    } else {
      notifications = await Notification.find({
        $or: [{ mobile }, { mobile: 'ALL_USERS' }]
      })
        .sort({ createdAt: -1 })
        .limit(50);
    }

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

app.patch('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

// Admin Routes
app.get('/admin/plans', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch plans' });
  }
});

app.post('/admin/plans', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { planName, price, dataLimit, validity } = req.body;

    if (!planName || !price || !dataLimit || !validity) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const plan = new Plan({
      planName,
      price: parseInt(price),
      dataLimit,
      validity: parseInt(validity),
      planStatus: 'Active'
    });

    await plan.save();

    // Create notification for all users about new plan
    const notification = new Notification({
      mobile: 'ALL_USERS',
      title: 'New Plan Available',
      message: `New ${planName} is now available for ₹${price} with ${dataLimit} data and ${validity} days validity.`,
      type: 'system'
    });
    await notification.save();

    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add plan' });
  }
});

app.get('/admin/subscriptions', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const subscriptions = await Subscription.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subscriptions' });
  }
});

// Update plan
app.put('/admin/plans/:id', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Create notification for plan update
    const notification = new Notification({
      mobile: 'ALL_USERS',
      title: 'Plan Updated',
      message: `${plan.planName} has been updated. New price: ₹${plan.price}, Data: ${plan.dataLimit}, Validity: ${plan.validity} days.`,
      type: 'system'
    });
    await notification.save();

    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update plan' });
  }
});

// Toggle plan status
app.patch('/admin/plans/:id/status', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const plan = await Plan.findByIdAndUpdate(req.params.id, { planStatus: status }, { new: true });

    // Create notification for plan status change
    const notification = new Notification({
      mobile: 'ALL_USERS',
      title: status === 'Active' ? 'Plan Reactivated' : 'Plan Expired',
      message: `${plan.planName} has been ${status === 'Active' ? 'reactivated and is now available' : 'expired and is no longer available'}.`,
      type: 'system'
    });
    await notification.save();

    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update plan status' });
  }
});

// Delete plan
app.delete('/admin/plans/:id', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    await Plan.findByIdAndDelete(req.params.id);

    // Create notification for plan deletion
    const notification = new Notification({
      mobile: 'ALL_USERS',
      title: 'Plan Removed',
      message: `${plan.planName} has been permanently removed and is no longer available.`,
      type: 'system'
    });
    await notification.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete plan' });
  }
});

// Example route to test database connection
app.get('/test-db', async (req, res) => {
  try {
    // Test database connection by counting documents
    const planCount = await Plan.countDocuments();
    const subscriptionCount = await Subscription.countDocuments();

    res.json({
      success: true,
      message: 'Database connection successful',
      data: {
        plans: planCount,
        subscriptions: subscriptionCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Database test: http://localhost:${PORT}/test-db`);
});

module.exports = app;