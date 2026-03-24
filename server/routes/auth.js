const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, generateToken } = require('../middleware/auth');
const emailService = require('../services/email');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, selectedCharity, charityPercentage } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      selectedCharity: selectedCharity || null,
      charityPercentage: charityPercentage || 10
    });

    await user.save();
    const token = generateToken(user._id);

    // Send welcome email (non-blocking)
    emailService.sendWelcome(user).catch(console.error);

    res.status(201).json({
      user: user.toJSON(),
      token
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      user: user.toJSON(),
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('selectedCharity');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, selectedCharity, charityPercentage } = req.body;
    const updates = {};
    
    if (name) updates.name = name;
    if (selectedCharity !== undefined) updates.selectedCharity = selectedCharity;
    if (charityPercentage !== undefined) {
      if (charityPercentage < 10) {
        return res.status(400).json({ error: 'Minimum charity contribution is 10%' });
      }
      updates.charityPercentage = charityPercentage;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .populate('selectedCharity');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
