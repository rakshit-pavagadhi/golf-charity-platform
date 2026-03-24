const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'lapsed', 'past_due', 'trialing'],
    default: 'active'
  },
  stripeSubscriptionId: {
    type: String,
    required: true
  },
  stripePriceId: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  charityContribution: {
    type: Number,
    default: 0
  },
  prizePoolContribution: {
    type: Number,
    default: 0
  },
  currentPeriodStart: {
    type: Date
  },
  currentPeriodEnd: {
    type: Date
  },
  cancelledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for quick lookups
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
