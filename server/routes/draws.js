const express = require('express');
const router = express.Router();
const Draw = require('../models/Draw');
const Winner = require('../models/Winner');
const User = require('../models/User');
const DrawEngine = require('../services/drawEngine');
const emailService = require('../services/email');
const { auth, requireAdmin, requireSubscription } = require('../middleware/auth');

// GET /api/draws - List published draws (for users) or all draws (for admin)
router.get('/', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { status: 'published' };
    const draws = await Draw.find(filter)
      .sort({ year: -1, month: -1 })
      .limit(12);
    res.json({ draws });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/draws/:id - Draw details with results
router.get('/:id', auth, async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id)
      .populate('results.fiveMatch.user', 'name email')
      .populate('results.fourMatch.user', 'name email')
      .populate('results.threeMatch.user', 'name email');

    if (!draw) {
      return res.status(404).json({ error: 'Draw not found' });
    }

    // Non-admin can only see published draws
    if (req.user.role !== 'admin' && draw.status !== 'published') {
      return res.status(403).json({ error: 'Draw results not yet published' });
    }

    res.json({ draw });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/draws/execute - Admin: Run a draw
router.post('/execute', auth, requireAdmin, async (req, res) => {
  try {
    const { month, year, drawType } = req.body;

    // Check if draw already exists for this month
    let draw = await Draw.findOne({ month, year });
    if (draw && draw.status === 'published') {
      return res.status(400).json({ error: 'Draw already published for this month' });
    }

    // Get jackpot carry over from previous draw
    const previousDraw = await Draw.findOne({
      $or: [
        { year, month: month - 1 },
        { year: year - 1, month: 12 }
      ],
      status: 'published'
    });
    const jackpotCarryOver = previousDraw?.jackpotCarryOver || 0;

    // Execute draw
    const results = await DrawEngine.executeDraw(drawType || 'random', jackpotCarryOver);

    if (draw) {
      // Update existing draw
      draw.drawType = drawType || 'random';
      draw.winningNumbers = results.winningNumbers;
      draw.results = results.results;
      draw.prizePool = results.prizePool;
      draw.jackpotCarryOver = results.jackpotCarryOver;
      draw.totalWinners = results.totalWinners;
      draw.status = 'simulated';
      draw.executedAt = new Date();
      draw.executedBy = req.user._id;
    } else {
      draw = new Draw({
        month,
        year,
        drawType: drawType || 'random',
        winningNumbers: results.winningNumbers,
        results: results.results,
        prizePool: results.prizePool,
        jackpotCarryOver: results.jackpotCarryOver,
        totalWinners: results.totalWinners,
        status: 'simulated',
        executedAt: new Date(),
        executedBy: req.user._id
      });
    }

    await draw.save();
    res.json({ draw, distribution: results.distribution });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/draws/simulate - Admin: Simulation mode (doesn't save)
router.post('/simulate', auth, requireAdmin, async (req, res) => {
  try {
    const { drawType } = req.body;
    const results = await DrawEngine.executeDraw(drawType || 'random', 0);
    res.json({ simulation: true, ...results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/draws/:id/publish - Admin: Publish draw results
router.post('/:id/publish', auth, requireAdmin, async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw) {
      return res.status(404).json({ error: 'Draw not found' });
    }

    if (draw.status === 'published') {
      return res.status(400).json({ error: 'Draw already published' });
    }

    if (draw.status === 'pending') {
      return res.status(400).json({ error: 'Draw must be executed before publishing' });
    }

    draw.status = 'published';
    draw.publishedAt = new Date();
    await draw.save();

    // Create Winner records for all winners
    const allWinners = [
      ...draw.results.fiveMatch.map(w => ({ ...w, matchType: 5 })),
      ...draw.results.fourMatch.map(w => ({ ...w, matchType: 4 })),
      ...draw.results.threeMatch.map(w => ({ ...w, matchType: 3 }))
    ];

    for (const w of allWinners) {
      const winner = new Winner({
        draw: draw._id,
        user: w.user,
        matchType: w.matchType,
        matchedNumbers: w.matchedNumbers,
        prizeAmount: w.prizeAmount,
        verificationStatus: 'pending',
        paymentStatus: 'pending'
      });
      await winner.save();

      // Send winner notification
      const user = await User.findById(w.user);
      if (user) {
        emailService.sendWinnerNotification(user, w.prizeAmount, w.matchType).catch(console.error);
      }
    }

    // Send draw results to all active subscribers
    const activeUsers = await User.find({ subscriptionStatus: 'active' });
    for (const user of activeUsers) {
      const isWinner = allWinners.find(w => w.user.toString() === user._id.toString());
      emailService.sendDrawResults(user, draw.month, draw.year, isWinner || null).catch(console.error);
    }

    res.json({ draw, winnersCreated: allWinners.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
