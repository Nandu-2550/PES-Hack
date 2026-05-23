const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const User = require('../models/User');
const { sendSchemeNotification } = require('../utils/mailer');

const SEED_SCHEMES = [
  {
    title: 'PM-KISAN Samman Nidhi',
    summary: 'Direct income support of ₹6,000/year to eligible farmer families in 3 installments.',
    applicationLink: 'https://pmkisan.gov.in',
  },
  {
    title: 'Pradhan Mantri Fasal Bima Yojana',
    summary: 'Crop insurance scheme providing financial support to farmers suffering crop loss due to natural calamities.',
    applicationLink: 'https://pmfby.gov.in',
  },
  {
    title: 'Kisan Credit Card (KCC)',
    summary: 'Provides farmers timely credit for agricultural needs at subsidized interest rates.',
    applicationLink: 'https://www.india.gov.in/spotlight/kisan-credit-card',
  },
];

// GET /api/schemes — Returns active schemes (seeds DB if empty)
router.get('/', async (req, res) => {
  try {
    let schemes = await Scheme.find({ isActive: true }).sort({ publishedAt: -1 });
    if (schemes.length === 0) {
      schemes = await Scheme.insertMany(SEED_SCHEMES);
    }
    res.json(schemes);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// POST /api/schemes — Admin adds new scheme + emails all users
router.post('/', async (req, res) => {
  try {
    const scheme = await new Scheme(req.body).save();
    // Notify all registered users with email
    const users = await User.find({ email: { $exists: true, $ne: null } }).select('name email');
    for (const u of users.slice(0, 100)) {
      await sendSchemeNotification({ toEmail: u.email, toName: u.name, lang: 'en', scheme });
    }
    res.json(scheme);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
