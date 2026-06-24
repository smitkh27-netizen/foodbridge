const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAdminStats, getAllUsers, toggleUserStatus,
  verifyNgo, getAllDonations,
} = require('../controllers/adminController');

router.use(protect, authorize('admin'));
router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.put('/ngos/:id/verify', verifyNgo);
router.get('/donations', getAllDonations);

module.exports = router;
