const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  draw: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Draw',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchType: {
    type: Number,
    enum: [3, 4, 5],
    required: true
  },
  matchedNumbers: [{
    type: Number
  }],
  prizeAmount: {
    type: Number,
    required: true,
    min: 0
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'submitted', 'approved', 'rejected'],
    default: 'pending'
  },
  proofImageUrl: {
    type: String,
    default: null
  },
  proofSubmittedAt: {
    type: Date,
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid'],
    default: 'pending'
  },
  paidAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

winnerSchema.index({ draw: 1, user: 1 });
winnerSchema.index({ user: 1, paymentStatus: 1 });
winnerSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('Winner', winnerSchema);
