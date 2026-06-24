const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getNgoDashboard, getNearbyDonations, assignVolunteer,
  getInventory, addInventoryItem, getImpactReport,
} = require('../controllers/ngoController');

router.get('/dashboard', protect, authorize('ngo'), getNgoDashboard);
router.get('/nearby-donations', protect, authorize('ngo'), getNearbyDonations);
router.post('/assign-volunteer', protect, authorize('ngo'), assignVolunteer);
router.get('/inventory', protect, authorize('ngo'), getInventory);
router.post('/inventory', protect, authorize('ngo'), addInventoryItem);
router.get('/impact-report', protect, authorize('ngo'), getImpactReport);

module.exports = router;
