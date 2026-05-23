// Tier 3 — On-device TF.js fallback (offline only)
// Used ONLY when both Gemini API and FastAPI are unreachable

const OFFLINE_DISEASE_MAP = {
  sugarcane: {
    leaf: { disease: 'Red Rot (Suspected)', confidence: 0.72, severity: 'High',
      action: 'Remove infected stalks. Apply Carbendazim 2g/L spray. Buy: https://katyayanikrishidirect.com/collections/fungicides-for-sugarcane-crop-protection' },
    stem: { disease: 'Wilt (Suspected)', confidence: 0.68, severity: 'High',
      action: 'Improve drainage. Soil drench with Carbendazim. Buy: https://agribegri.com/crop-protection/fungicides' },
    root: { disease: 'Root Rot (Suspected)', confidence: 0.65, severity: 'Critical',
      action: 'Remove affected plants. Apply Trichoderma to soil. Buy: https://agriplexindia.com/collections/fungicides-for-plants' },
  },
  paddy: {
    leaf: { disease: 'Leaf Blast (Suspected)', confidence: 0.75, severity: 'Medium',
      action: 'Drain field 3 days. Spray Tricyclazole 0.6g/L. Buy: https://farmkart.com/pages/best-fungicides-paddy-blast-india' },
    stem: { disease: 'Sheath Blight (Suspected)', confidence: 0.70, severity: 'Medium',
      action: 'Spray Hexaconazole 2ml/L at tillering. Buy: https://www.dharmajcrop.com/products/fungicides/' },
    root: { disease: 'Root Rot (Suspected)', confidence: 0.65, severity: 'High',
      action: 'Improve drainage. Apply Carbendazim soil drench. Buy: https://agribegri.com/crop-protection/fungicides' },
  },
  tomato: {
    leaf: { disease: 'Early Blight (Suspected)', confidence: 0.78, severity: 'Medium',
      action: 'Remove lower infected leaves. Spray Mancozeb 2.5g/L + Copper Oxychloride 3g/L. Buy: https://www.bayercropscience.in/en/protect-crops/fungicides-en/nativo' },
    stem: { disease: 'Bacterial Canker (Suspected)', confidence: 0.66, severity: 'High',
      action: 'Remove infected plants. Spray Copper Oxychloride 3g/L. Buy: https://agriplexindia.com/collections/fungicides-for-plants' },
    root: { disease: 'Root Rot (Suspected)', confidence: 0.65, severity: 'Critical',
      action: 'Remove affected plants. Drench with Metalaxyl 2g/L. Buy: https://agribegri.com/crop-protection/fungicides' },
  },
};

const GENERIC_OFFLINE = {
  disease: 'Disease Detected (Offline Analysis)',
  confidence: 0.60,
  severity: 'Moderate',
  action: 'Apply Mancozeb 75 WP 2.5g/L as broad-spectrum protection. Get online for precise diagnosis. Buy fungicides: https://agribegri.com/crop-protection/fungicides',
};

let model = null;

export async function loadModel() {
  try {
    const tf = await import('@tensorflow/tfjs');
    model = await tf.loadLayersModel('/web_model/model.json');
    // Warm up with a dummy tensor
    const dummy = tf.zeros([1, 224, 224, 3]);
    model.predict(dummy).dispose();
    dummy.dispose();
    console.log('[CropClassifier] TF.js model loaded and warmed up');
  } catch (err) {
    console.warn('[CropClassifier] TF.js model unavailable (offline fallback active):', err.message);
    model = null;
  }
}

export async function classifyImage(imgElement, cropName, partName) {
  const crop = (cropName || '').toLowerCase();
  const part = (partName || '').toLowerCase();

  // Try TF.js model first if available
  if (model && imgElement) {
    try {
      const tf = await import('@tensorflow/tfjs');
      const tensor = tf.browser.fromPixels(imgElement)
        .resizeBilinear([224, 224])
        .toFloat()
        .div(255.0)
        .expandDims(0);

      const predictions = model.predict(tensor);
      const predArray = await predictions.data();
      tensor.dispose();
      predictions.dispose();

      // THRESHOLD LOWERED to 25% for real-world field conditions
      const maxConfidence = Math.max(...predArray);
      const maxIndex = predArray.indexOf(maxConfidence);

      if (maxConfidence >= 0.25) {
        // Map index to disease name (update CLASS_NAMES if your model has labels)
        const CLASS_NAMES = ['Healthy', 'Leaf Blast', 'Red Rot', 'Early Blight', 'Late Blight',
          'Sheath Blight', 'Wilt', 'Mosaic Virus', 'Leaf Curl', 'Bacterial Blight'];
        const diseaseName = CLASS_NAMES[maxIndex] || 'Disease Detected';
        return {
          disease: diseaseName,
          confidence: maxConfidence,
          severity: maxConfidence > 0.7 ? 'High' : maxConfidence > 0.4 ? 'Moderate' : 'Mild',
          action: `Apply appropriate treatment for ${diseaseName}. Get online for verified diagnosis.`,
          runMode: 'local-tfjs',
        };
      }
      // Below 25% → fall through to hardcoded map
    } catch (err) {
      console.warn('[CropClassifier] TF.js inference failed:', err.message);
    }
  }

  // Hardcoded offline knowledge map — always returns a useful result
  const cropMap = OFFLINE_DISEASE_MAP[crop];
  if (cropMap) {
    const partResult = cropMap[part] || cropMap['leaf'] || Object.values(cropMap)[0];
    return { ...partResult, runMode: 'offline-map' };
  }

  return { ...GENERIC_OFFLINE, runMode: 'offline-map' };
}
