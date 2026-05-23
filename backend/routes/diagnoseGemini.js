const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ============================================================
// MASTER DISEASE KNOWLEDGE BASE
// Maps disease names → treatment products → purchase links
// Covers Karnataka's primary crops: Paddy, Sugarcane, Tomato,
// Ragi, Onion, Maize, Cotton, Groundnut, Arecanut, Coconut
// ============================================================
const TREATMENT_LINKS = {
  // PADDY / RICE
  'leaf blast': {
    chemical: 'Tricyclazole 75 WP (Bayer Beam / Dhanuka Trooper)',
    dose: '0.6g per litre of water, spray at first sign',
    organic: 'Pseudomonas fluorescens @ 2.5 kg/ha in 500L water',
    buyLinks: [
      { name: 'Tricyclazole 75WP — Bayer Beam', url: 'https://www.bayercropscience.in' },
      { name: 'Buy on Katyayani Krishi', url: 'https://katyayanikrishidirect.com/collections/control-blast-in-paddy-with-top-bio-fungicides' },
      { name: 'Buy on Farmkart', url: 'https://farmkart.com/pages/best-fungicides-paddy-blast-india' },
      { name: 'Buy on AgriBegri', url: 'https://agribegri.com/crop-protection/fungicides' },
    ]
  },
  'neck blast': {
    chemical: 'Isoprothiolane 40 EC (Fuji-One) — 1.5ml/L water',
    dose: 'Spray at booting stage and repeat after 10 days',
    organic: 'Silicon-based foliar spray to strengthen cell walls',
    buyLinks: [
      { name: 'Fuji-One Isoprothiolane — Nihon Nohyaku', url: 'https://agribegri.com/crop-protection/fungicides' },
      { name: 'Buy on Farmkart', url: 'https://farmkart.com/pages/best-fungicides-paddy-blast-india' },
      { name: 'Agriplex India Fungicides', url: 'https://agriplexindia.com/collections/fungicides-for-plants' },
    ]
  },
  'bacterial leaf blight': {
    chemical: 'Copper Oxychloride 50 WP — 3g/L + Streptomycin 500ppm',
    dose: 'Spray 2-3 times at 7-day intervals',
    organic: 'Avoid waterlogging; use balanced nitrogen',
    buyLinks: [
      { name: 'Copper Oxychloride — Agriplex', url: 'https://agriplexindia.com/collections/fungicides-for-plants' },
      { name: 'Buy on AgriBegri', url: 'https://agribegri.com/crop-protection/fungicides' },
    ]
  },
  'sheath blight': {
    chemical: 'Hexaconazole 5 EC — 2ml/L or Validamycin 3L',
    dose: 'Apply at tillering stage when lesions appear',
    organic: 'Trichoderma viride @ 2kg/ha',
    buyLinks: [
      { name: 'Hexaconazole — Dharmaj Crop', url: 'https://www.dharmajcrop.com/products/fungicides/' },
      { name: 'Buy on AgriBegri', url: 'https://agribegri.com/crop-protection/fungicides' },
      { name: 'Farmkart Paddy Solutions', url: 'https://farmkart.com' },
    ]
  },

  // SUGARCANE
  'red rot': {
    chemical: 'Carbendazim 50 WP — soak setts in 0.1% solution for 30 min before planting',
    dose: 'Foliar spray 2g/L at first sign of stalk symptoms',
    organic: 'Use disease-free seed cane; remove infected stalks immediately',
    buyLinks: [
      { name: 'Carbendazim — Katyayani Krishi', url: 'https://katyayanikrishidirect.com/collections/fungicides-for-sugarcane-crop-protection' },
      { name: 'Buy on Agriplex', url: 'https://agriplexindia.com/collections/fungicides-for-plants' },
      { name: 'AgriBegri Sugarcane', url: 'https://agribegri.com/crop-protection/fungicides' },
    ]
  },
  'smut': {
    chemical: 'Propiconazole 25 EC — sett treatment before planting',
    dose: 'Soak in 0.1% solution, plant only clean sets',
    organic: 'Roguing: remove whip smut tillers immediately',
    buyLinks: [
      { name: 'Katyayani Sugarcane Fungicides', url: 'https://katyayanikrishidirect.com/collections/fungicides-for-sugarcane-crop-protection' },
      { name: 'Bayer Nativo for Sugarcane', url: 'https://www.bayercropscience.in/en/protect-crops/fungicides-en/nativo' },
    ]
  },
  'wilt': {
    chemical: 'Soil drenching with Carbendazim + Copper Oxychloride',
    dose: '2g + 3g per litre, drench around root zone',
    organic: 'Improve drainage; apply Trichoderma in soil',
    buyLinks: [
      { name: 'Katyayani Sugarcane Products', url: 'https://katyayanikrishidirect.com/collections/fungicides-for-sugarcane-crop-protection' },
      { name: 'AgriBegri Fungicides', url: 'https://agribegri.com/crop-protection/fungicides' },
    ]
  },

  // TOMATO
  'early blight': {
    chemical: 'Mancozeb 75 WP — 2.5g/L + Copper Oxychloride 3g/L (tank mix)',
    dose: 'Spray every 7-10 days starting at first symptoms',
    organic: 'Neem oil 5ml/L + remove affected lower leaves',
    buyLinks: [
      { name: 'Bayer Nativo (Tomato Early Blight)', url: 'https://www.bayercropscience.in/en/protect-crops/fungicides-en/nativo' },
      { name: 'Buy Mancozeb — AgriBegri', url: 'https://agribegri.com/crop-protection/fungicides' },
      { name: 'Farmkart Tomato Solutions', url: 'https://farmkart.com' },
      { name: 'Agriplex India', url: 'https://agriplexindia.com/collections/fungicides-for-plants' },
    ]
  },
  'late blight': {
    chemical: 'Metalaxyl + Mancozeb (Ridomil Gold) — 2g/L water',
    dose: 'Spray preventively before rainy season; repeat every 7 days',
    organic: 'Copper-based sprays; avoid overhead irrigation',
    buyLinks: [
      { name: 'Ridomil Gold — Syngenta', url: 'https://agribegri.com/crop-protection/fungicides' },
      { name: 'Buy on Agriplex', url: 'https://agriplexindia.com/collections/fungicides-for-plants' },
      { name: 'Katyayani Fungicides', url: 'https://katyayanikrishidirect.com' },
    ]
  },
  'leaf curl virus': {
    chemical: 'Imidacloprid 17.8 SL — 0.5ml/L (kills whitefly vector)',
    dose: 'Spray on underside of leaves every 15 days',
    organic: 'Yellow sticky traps + Neem oil 5ml/L',
    buyLinks: [
      { name: 'Imidacloprid — AgriBegri Insecticides', url: 'https://agribegri.com/crop-protection/fungicides' },
      { name: 'Farmkart Tomato Pest Control', url: 'https://farmkart.com' },
    ]
  },
  'septoria leaf spot': {
    chemical: 'Chlorothalonil 75 WP — 2g/L or Azoxystrobin 23 SC — 1ml/L',
    dose: 'Begin spraying at first spot appearance; repeat every 10 days',
    organic: 'Mulching + remove infected plant debris',
    buyLinks: [
      { name: 'Katyayani Fungicides', url: 'https://katyayanikrishidirect.com' },
      { name: 'Agriplex Fungicides', url: 'https://agriplexindia.com/collections/fungicides-for-plants' },
    ]
  },

  // RAGI / FINGER MILLET
  'blast': {
    chemical: 'Tricyclazole 75 WP — 0.6g/L or Carbendazim 50 WP — 1g/L',
    dose: 'Spray at neck emergence; repeat after 10 days',
    organic: 'Use resistant variety; balanced potassium application',
    buyLinks: [
      { name: 'TNAU Fungicide Guide', url: 'https://agritech.tnau.ac.in/crop_protection/pdf/6_Major_use_fungicides.pdf' },
      { name: 'AgriBegri Ragi/Millet', url: 'https://agribegri.com/crop-protection/fungicides' },
      { name: 'Farmkart', url: 'https://farmkart.com' },
    ]
  },
  'downy mildew': {
    chemical: 'Metalaxyl 8% + Mancozeb 64% WP (Ridomil) — 2.5g/L',
    dose: 'Spray at boot leaf stage; repeat twice',
    organic: 'Seed treatment with Metalaxyl before sowing',
    buyLinks: [
      { name: 'Ridomil — Agriplex', url: 'https://agriplexindia.com/collections/fungicides-for-plants' },
      { name: 'AgriBegri Fungicides', url: 'https://agribegri.com/crop-protection/fungicides' },
    ]
  },

  // ONION
  'purple blotch': {
    chemical: 'Iprodione 50 WP — 2g/L or Mancozeb + Carbendazim mix',
    dose: 'Spray every 10-12 days from 30 days after transplanting',
    organic: 'Avoid leaf wetness; use drip irrigation',
    buyLinks: [
      { name: 'AgriBegri Onion Disease', url: 'https://agribegri.com/crop-protection/fungicides' },
      { name: 'Agriplex Fungicides', url: 'https://agriplexindia.com/collections/fungicides-for-plants' },
    ]
  },

  // MAIZE / CORN
  'leaf blight': {
    chemical: 'Mancozeb 75 WP — 2.5g/L + Tebuconazole 25.9 EC — 1ml/L',
    dose: 'Spray at tassel emergence; repeat after 2 weeks',
    organic: 'Crop rotation; avoid dense planting',
    buyLinks: [
      { name: 'TNAU Fungicide Guide', url: 'https://agritech.tnau.ac.in/crop_protection/pdf/6_Major_use_fungicides.pdf' },
      { name: 'AgriBegri Fungicides', url: 'https://agribegri.com/crop-protection/fungicides' },
    ]
  },

  // HEALTHY
  'healthy': {
    chemical: 'No treatment required',
    dose: 'Continue regular crop management practices',
    organic: 'Preventive: Neem oil spray 5ml/L every 21 days as general protection',
    buyLinks: [
      { name: 'General Crop Nutrition — Agriplex', url: 'https://agriplexindia.com' },
      { name: 'Farmkart Crop Management', url: 'https://farmkart.com' },
    ]
  },

  // DEFAULT fallback
  'default': {
    chemical: 'Mancozeb 75 WP — 2.5g/L (broad-spectrum protection)',
    dose: 'Spray 2-3 times at 7-10 day intervals',
    organic: 'Neem oil 5ml/L + remove visibly infected plant parts',
    buyLinks: [
      { name: 'AgriBegri — All Fungicides', url: 'https://agribegri.com/crop-protection/fungicides' },
      { name: 'Agriplex India', url: 'https://agriplexindia.com/collections/fungicides-for-plants' },
      { name: 'Katyayani Krishi Direct', url: 'https://katyayanikrishidirect.com' },
      { name: 'Farmkart India', url: 'https://farmkart.com' },
      { name: 'AgriBegri Shop', url: 'https://agribegri.com' },
    ]
  }
};

function getTreatmentData(diseaseName) {
  if (!diseaseName) return TREATMENT_LINKS['default'];
  const key = diseaseName.toLowerCase().trim();
  // Exact match first
  if (TREATMENT_LINKS[key]) return TREATMENT_LINKS[key];
  // Partial match
  for (const [k, v] of Object.entries(TREATMENT_LINKS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return TREATMENT_LINKS['default'];
}

// ============================================================
// MASTER GEMINI AGRICULTURAL VISION PROMPT
// Engineered for maximum accuracy on real farm photos:
// - Handles low light, blurry, partial leaf, soil background
// - Returns strictly structured JSON for reliable parsing
// - Covers Karnataka's primary crops and diseases
// ============================================================
function buildGeminiPrompt(crop, part) {
  return `You are Dr. Krishnaswamy, a senior plant pathologist with 25 years of experience diagnosing crop diseases in Karnataka, India. You specialize in ${crop} and are examining its ${part}.

TASK: Analyze this farm photograph and provide a precise disease diagnosis. The farmer has limited English and is depending on this for their livelihood. Be accurate, practical, and clear.

ANALYSIS INSTRUCTIONS:
- Examine the visual symptoms: color changes, spots, lesions, wilting, discoloration, rotting, powder, rust
- Consider the crop type (${crop}) and the plant part shown (${part})
- Even if the image is slightly blurry or taken in poor lighting, use your best expert judgment
- Look for: fungal symptoms (spots, powder, rust), bacterial symptoms (water-soaked, yellowing), viral symptoms (mosaic, curl), nutrient deficiencies (chlorosis, necrosis), or healthy appearance
- Common diseases for ${crop} ${part} in Karnataka: blast, blight, rust, red rot, smut, wilt, mosaic, leaf curl, septoria, downy mildew

RESPONSE FORMAT: Return ONLY a valid JSON object, no other text, no markdown, no explanation:
{
  "disease": "exact disease name in English (e.g., Leaf Blast, Red Rot, Early Blight, Healthy)",
  "confidence": 0.85,
  "severity": "None | Mild | Moderate | High | Critical",
  "symptoms_observed": "brief description of what you see in the image",
  "immediate_action": "single most important immediate action the farmer should take TODAY",
  "chemical_treatment": "specific product name + dosage in simple terms",
  "organic_alternative": "natural or organic treatment option",
  "prevention": "how to prevent this disease next season",
  "yield_impact": "estimated % yield loss if untreated",
  "spread_risk": "Low | Medium | High",
  "isSick": true
}

If the plant appears HEALTHY, set "disease" to "Healthy", "isSick" to false, "severity" to "None".
If the image is completely unrecognizable (not a plant at all), set "disease" to "Image Unclear", "confidence" to 0.1, "isSick" to false.
NEVER return an empty response. Always provide your best expert assessment.`;
}

// POST /api/diagnose/gemini
router.post('/', auth, async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg', crop, part } = req.body;

  if (!imageBase64 || !crop || !part) {
    return res.status(400).json({ error: 'imageBase64, crop, and part are required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'Gemini API key not configured', fallback: true });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent([
      buildGeminiPrompt(crop, part),
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      },
    ]);

    const rawText = result.response.text().trim();

    // Parse the JSON response
    let diagnosis;
    try {
      // Strip markdown code fences if present
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      diagnosis = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[Gemini] JSON parse failed:', rawText.substring(0, 200));
      // Attempt to extract key fields via regex as last resort
      diagnosis = {
        disease: rawText.match(/"disease":\\s*"([^"]+)"/)?.[1] || 'Unable to Parse',
        confidence: 0.7,
        severity: rawText.match(/"severity":\\s*"([^"]+)"/)?.[1] || 'Unknown',
        immediate_action: 'Please consult your local agricultural officer.',
        chemical_treatment: 'Consult your local KVK (Krishi Vigyan Kendra)',
        organic_alternative: 'Neem oil spray 5ml/L as general protection',
        prevention: 'Regular field scouting and timely intervention',
        yield_impact: 'Unknown',
        spread_risk: 'Medium',
        isSick: true,
      };
    }

    // Enrich with our curated treatment knowledge base + buy links
    const treatmentData = getTreatmentData(diagnosis.disease);
    const response = {
      ...diagnosis,
      chemical_treatment: diagnosis.chemical_treatment || treatmentData.chemical,
      dose: treatmentData.dose,
      organic_alternative: diagnosis.organic_alternative || treatmentData.organic,
      buyLinks: treatmentData.buyLinks,
      runMode: 'gemini-vision',
      modelVersion: 'gemini-2.0-flash',
      analyzedAt: new Date().toISOString(),
    };

    res.json(response);

  } catch (err) {
    console.error('[Gemini Diagnose Error]:', err.message);
    // Return fallback flag so frontend can retry with FastAPI
    res.status(500).json({
      error: err.message,
      fallback: true,
    });
  }
});

module.exports = router;
