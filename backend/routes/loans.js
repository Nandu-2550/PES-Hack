const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');

const SEED_LOANS = [
  {
    providerName: 'State Bank of India — Kisan Credit Card',
    description: 'Flexible crop loans for farming expenses with no collateral up to ₹1.6 lakh.',
    interestRate: '7% p.a. (with interest subvention: effectively 4%)',
    maxAmount: '₹3,00,000',
    eligibility: 'All farmers, sharecroppers, oral lessees, self-help groups',
    guidelinesLink: 'https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card',
  },
  {
    providerName: 'NABARD — Agriculture Infrastructure Fund',
    description: 'Long-term financing for post-harvest management, logistics, and farm infrastructure.',
    interestRate: '9% p.a. (3% interest subvention available)',
    maxAmount: '₹2 Crore',
    eligibility: 'Farmers, FPOs, PACS, SHGs, Agri-entrepreneurs',
    guidelinesLink: 'https://www.nabard.org/content.aspx?id=591',
  },
  {
    providerName: 'Karnataka Rajya Raitha Seva Sangha — Crop Loan',
    description: 'State-specific short-term crop loan for Karnataka farmers at subsidized rates.',
    interestRate: '0% (fully subsidized for loans up to ₹3 lakh)',
    maxAmount: '₹3,00,000',
    eligibility: 'Karnataka-registered farmers with land records',
    guidelinesLink: 'https://raitamitra.karnataka.gov.in',
  },
  {
    providerName: 'HDFC Bank — Kisan Gold Card',
    description: 'Revolving credit facility for farmers covering crop production, allied activities.',
    interestRate: '8.5% p.a.',
    maxAmount: '₹10,00,000',
    eligibility: 'Land-owning farmers with 2+ years farming record',
    guidelinesLink: 'https://www.hdfcbank.com/personal/borrow/popular-loans/kisan-gold-card',
  },
];

// GET /api/loans — Returns active loan providers (seeds if empty)
router.get('/', async (req, res) => {
  try {
    let loans = await Loan.find({ isActive: true });
    if (loans.length === 0) {
      loans = await Loan.insertMany(SEED_LOANS);
    }
    res.json(loans);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
