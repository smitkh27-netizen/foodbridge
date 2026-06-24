const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['food', 'clothes', 'toys', 'books', 'other'], required: true },
  title: { type: String, required: true },
  description: { type: String },
  quantity: { type: String, required: true },
  unit: { type: String, default: 'pieces' },
  images: [{ type: String }],
  expiryTime: { type: Date }, // for food
  pickupLocation: {
    address: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    coordinates: { lat: Number, lng: Number },
  },
  specialInstructions: { type: String },
  urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'assigned', 'picked_up', 'delivered', 'completed', 'cancelled'],
    default: 'pending',
  },
  assignedNgo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timeline: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
      note: String,
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  ],
  proofOfCollection: [{ type: String }],
  proofOfDelivery: [{ type: String }],
  estimatedServings: { type: Number },
  feedbackRating: { type: Number, min: 1, max: 5 },
  feedbackNote: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
