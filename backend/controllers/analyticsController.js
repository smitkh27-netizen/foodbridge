const Donation = require('../models/Donation');
const User = require('../models/User');

// @GET /api/analytics/platform
exports.getPlatformAnalytics = async (req, res) => {
  try {
    const [totalMealsSaved, totalDonations, totalCompleted, activeNgos, activeVolunteers] = await Promise.all([
      Donation.aggregate([{ $group: { _id: null, total: { $sum: '$estimatedServings' } } }]),
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'ngo', isActive: true, ngoVerified: true }),
      User.countDocuments({ role: 'volunteer', isActive: true }),
    ]);

    const categoryBreakdown = await Donation.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } }
    ]);

    const monthly = await Donation.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const urgencyBreakdown = await Donation.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      analytics: {
        totalMealsSaved: totalMealsSaved[0]?.total || 0,
        totalDonations,
        totalCompleted,
        activeNgos,
        activeVolunteers,
        successRate: totalDonations > 0 ? ((totalCompleted / totalDonations) * 100).toFixed(1) : 0,
        categoryBreakdown,
        monthly,
        urgencyBreakdown,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
