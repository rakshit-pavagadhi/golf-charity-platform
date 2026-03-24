const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Score = require('../models/Score');
const Draw = require('../models/Draw');
const Winner = require('../models/Winner');
const Charity = require('../models/Charity');
const { auth, requireAdmin } = require('../middleware/auth');

// GET /api/admin/users - List all users
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .populate('selectedCharity', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users/:id - Get user details
router.get('/users/:id', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('selectedCharity');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const scores = await Score.find({ user: user._id }).sort({ date: -1 }).limit(5);
    const subscription = await Subscription.findOne({ user: user._id, status: 'active' });
    const winnings = await Winner.find({ user: user._id }).populate('draw', 'month year');

    res.json({ user, scores, subscription, winnings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/users/:id - Edit user
router.put('/users/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { name, email, role, subscriptionStatus } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (subscriptionStatus) updates.subscriptionStatus = subscriptionStatus;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/users/:id/scores - Admin edit user scores
router.put('/users/:id/scores', auth, requireAdmin, async (req, res) => {
  try {
    const { scores } = req.body; // Array of { value, date }
    
    // Delete existing scores
    await Score.deleteMany({ user: req.params.id });
    
    // Insert new scores
    const newScores = scores.map(s => ({
      user: req.params.id,
      value: s.value,
      date: new Date(s.date)
    }));
    
    await Score.insertMany(newScores);
    const savedScores = await Score.find({ user: req.params.id }).sort({ date: -1 });
    
    res.json({ scores: savedScores });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/analytics - Reports & Analytics
router.get('/analytics', auth, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSubscribers = await User.countDocuments({ subscriptionStatus: 'active' });
    const totalCharities = await Charity.countDocuments({ isActive: true });
    
    // Total prize pool (from all published draws)
    const draws = await Draw.find({ status: 'published' });
    const totalPrizePool = draws.reduce((sum, d) => sum + d.prizePool, 0);
    
    // Total charity contributions
    const subscriptions = await Subscription.find({ status: 'active' });
    const totalCharityContributions = subscriptions.reduce((sum, s) => sum + (s.charityContribution || 0), 0);
    
    // Draw statistics
    const totalDraws = draws.length;
    const totalWinners = await Winner.countDocuments();
    const totalPaid = await Winner.countDocuments({ paymentStatus: 'paid' });
    const pendingVerification = await Winner.countDocuments({ verificationStatus: 'submitted' });
    
    // Monthly subscription growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentSubscriptions = await Subscription.find({ createdAt: { $gte: sixMonthsAgo } });
    
    // Charity leaderboard
    const charityStats = await User.aggregate([
      { $match: { selectedCharity: { $ne: null } } },
      { $group: { _id: '$selectedCharity', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Populate charity names
    const charityIds = charityStats.map(c => c._id);
    const charities = await Charity.find({ _id: { $in: charityIds } }).select('name');
    const charityMap = {};
    charities.forEach(c => { charityMap[c._id.toString()] = c.name; });
    const charityLeaderboard = charityStats.map(c => ({
      name: charityMap[c._id.toString()] || 'Unknown',
      supporters: c.count
    }));

    res.json({
      totalUsers,
      activeSubscribers,
      totalCharities,
      totalPrizePool,
      totalCharityContributions,
      totalDraws,
      totalWinners,
      totalPaid,
      pendingVerification,
      charityLeaderboard,
      recentSubscriptionCount: recentSubscriptions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
