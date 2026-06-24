const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getVolunteerDashboard, updatePickupStatus,
  getVolunteerHistory, getLeaderboard,
} = require('../controllers/volunteerController');

router.get('/dashboard', protect, authorize('volunteer'), getVolunteerDashboard);
router.put('/pickup/:id', protect, authorize('volunteer'), upload.array('proof', 3), updatePickupStatus);
router.get('/history', protect, authorize('volunteer'), getVolunteerHistory);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
