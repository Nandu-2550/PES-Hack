const mongoose = require("mongoose");

const locationFields = {
  district: { type: String, required: true, trim: true },
  state:    { type: String, required: true, trim: true },
  country:  { type: String, required: true, default: 'India', trim: true },
};

const JobSchema = new mongoose.Schema({
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ...locationFields,
  workType: {
    type: String,
    enum: ["Harvesting", "Weeding", "Planting", "Irrigation", "Spraying", "General"],
    required: true
  },
  workersNeeded: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  salaryAmount: { type: Number, required: true },
  salaryType: {
    type: String,
    enum: ["per_day", "contract"],
    required: true
  },
  amenities: { type: [String], default: [] },
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Job", JobSchema);
