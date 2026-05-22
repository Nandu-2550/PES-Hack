const mongoose = require("mongoose");

const EquipmentSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  district: { type: String, required: true, index: true },
  category: {
    type: String,
    enum: ["Tractor", "JCB", "Harvester", "Tiller", "Sprayer", "Milling Machine", "Water Pump"],
    required: true
  },
  brand: { type: String },
  description: { type: String },
  pricePerDay: { type: Number, required: true },
  available: { type: Boolean, default: true },
  contactPhone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Equipment", EquipmentSchema);
