const mongoose = require('mongoose');

const drawResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchedNumbers: [{
    type: Number
  }],
  matchCount: {
    type: Number,
    required: true
  },
  prizeAmount: {
    type: Number,
    default: 0
  }
}, { _id: false });

const drawSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'simulated', 'published'],
    default: 'pending'
  },
  drawType: {
    type: String,
    enum: ['random', 'algorithmic'],
    default: 'random'
  },
  winningNumbers: [{
    type: Number,
    min: 1,
    max: 45
  }],
  prizePool: {
    type: Number,
    default: 0
  },
  jackpotCarryOver: {
    type: Number,
    default: 0
  },
  results: {
    fiveMatch: [drawResultSchema],
    fourMatch: [drawResultSchema],
    threeMatch: [drawResultSchema]
  },
  totalWinners: {
    type: Number,
    default: 0
  },
  executedAt: {
    type: Date
  },
  publishedAt: {
    type: Date
  },
  executedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Unique index for month/year combination
drawSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Draw', drawSchema);
