const mongoose = require('mongoose');

const scanLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crop: { type: String, required: true },
  part: { type: String, required: true },
  result: {
    disease: String,
    confidence: Number,
    severity: String,
    action: String,
    runMode: String,
    modelVersion: String
  },
  scannedAt: { type: Date, required: true },
  syncedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScanLog', scanLogSchema);
