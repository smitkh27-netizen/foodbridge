const User = require('../models/User');
const Donation = require('../models/Donation');
const Inventory = require('../models/Inventory');

// @GET /api/ngos/dashboard
exports.getNgoDashboard = async (req, res) => {
  try {
    const ngoId = req.user.id;
    const accepted = await Donation.countDocuments({ assignedNgo: ngoId, status: { $in: ['accepted', 'assigned', 'picked_up'] } });
    const completed = await Donation.countDocuments({ assignedNgo: ngoId, status: 'completed' });
    const pending = await Donation.countDocuments({ status: 'pending' });
    const inventory = await Inventory.find({ ngo: ngoId });
    const inventoryValue = inventory.reduce((sum, item) => sum + item.remainingQuantity, 0);
    const volunteers = await User.find({ role: 'volunteer', isActive: true });
    const recentDonations = await Donation.find({ assignedNgo: ngoId })
      .populate('donor', 'name organization')
      .populate('assignedVolunteer', 'name phone')
      .sort('-updatedAt').limit(5);

    res.json({ success: true, stats: { accepted, completed, pendingNearby: pending, inventoryItems: inventoryValue, volunteerCount: volunteers.length }, recentDonations, inventory: inventory.slice(0, 5) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/ngos/nearby-donations
exports.getNearbyDonations = async (req, res) => {
  try {
    const { category, urgency, city, page = 1, limit = 12 } = req.query;
    const query = { status: 'pending' };
    if (category) query.category = category;
    if (urgency) query.urgency = urgency;
    if (city) query['pickupLocation.city'] = new RegExp(city, 'i');

    const donations = await Donation.find(query)
      .populate('donor', 'name organization phone avatar')
      .sort({ urgency: -1, createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Donation.countDocuments(query);
    res.json({ success: true, donations, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/ngos/assign-volunteer
exports.assignVolunteer = async (req, res) => {
  try {
    const { donationId, volunteerId } = req.body;
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
    if (donation.assignedNgo?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You did not accept this donation' });
    }
    donation.assignedVolunteer = volunteerId;
    donation.status = 'assigned';
    donation.timeline.push({ status: 'assigned', note: 'Volunteer assigned by NGO', updatedBy: req.user.id });
    await donation.save();
    res.json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/ngos/inventory
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({ ngo: req.user.id }).populate('donation', 'title category');
    res.json({ success: true, inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/ngos/inventory
exports.addInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.create({ ...req.body, ngo: req.user.id });
    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/ngos/impact-report
exports.getImpactReport = async (req, res) => {
  try {
    const ngoId = req.user.id;
    const donations = await Donation.find({ assignedNgo: ngoId });
    const byCategory = donations.reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + 1;
      return acc;
    }, {});
    const completedDonations = donations.filter(d => d.status === 'completed');
    const totalServings = completedDonations.reduce((sum, d) => sum + (d.estimatedServings || 0), 0);

    res.json({
      success: true,
      report: {
        totalAccepted: donations.length,
        totalCompleted: completedDonations.length,
        byCategory,
        estimatedPeopleHelped: totalServings,
        monthlyTrend: [],
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
