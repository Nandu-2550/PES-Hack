const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  providerName: { type: String, required: true },
  description: { type: String },
  interestRate: { type: String, required: true },
  maxAmount: { type: String },
  eligibility: { type: String },
  guidelinesLink: { type: String, required: true },
  logoUrl: { type: String },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Loan', LoanSchema);
