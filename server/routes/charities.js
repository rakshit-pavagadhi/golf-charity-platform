const express = require('express');
const router = express.Router();
const Charity = require('../models/Charity');
const User = require('../models/User');
const { auth, requireAdmin } = require('../middleware/auth');

// GET /api/charities - List all active charities
router.get('/', async (req, res) => {
  try {
    const { search, category, featured } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const charities = await Charity.find(filter).sort({ featured: -1, name: 1 });
    res.json({ charities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/charities/featured - Get featured charities
router.get('/featured', async (req, res) => {
  try {
    const charities = await Charity.find({ isActive: true, featured: true }).limit(6);
    res.json({ charities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/charities/:id - Get charity profile
router.get('/:id', async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }
    
    // Get supporter count
    const supporterCount = await User.countDocuments({ selectedCharity: charity._id });
    
    res.json({ charity: { ...charity.toObject(), supporterCount } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/charities - Admin: Create charity
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const charity = new Charity(req.body);
    await charity.save();
    res.status(201).json({ charity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/charities/:id - Admin: Update charity
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }
    res.json({ charity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/charities/:id - Admin: Delete (soft) charity
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }
    res.json({ message: 'Charity deactivated', charity });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/charities/select - User: Select charity
router.put('/select/mine', auth, async (req, res) => {
  try {
    const { charityId, charityPercentage } = req.body;

    if (charityPercentage && charityPercentage < 10) {
      return res.status(400).json({ error: 'Minimum charity contribution is 10%' });
    }

    const charity = await Charity.findById(charityId);
    if (!charity || !charity.isActive) {
      return res.status(404).json({ error: 'Charity not found' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        selectedCharity: charityId,
        charityPercentage: charityPercentage || req.user.charityPercentage
      },
      { new: true }
    ).populate('selectedCharity');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
