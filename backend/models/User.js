const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['donor', 'ngo', 'volunteer', 'admin'], required: true },
  avatar: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  otp: { type: String },
  otpExpiry: { type: Date },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: { lat: Number, lng: Number },
  },
  // Donor specific
  organization: { type: String },
  donorType: { type: String, enum: ['restaurant', 'hotel', 'catering', 'individual', 'event', 'other'] },
  totalDonations: { type: Number, default: 0 },
  // NGO specific
  ngoName: { type: String },
  ngoRegNumber: { type: String },
  ngoVerified: { type: Boolean, default: false },
  // Volunteer specific
  volunteerPoints: { type: Number, default: 0 },
  totalPickups: { type: Number, default: 0 },
  availability: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
