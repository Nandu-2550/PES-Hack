const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CropListing = require('../models/CropListing');
const User = require('../models/User');
const { sendCropNotification } = require('../utils/mailer');

// POST /api/crops — Create listing
router.post('/', auth, async (req, res) => {
  try {
    const listing = await new CropListing({
      seller: req.user.id,
      sellerName: req.user.name,
      sellerContact: req.user.phone,
      sellerEmail: req.user.email,
      district: req.user.district,
      state: req.user.state,
      ...req.body,
    }).save();

    // Email all users in same district who have email addresses
    try {
      const regionalUsers = await User.find({
        district: req.user.district,
        email: { $exists: true, $ne: null },
        _id: { $ne: req.user.id },
      }).select('name email');

      for (const u of regionalUsers.slice(0, 50)) {
        await sendCropNotification({
          toEmail: u.email,
          toName: u.name,
          lang: 'en', // default — user-level lang preference can be added later
          crop: listing,
        });
      }
    } catch (mailErr) {
      console.error('[crops] Email batch failed:', mailErr.message);
    }

    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// GET /api/crops?district=Mandya — Browse available listings
router.get('/', auth, async (req, res) => {
  try {
    const district = req.query.district || req.user.district;
    const listings = await CropListing.find({ district, status: 'available' })
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// GET /api/crops/mine — My listings
router.get('/mine', auth, async (req, res) => {
  try {
    const listings = await CropListing.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// PATCH /api/crops/:id/soldout — Mark as sold
router.patch('/:id/soldout', auth, async (req, res) => {
  try {
    const listing = await CropListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ msg: 'Not found' });
    if (listing.seller.toString() !== req.user.id)
      return res.status(401).json({ msg: 'Not authorized' });
    listing.status = 'sold_out';
    await listing.save();
    // Emit socket event so all connected clients remove this from their list
    req.io.emit('crop:soldout', { id: listing._id });
    res.json(listing);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// DELETE /api/crops/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await CropListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ msg: 'Not found' });
    if (listing.seller.toString() !== req.user.id)
      return res.status(401).json({ msg: 'Not authorized' });
    await listing.deleteOne();
    req.io.emit('crop:deleted', { id: req.params.id });
    res.json({ msg: 'Listing removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
