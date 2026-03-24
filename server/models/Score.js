const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  value: {
    type: Number,
    required: [true, 'Score value is required'],
    min: [1, 'Score must be at least 1'],
    max: [45, 'Score cannot exceed 45']
  },
  date: {
    type: Date,
    required: [true, 'Score date is required']
  }
}, {
  timestamps: true
});

// Compound index for user scores sorted by date
scoreSchema.index({ user: 1, date: -1 });
scoreSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Score', scoreSchema);
