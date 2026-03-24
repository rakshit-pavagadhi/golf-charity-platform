const express = require('express');
const router = express.Router();
const Winner = require('../models/Winner');
const User = require('../models/User');
const emailService = require('../services/email');
const { auth, requireAdmin } = require('../middleware/auth');

// GET /api/winners - Admin: List all winners
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    const filter = {};
    if (status) filter.verificationStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const winners = await Winner.find(filter)
      .populate('user', 'name email')
      .populate('draw', 'month year')
      .sort({ createdAt: -1 });

    res.json({ winners });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/winners/me - User: My winnings
router.get('/me', auth, async (req, res) => {
  try {
    const winners = await Winner.find({ user: req.user._id })
      .populate('draw', 'month year winningNumbers')
      .sort({ createdAt: -1 });

    const totalWon = winners
      .filter(w => w.verificationStatus === 'approved')
      .reduce((sum, w) => sum + w.prizeAmount, 0);

    const pendingAmount = winners
      .filter(w => w.paymentStatus === 'pending' && w.verificationStatus === 'approved')
      .reduce((sum, w) => sum + w.prizeAmount, 0);

    const paidAmount = winners
      .filter(w => w.paymentStatus === 'paid')
      .reduce((sum, w) => sum + w.prizeAmount, 0);

    res.json({ winners, totalWon, pendingAmount, paidAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/winners/:id/proof - Upload verification proof
router.post('/:id/proof', auth, async (req, res) => {
  try {
    const winner = await Winner.findOne({ _id: req.params.id, user: req.user._id });
    if (!winner) {
      return res.status(404).json({ error: 'Winner record not found' });
    }

    if (winner.verificationStatus === 'approved') {
      return res.status(400).json({ error: 'Already verified' });
    }

    const { proofImageUrl } = req.body;
    if (!proofImageUrl) {
      return res.status(400).json({ error: 'Proof image URL is required' });
    }

    winner.proofImageUrl = proofImageUrl;
    winner.proofSubmittedAt = new Date();
    winner.verificationStatus = 'submitted';
    await winner.save();

    res.json({ winner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/winners/:id/verify - Admin: Approve or reject
router.put('/:id/verify', auth, requireAdmin, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const winner = await Winner.findById(req.params.id).populate('user');
    if (!winner) {
      return res.status(404).json({ error: 'Winner not found' });
    }

    winner.verificationStatus = status;
    winner.verifiedBy = req.user._id;
    winner.verifiedAt = new Date();
    if (status === 'rejected') {
      winner.rejectionReason = rejectionReason || 'Verification failed';
    }

    await winner.save();
    res.json({ winner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/winners/:id/pay - Admin: Mark as paid
router.put('/:id/pay', auth, requireAdmin, async (req, res) => {
  try {
    const winner = await Winner.findById(req.params.id).populate('user');
    if (!winner) {
      return res.status(404).json({ error: 'Winner not found' });
    }

    if (winner.verificationStatus !== 'approved') {
      return res.status(400).json({ error: 'Winner must be verified before payment' });
    }

    winner.paymentStatus = 'paid';
    winner.paidAt = new Date();
    await winner.save();

    // Send payout confirmation email
    if (winner.user) {
      emailService.sendPayoutConfirmation(winner.user, winner.prizeAmount).catch(console.error);
    }

    res.json({ winner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
