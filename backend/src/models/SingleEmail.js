const mongoose = require('mongoose');

const singleEmailSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address!`
      }
    },
    firstName: String,
    lastName: String
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  attachments: [{
    filename: String,
    path: String,
    contentType: String
  }],
  status: {
    type: String,
    enum: ['sent', 'failed'],
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  error: String
});

module.exports = mongoose.model('SingleEmail', singleEmailSchema);