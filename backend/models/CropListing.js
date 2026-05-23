const mongoose = require('mongoose');

const CropListingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerName: { type: String, required: true },
  sellerContact: { type: String, required: true },
  sellerEmail: { type: String },
  district: { type: String, required: true, index: true },
  state: { type: String, default: 'Karnataka' },
  cropName: { type: String, required: true },
  quantity: { type: Number, required: true },
  pricePerKg: { type: Number, required: true },
  location: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['available', 'sold_out'], default: 'available' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CropListing', CropListingSchema);
