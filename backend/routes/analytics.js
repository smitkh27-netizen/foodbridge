const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getPlatformAnalytics } = require('../controllers/analyticsController');

router.get('/platform', protect, getPlatformAnalytics);

module.exports = router;
