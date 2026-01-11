const mongoose = require('mongoose');

// Notification Schema
const notificationSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['recharge', 'expiry', 'usage', 'security', 'system', 'support']
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  actionUrl: {
    type: String,
    default: null
  },
  actionText: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Auto-expire notifications after 30 days
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  metadata: {
    planName: String,
    amount: Number,
    rechargeId: String,
    deviceInfo: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ mobile: 1, createdAt: -1 });
notificationSchema.index({ mobile: 1, isRead: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired notifications

// Virtual for unread count
notificationSchema.virtual('isUnread').get(function() {
  return !this.isRead;
});

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(mobile) {
  return this.countDocuments({ mobile, isRead: false });
};

// Static method to create system notifications
notificationSchema.statics.createSystemNotification = function(mobile, type, title, message, priority = 'medium', metadata = {}) {
  return this.create({
    mobile,
    type,
    title,
    message,
    priority,
    metadata,
    isRead: false
  });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Notification };