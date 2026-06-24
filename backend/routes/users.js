const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @GET /api/users/volunteers - list all active volunteers (for NGO to assign)
router.get('/volunteers', protect, async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer', isActive: true, availability: true })
      .select('name phone email avatar volunteerPoints totalPickups address');
    res.json({ success: true, volunteers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/users/:id - public profile
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -otp -otpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
