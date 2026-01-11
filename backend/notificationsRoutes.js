// Notifications Management Routes

// Get user's notifications
app.get('/notifications/:mobile', authenticateToken, async (req, res) => {
  try {
    const { mobile } = req.params;
    
    // Verify user can only access their own notifications
    if (req.user.mobile !== mobile) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Fetch notifications from database
    const notifications = await Notification.find({ mobile })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications

    res.json({
      success: true,
      notifications
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// Mark notification as read
app.patch('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, mobile: req.user.mobile },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    res.json({
      success: true,
      notification
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// Delete single notification
app.delete('/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOneAndDelete({
      _id: id,
      mobile: req.user.mobile
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
});

// Clear all notifications for user
app.delete('/notifications/:mobile/clear-all', authenticateToken, async (req, res) => {
  try {
    const { mobile } = req.params;
    
    // Verify user can only clear their own notifications
    if (req.user.mobile !== mobile) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    await Notification.deleteMany({ mobile });

    res.json({
      success: true,
      message: 'All notifications cleared successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications',
      error: error.message
    });
  }
});

// Create notification (Internal API for system use)
app.post('/notifications/create', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { mobile, type, title, message, priority = 'medium' } = req.body;
    
    if (!mobile || !type || !title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const notification = new Notification({
      mobile,
      type,
      title,
      message,
      priority,
      isRead: false,
      createdAt: new Date()
    });

    await notification.save();

    res.json({
      success: true,
      notification
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
});

// Auto-generate notifications based on events
const createNotification = async (mobile, type, title, message, priority = 'medium') => {
  try {
    const notification = new Notification({
      mobile,
      type,
      title,
      message,
      priority,
      isRead: false,
      createdAt: new Date()
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

// Usage examples for auto-notifications:
// After successful recharge
// await createNotification(mobile, 'recharge', 'Recharge Successful', `Your ${planName} recharge of ₹${amount} has been processed successfully.`, 'high');

// Plan expiry reminder
// await createNotification(mobile, 'expiry', 'Plan Expiring Soon', 'Your current plan will expire in 3 days. Recharge now to avoid service interruption.', 'high');

// Data usage alert
// await createNotification(mobile, 'usage', 'Data Usage Alert', 'You have consumed 90% of your daily data limit.', 'medium');

module.exports = { createNotification };