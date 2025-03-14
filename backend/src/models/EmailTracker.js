const mongoose = require('mongoose');

const emailTrackerSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  recipient: {
    email: {
      type: String,
      required: true
    },
    firstName: String,
    lastName: String
  },
  status: {
    type: String,
    enum: ['queued', 'sent', 'delivered', 'opened', 'clicked', 'failed'],
    default: 'queued'
  },
  openedAt: Date,
  clickedAt: Date,
  deliveredAt: Date,
  failedAt: Date,
  failureReason: String,
  clicks: [{
    url: String,
    timestamp: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EmailTracker', emailTrackerSchema);