const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  createDonation, getDonations, getDonationById,
  updateDonationStatus, deleteDonation,
} = require('../controllers/donationController');

router.post('/', protect, authorize('donor'), upload.array('images', 5), createDonation);
router.get('/', protect, getDonations);
router.get('/:id', protect, getDonationById);
router.put('/:id/status', protect, authorize('ngo', 'volunteer', 'admin'), upload.array('proof', 3), updateDonationStatus);
router.delete('/:id', protect, authorize('donor', 'admin'), deleteDonation);

module.exports = router;
