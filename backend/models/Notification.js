const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['donation_created', 'donation_accepted', 'volunteer_assigned', 'pickup_done', 'delivery_done', 'ngo_verified', 'account_suspended', 'new_message'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  relatedDonation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
