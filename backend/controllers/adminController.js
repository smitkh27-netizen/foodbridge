const User = require('../models/User');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');

// @GET /api/admin/stats
exports.getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalDonors, totalNgos, totalVolunteers,
      totalDonations, pendingDonations, completedDonations,
      pendingNgoVerifications] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'volunteer' }),
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'pending' }),
      Donation.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'ngo', ngoVerified: false, isActive: true }),
    ]);

    const categoryStats = await Donation.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const monthlyDonations = await Donation.aggregate([
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalDonors, totalNgos, totalVolunteers, totalDonations, pendingDonations, completedDonations, pendingNgoVerifications },
      categoryStats,
      monthlyDonations,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, isActive, isVerified, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

    const users = await User.find(query).select('-password -otp -otpExpiry')
      .sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/admin/users/:id/toggle-status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'suspended'}`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/admin/ngos/:id/verify
exports.verifyNgo = async (req, res) => {
  try {
    const io = req.app.get('io');
    const ngo = await User.findById(req.params.id);
    if (!ngo || ngo.role !== 'ngo') return res.status(404).json({ success: false, message: 'NGO not found' });
    ngo.ngoVerified = true;
    ngo.isVerified = true;
    await ngo.save();
    const notif = await Notification.create({
      recipient: ngo._id, type: 'ngo_verified',
      title: 'NGO Verified!', message: 'Your NGO has been verified. You can now accept donations.'
    });
    io.to(ngo._id.toString()).emit('new_notification', notif);
    res.json({ success: true, message: 'NGO verified successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/admin/donations
exports.getAllDonations = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    const donations = await Donation.find(query)
      .populate('donor', 'name organization email')
      .populate('assignedNgo', 'name ngoName')
      .populate('assignedVolunteer', 'name phone')
      .sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    const total = await Donation.countDocuments(query);
    res.json({ success: true, donations, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
