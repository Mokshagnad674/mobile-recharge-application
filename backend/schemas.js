const mongoose = require('mongoose');

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  planname: {
    type: String,
    required: true
  },
  subscriptionDuration: {
    type: Number,
    required: true
  },
  subscriptionDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: function() {
      return new Date(Date.now() + this.subscriptionDuration * 24 * 60 * 60 * 1000);
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Prepaid'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Plan Schema (for reference)
const planSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  dataLimit: {
    type: String,
    required: true
  },
  validity: {
    type: Number,
    required: true
  },
  planStatus: {
    type: String,
    enum: ['Active', 'Expired'],
    default: 'Active'
  }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
const Plan = mongoose.model('Plan', planSchema);

module.exports = { Subscription, Plan };