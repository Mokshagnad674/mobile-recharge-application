const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  mobile: {
    type: String,
    required: true,
    ref: 'User'
  },
  planName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Refunded', 'Processing'],
    default: 'Pending'
  },
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  eta: {
    type: Date
  }
}, {
  timestamps: true
});

const Refund = mongoose.model('Refund', refundSchema);

module.exports = { Refund };
