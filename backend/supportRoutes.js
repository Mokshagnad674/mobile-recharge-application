// Support Ticket Management Routes

// Get user's support tickets
app.get('/support/tickets/:mobile', authenticateToken, async (req, res) => {
  try {
    const { mobile } = req.params;
    
    // Verify user can only access their own tickets
    if (req.user.mobile !== mobile) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Fetch tickets from database
    const tickets = await SupportTicket.find({ mobile })
      .sort({ createdAt: -1 })
      .limit(20); // Limit to last 20 tickets

    res.json({
      success: true,
      tickets
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support tickets',
      error: error.message
    });
  }
});

// Create new support ticket
app.post('/support/tickets', authenticateToken, async (req, res) => {
  try {
    const { mobile, issueType, description, lastRecharge } = req.body;
    
    // Verify user can only create tickets for their own mobile
    if (req.user.mobile !== mobile) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    if (!issueType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Issue type is required' 
      });
    }

    // Generate ticket ID
    const ticketId = 'SUP' + Date.now().toString().slice(-5);

    // Create support ticket
    const ticket = new SupportTicket({
      ticketId,
      mobile,
      issueType,
      description: description || 'No additional description provided',
      lastRecharge,
      status: 'Open',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await ticket.save();

    res.json({
      success: true,
      ticketId,
      message: 'Support ticket created successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
      error: error.message
    });
  }
});

// Admin: Get all support tickets
app.get('/admin/support/tickets', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .sort({ createdAt: -1 })
      .limit(100); // Limit for performance

    res.json({
      success: true,
      tickets
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support tickets',
      error: error.message
    });
  }
});

// Admin: Update ticket status
app.patch('/admin/support/tickets/:ticketId', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    
    if (!['Open', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const ticket = await SupportTicket.findOneAndUpdate(
      { ticketId },
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ticket not found' 
      });
    }

    res.json({
      success: true,
      ticket
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status',
      error: error.message
    });
  }
});

module.exports = { /* export support route handlers */ };