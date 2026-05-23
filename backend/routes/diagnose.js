const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const ScanLog = require('../models/ScanLog');
const auth = require('../middleware/auth');

// Configure multer for temp file uploads
const upload = multer({ dest: 'uploads/' });

// Helper to delay execution
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to execute REST calls with retries and backoff on 429 Rate Limits
async function callApiWithRetry(url, payload, headers, retries = 3, delay = 1500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.post(url, payload, { headers });
      return res;
    } catch (err) {
      const status = err.response?.status;
      if (status === 429 && i < retries - 1) {
        const waitTime = delay * (i + 1);
        console.warn(`[Diagnose API] 429 Rate limited. Retrying in ${waitTime}ms... (Attempt ${i + 1}/${retries})`);
        await wait(waitTime);
        continue;
      }
      throw err;
    }
  }
}

const DIAGNOSIS_PROMPT = `You are an expert agricultural plant pathologist specializing in Indian crops, 
especially Karnataka's common crops like rice, sugarcane, tomato, onion, cotton, ragi, jowar, maize, 
groundnut, and banana.

Analyze this plant image and provide a diagnosis in the following JSON format ONLY:
{
  "identified": true,
  "cropName": "name of the crop",
  "diseaseName": "name of the disease or 'Healthy'",
  "confidence": 0.85,
  "severity": "mild/moderate/severe/none",
  "symptoms": ["symptom1", "symptom2"],
  "causes": "brief cause description",
  "treatment": {
    "organic": ["organic treatment 1", "organic treatment 2"],
    "chemical": ["chemical treatment 1"],
    "preventive": ["prevention tip 1", "prevention tip 2"]
  },
  "immediateAction": "What the farmer should do right now",
  "estimatedYieldLoss": "e.g. 20-30% if untreated"
}

If the image is not a plant or is too unclear to analyze, set identified: false.
Be accurate and helpful for Indian farmers. Confidence should reflect your actual certainty (0.0-1.0).`;

// POST /api/diagnose — Upload image and diagnose disease via Claude/Gemini Vision APIs
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';

    let diagnosis = null;

    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key') {
      // 1. Claude Vision API
      const response = await callApiWithRetry(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mimeType, data: base64Image }
              },
              { type: 'text', text: DIAGNOSIS_PROMPT }
            ]
          }]
        },
        {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      );

      const responseText = response.data.content[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid response format from Claude');
      diagnosis = JSON.parse(jsonMatch[0]);

    } else if (process.env.GEMINI_API_KEY) {
      // 2. Gemini Vision API (gemini-2.5-flash)
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const response = await callApiWithRetry(
        url,
        {
          contents: [{
            parts: [
              { text: DIAGNOSIS_PROMPT },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Image
                }
              }
            ]
          }]
        },
        { 'Content-Type': 'application/json' }
      );

      const responseText = response.data.candidates[0].content.parts[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Invalid response format from Gemini');
      diagnosis = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No Vision AI API keys configured (ANTHROPIC_API_KEY or GEMINI_API_KEY)');
    }

    // Clean up temp file safely
    try {
      fs.unlinkSync(imagePath);
    } catch (e) {
      console.warn('Temp file cleanup failed:', e);
    }

    // Record the scanner log to MongoDB ScanLog in the background
    try {
      await new ScanLog({
        userId: req.user.id,
        crop: req.body.crop || diagnosis.cropName || 'Unknown',
        part: req.body.part || 'Leaf',
        result: diagnosis.diseaseName || 'Healthy',
        scannedAt: new Date(),
        syncedAt: new Date()
      }).save();
    } catch (dbErr) {
      console.warn('Failed to save scan log:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      diagnosis,
      confidence: Math.round((diagnosis.confidence || 0.95) * 100)
    });

  } catch (error) {
    console.error('Diagnosis error:', error.response?.data || error.message);
    
    // Attempt temp file cleanup on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }

    return res.status(500).json({
      success: false,
      error: 'Diagnosis failed',
      message: error.message
    });
  }
});

// GET /api/diagnose/sync — Sync offline scan logs
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
