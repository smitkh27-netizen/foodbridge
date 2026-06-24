const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const User = require('../models/User');

const sendNotification = async (io, recipientId, type, title, message, donationId = null) => {
  const notif = await Notification.create({ recipient: recipientId, type, title, message, relatedDonation: donationId });
  io.to(recipientId.toString()).emit('new_notification', notif);
};

// @POST /api/donations
exports.createDonation = async (req, res) => {
  try {
    const io = req.app.get('io');
    const images = req.files ? req.files.map((f) => f.path) : [];
    const donation = await Donation.create({ ...req.body, donor: req.user.id, images });

    donation.timeline.push({ status: 'pending', note: 'Donation request created', updatedBy: req.user.id });
    await donation.save();

    await User.findByIdAndUpdate(req.user.id, { $inc: { totalDonations: 1 } });

    // Notify all NGOs
    const ngos = await User.find({ role: 'ngo', isActive: true, ngoVerified: true });
    for (const ngo of ngos) {
      await sendNotification(io, ngo._id, 'donation_created', 'New Donation Available', `${req.user.name} listed a ${donation.category} donation near you.`, donation._id);
    }

    res.status(201).json({ success: true, donation: await donation.populate('donor', 'name email phone') });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/donations
exports.getDonations = async (req, res) => {
  try {
    const { category, status, city, urgency, page = 1, limit = 10 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (city) query['pickupLocation.city'] = new RegExp(city, 'i');

    if (req.user.role === 'donor') query.donor = req.user.id;
    if (req.user.role === 'ngo') query.status = query.status || { $in: ['pending', 'accepted'] };
    if (req.user.role === 'volunteer') query.assignedVolunteer = req.user.id;

    const donations = await Donation.find(query)
      .populate('donor', 'name email phone avatar organization')
      .populate('assignedNgo', 'name ngoName')
      .populate('assignedVolunteer', 'name phone')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Donation.countDocuments(query);
    res.json({ success: true, donations, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/donations/:id
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone avatar organization address')
      .populate('assignedNgo', 'name ngoName email phone')
      .populate('assignedVolunteer', 'name email phone');
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
    res.json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/donations/:id/status
exports.updateDonationStatus = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { status, note, volunteerId } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });

    donation.status = status;
    donation.timeline.push({ status, note: note || `Status updated to ${status}`, updatedBy: req.user.id });

    if (status === 'accepted') donation.assignedNgo = req.user.id;
    if (status === 'assigned' && volunteerId) donation.assignedVolunteer = volunteerId;
    if (req.files?.length) {
      if (status === 'picked_up') donation.proofOfCollection = req.files.map((f) => f.path);
      if (status === 'delivered') donation.proofOfDelivery = req.files.map((f) => f.path);
    }

    await donation.save();

    // Notifications
    const notifMap = {
      accepted: { to: donation.donor, type: 'donation_accepted', title: 'Donation Accepted!', msg: `Your ${donation.category} donation has been accepted by an NGO.` },
      assigned: { to: donation.donor, type: 'volunteer_assigned', title: 'Volunteer Assigned', msg: `A volunteer has been assigned to pick up your donation.` },
      picked_up: { to: donation.donor, type: 'pickup_done', title: 'Pickup Complete', msg: `Your donation has been picked up by the volunteer.` },
      delivered: { to: donation.donor, type: 'delivery_done', title: 'Donation Delivered!', msg: `Your ${donation.category} donation has been delivered to beneficiaries.` },
    };
    if (notifMap[status]) {
      const n = notifMap[status];
      await sendNotification(io, n.to, n.type, n.title, n.msg, donation._id);
    }

    res.json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/donations/:id
exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ success: false, message: 'Not found' });
    if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await donation.deleteOne();
    res.json({ success: true, message: 'Donation deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
