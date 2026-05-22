const express = require('express');
const router = express.Router();
const ScanLog = require('../models/ScanLog');
const auth = require('../middleware/auth');

router.post('/sync', auth, async (req, res) => {
  try {
    const { logs } = req.body;
    
    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const docs = logs.map(log => ({
      userId: req.user._id,
      crop: log.crop,
      part: log.part,
      result: log.result,
      scannedAt: new Date(log.scannedAt),
      syncedAt: new Date()
    }));

    await ScanLog.insertMany(docs);

    res.json({ message: `Successfully synced ${logs.length} logs`, syncedCount: logs.length });
  } catch (error) {
    console.error('Offline sync error:', error);
    res.status(500).json({ message: 'Server error during sync' });
  }
});

module.exports = router;
