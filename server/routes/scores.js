const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const { auth, requireSubscription } = require('../middleware/auth');

// GET /api/scores - Get user's scores (latest 5, reverse chronological)
router.get('/', auth, requireSubscription, async (req, res) => {
  try {
    const scores = await Score.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(5);
    res.json({ scores });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/scores - Add a new score (auto-replace oldest if 5 exist)
router.post('/', auth, requireSubscription, async (req, res) => {
  try {
    const { value, date } = req.body;

    // Validate score range
    if (value < 1 || value > 45) {
      return res.status(400).json({ error: 'Score must be between 1 and 45 (Stableford)' });
    }

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Check current score count
    const existingScores = await Score.find({ user: req.user._id })
      .sort({ date: -1 });

    // If 5 scores exist, remove the oldest
    if (existingScores.length >= 5) {
      const oldestScore = existingScores[existingScores.length - 1];
      await Score.findByIdAndDelete(oldestScore._id);
    }

    const score = new Score({
      user: req.user._id,
      value,
      date: new Date(date)
    });

    await score.save();

    // Return updated scores
    const scores = await Score.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    res.status(201).json({ score, scores });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/scores/:id - Edit a score
router.put('/:id', auth, requireSubscription, async (req, res) => {
  try {
    const { value, date } = req.body;
    const score = await Score.findOne({ _id: req.params.id, user: req.user._id });

    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    if (value !== undefined) {
      if (value < 1 || value > 45) {
        return res.status(400).json({ error: 'Score must be between 1 and 45 (Stableford)' });
      }
      score.value = value;
    }
    if (date) score.date = new Date(date);

    await score.save();

    const scores = await Score.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    res.json({ score, scores });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/scores/:id - Delete a score
router.delete('/:id', auth, requireSubscription, async (req, res) => {
  try {
    const score = await Score.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    const scores = await Score.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    res.json({ message: 'Score deleted', scores });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
