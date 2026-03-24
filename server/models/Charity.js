const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Charity name is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000
  },
  image: {
    type: String,
    default: null
  },
  category: {
    type: String,
    enum: ['health', 'education', 'environment', 'community', 'sports', 'youth', 'other'],
    default: 'other'
  },
  website: {
    type: String,
    default: null
  },
  featured: {
    type: Boolean,
    default: false
  },
  totalContributions: {
    type: Number,
    default: 0
  },
  supporterCount: {
    type: Number,
    default: 0
  },
  events: [{
    title: String,
    description: String,
    date: Date,
    location: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

charitySchema.index({ category: 1, featured: -1 });
charitySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Charity', charitySchema);
