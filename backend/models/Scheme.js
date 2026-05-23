const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  applicationLink: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Scheme', SchemeSchema);
