const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
  category: { type: String, enum: ['food', 'clothes', 'toys', 'books', 'other'] },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'pieces' },
  receivedDate: { type: Date, default: Date.now },
  distributedQuantity: { type: Number, default: 0 },
  remainingQuantity: { type: Number },
  distributedTo: [
    {
      beneficiaryName: String,
      quantity: Number,
      date: { type: Date, default: Date.now },
      notes: String,
    },
  ],
  status: { type: String, enum: ['available', 'partially_distributed', 'fully_distributed'], default: 'available' },
}, { timestamps: true });

inventorySchema.pre('save', function (next) {
  this.remainingQuantity = this.quantity - this.distributedQuantity;
  if (this.distributedQuantity === 0) this.status = 'available';
  else if (this.distributedQuantity >= this.quantity) this.status = 'fully_distributed';
  else this.status = 'partially_distributed';
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
