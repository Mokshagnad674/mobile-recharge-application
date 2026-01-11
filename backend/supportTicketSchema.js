const mongoose = require('mongoose');

// Support Ticket Schema
const supportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  issueType: {
    type: String,
    required: true,
    enum: [
      'Recharge successful but benefits not received',
      'Recharge pending',
      'Wrong plan selected',
      'OTP / login issues',
      'Plan validity confusion',
      'Other issue'
    ]
  },
  description: {
    type: String,
    default: 'No additional description provided'
  },
  lastRecharge: {
    planName: String,
    amount: String,
    date: Date
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  assignedTo: {
    type: String,
    default: null
  },
  resolution: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
supportTicketSchema.index({ mobile: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1, createdAt: -1 });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

module.exports = { SupportTicket };