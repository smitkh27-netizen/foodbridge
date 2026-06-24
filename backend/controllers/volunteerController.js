const User = require('../models/User');
const Donation = require('../models/Donation');

// @GET /api/volunteers/dashboard
exports.getVolunteerDashboard = async (req, res) => {
  try {
    const vId = req.user.id;
    const assigned = await Donation.countDocuments({ assignedVolunteer: vId, status: 'assigned' });
    const pickedUp = await Donation.countDocuments({ assignedVolunteer: vId, status: 'picked_up' });
    const completed = await Donation.countDocuments({ assignedVolunteer: vId, status: 'completed' });
    const myPickups = await Donation.find({ assignedVolunteer: vId, status: { $in: ['assigned', 'picked_up'] } })
      .populate('donor', 'name phone organization address')
      .populate('assignedNgo', 'name ngoName phone address')
      .sort('-updatedAt');

    res.json({
      success: true,
      stats: { assigned, pickedUp, completed, points: req.user.volunteerPoints },
      myPickups,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/volunteers/update-pickup/:id
exports.updatePickupStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
    if (donation.assignedVolunteer?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not your assignment' });
    }

    const allowed = { assigned: 'picked_up', picked_up: 'delivered' };
    if (!allowed[donation.status] || allowed[donation.status] !== status) {
      return res.status(400).json({ success: false, message: 'Invalid status transition' });
    }

    const proofFiles = req.files ? req.files.map(f => f.path) : [];
    donation.status = status;
    donation.timeline.push({ status, note: note || `Volunteer updated to ${status}`, updatedBy: req.user.id });
    if (status === 'picked_up') donation.proofOfCollection = proofFiles;
    if (status === 'delivered') {
      donation.proofOfDelivery = proofFiles;
      donation.status = 'completed';
      donation.timeline.push({ status: 'completed', note: 'Delivery confirmed', updatedBy: req.user.id });
      await User.findByIdAndUpdate(req.user.id, { $inc: { volunteerPoints: 10, totalPickups: 1 } });
    }
    await donation.save();
    res.json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/volunteers/history
exports.getVolunteerHistory = async (req, res) => {
  try {
    const history = await Donation.find({ assignedVolunteer: req.user.id, status: 'completed' })
      .populate('donor', 'name organization')
      .populate('assignedNgo', 'name ngoName')
      .sort('-updatedAt');
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/volunteers/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer', isActive: true })
      .select('name avatar volunteerPoints totalPickups')
      .sort('-volunteerPoints')
      .limit(10);
    res.json({ success: true, volunteers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
