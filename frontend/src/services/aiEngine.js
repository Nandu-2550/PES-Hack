/**
 * aiEngine.js — Offline-capable TensorFlow.js inference engine for AgriShield AI.
 *
 * Model loading strategy:
 *  1. Try @tensorflow-models/mobilenet (CDN — cached by SW after first load).
 *  2. If CDN unavailable (offline, first boot without cache), fall back to the
 *     locally hosted model at /web_model/model.json.
 *
 * Results with confidence >= 0.50 are logged to IndexedDB via localforage so
 * they survive app restarts and can be synced later.
 */

import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import localforage from 'localforage';

// ---------------------------------------------------------------------------
// Diagnosis log store — separate from the existing offline-logs store
// ---------------------------------------------------------------------------
const diagnosisStore = localforage.createInstance({
  name: 'agrishield-diagnoses',
  storeName: 'scan_logs',
});

// ---------------------------------------------------------------------------
// Module-level model cache — loaded once per browser session
// ---------------------------------------------------------------------------
/** @type {import('@tensorflow-models/mobilenet').MobileNet | tf.GraphModel | null} */
let _model = null;
let _loadPromise = null;

/**
 * loadModel()
 *
 * Returns the cached model if already loaded.
 * Otherwise initialises TF.js, loads MobileNet v2, and caches it.
 * Falls back to the locally-served graph model when CDN is unreachable.
 *
 * @returns {Promise<import('@tensorflow-models/mobilenet').MobileNet | tf.GraphModel>}
 */
export async function loadModel() {
  if (_model) return _model;

  // Deduplicate concurrent callers — return the same promise to all of them
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    // Step 1: initialise the WebGL backend (no-op if already ready)
    await tf.ready();

    try {
      // Step 2a: try loading MobileNet v2 from CDN / SW-cached CDN response
      _model = await mobilenet.load({ version: 2, alpha: 1.0 });
      console.info('AgriEngine: MobileNet v2 loaded from CDN/cache');
    } catch (cdnErr) {
      console.warn('AgriEngine: CDN model unavailable — falling back to /web_model/', cdnErr);
      try {
        // Step 2b: fall back to the bundled TF SavedModel
        _model = await tf.loadGraphModel('/web_model/model.json');
        console.info('AgriEngine: local graph model loaded from /web_model/');
      } catch (localErr) {
        console.error('AgriEngine: both model sources failed', localErr);
        _model = null;
        _loadPromise = null; // allow retrying later
        throw localErr;
      }
    }

    return _model;
  })();

  return _loadPromise;
}

// ---------------------------------------------------------------------------
// Disease remedies lookup — keyed by MobileNet className (or mapped label)
// ---------------------------------------------------------------------------
/**
 * REMEDIES
 *
 * Provides treatment guidance keyed by the disease label returned by the
 * classifier. Covers common diseases affecting Karnataka crops.
 *
 * Keys are matched case-insensitively via the helper below.
 */
export const REMEDIES = {
  'leaf blight': {
    treatment:
      'Spray Mancozeb 75 WP (2.5 g/L) or Copper Oxychloride (3 g/L) at 7-day intervals. ' +
      'Remove and burn heavily infected leaves. Avoid overhead irrigation. Ensure proper spacing for air circulation.',
    severity: 'High',
  },
  'powdery mildew': {
    treatment:
      'Apply Sulphur 80 WP (2–3 g/L) or Hexaconazole 5 EC (1 mL/L). ' +
      'Spray in the early morning or evening. Avoid high nitrogen fertilisation. ' +
      'Repeat after 10–14 days if symptoms persist.',
    severity: 'Medium',
  },
  'rust': {
    treatment:
      'Spray Propiconazole 25 EC (1 mL/L) or Triadimefon 25 WP (1 g/L). ' +
      'Apply at first sign of orange/brown pustules. ' +
      'Use resistant varieties in subsequent seasons. Destroy crop debris post-harvest.',
    severity: 'Medium',
  },
  'mosaic virus': {
    treatment:
      'No chemical cure exists — focus on vector control. ' +
      'Spray Imidacloprid 17.8 SL (0.5 mL/L) to control aphid/whitefly vectors. ' +
      'Uproot and destroy infected plants immediately to prevent spread. ' +
      'Use virus-free certified seed in the next cycle.',
    severity: 'High',
  },
  'stem rot': {
    treatment:
      'Drench soil around the stem with Carbendazim 50 WP (1 g/L) or Trichoderma viride bio-fungicide. ' +
      'Improve field drainage to reduce waterlogging. ' +
      'Remove and burn infected plant material. ' +
      'Avoid wounding the stem during intercultural operations.',
    severity: 'High',
  },
  'early blight': {
    treatment:
      'Apply Chlorothalonil 75 WP (2 g/L) or Mancozeb + Metalaxyl at 7-day intervals. ' +
      'Start sprays from seedling stage. ' +
      'Maintain balanced potassium nutrition. Remove lower infected leaves.',
    severity: 'Medium',
  },
  'late blight': {
    treatment:
      'Apply Metalaxyl + Mancozeb (Ridomil Gold) at 2.5 g/L immediately. ' +
      'Switch to Cymoxanil + Mancozeb if resistance suspected. ' +
      'Spray every 5–7 days during humid conditions. ' +
      'Destroy crop debris and avoid overhead irrigation.',
    severity: 'High',
  },
  'downy mildew': {
    treatment:
      'Spray Metalaxyl 8% + Mancozeb 64% WP (2.5 g/L) or Fosetyl-Al (2.5 g/L). ' +
      'Apply preventively before flowering in humid conditions. ' +
      'Remove infected shoots. Ensure good air circulation between plants.',
    severity: 'Medium',
  },
  'red rot': {
    treatment:
      'Remove and destroy infected stalks immediately — do not compost. ' +
      'Drench setts in Carbendazim 50 WP (1 g/L) before planting. ' +
      'Use disease-free seed cane. Avoid water stagnation in fields.',
    severity: 'High',
  },
  'healthy': {
    treatment:
      'No disease detected. Continue regular monitoring every 7–10 days. ' +
      'Maintain balanced NPK nutrition and adequate irrigation. ' +
      'Apply preventive neem oil spray (5 mL/L) during monsoon onset.',
    severity: 'None',
  },
};

/**
 * getRemedy(label)
 *
 * Returns the REMEDIES entry for the given label.
 * Performs a case-insensitive partial match so MobileNet's verbose class names
 * (e.g. "valley oak, Quercus lobata") can still hit a key like "healthy".
 *
 * @param {string} label
 * @returns {{ treatment: string, severity: string }}
 */
function getRemedy(label) {
  const lower = label.toLowerCase();

  // Exact key match first
  if (REMEDIES[lower]) return REMEDIES[lower];

  // Partial match — check if any REMEDIES key appears in the label
  for (const key of Object.keys(REMEDIES)) {
    if (lower.includes(key)) return REMEDIES[key];
  }

  // Default: treat as unknown/healthy
  return {
    treatment:
      'Could not find specific treatment data for this condition. ' +
      'Consult your local Krishi Vigyan Kendra (KVK) for guidance. ' +
      'Document symptoms and photograph the affected area for expert review.',
    severity: 'Unknown',
  };
}

// ---------------------------------------------------------------------------
// Core inference function
// ---------------------------------------------------------------------------

/**
 * runDiagnosis(imgElement, cropName, partName)
 *
 * Runs the full inference pipeline and returns a structured result object.
 *
 * @param {HTMLImageElement} imgElement - The image element to classify.
 * @param {string} cropName - The crop selected by the farmer.
 * @param {string} partName - The plant part (Leaf, Stem, Root, Fruit / Flower).
 * @returns {Promise<DiagnosisResult | DiagnosisError>}
 *
 * @typedef {{ label: string, confidence: number, cropName: string, partName: string, treatment: string, severity: string }} DiagnosisResult
 * @typedef {{ error: true, message: string }} DiagnosisError
 */
export async function runDiagnosis(imgElement, cropName, partName) {
  try {
    const model = await loadModel();

    let predictions;

    if (typeof model.classify === 'function') {
      // MobileNet API — returns [{ className, probability }]
      predictions = await model.classify(imgElement);
    } else {
      // Fallback: raw tf.GraphModel — run manual tensor pipeline
      const tensor = tf.browser
        .fromPixels(imgElement)
        .resizeBilinear([224, 224])
        .div(255.0)
        .expandDims(0);

      const output = model.predict(tensor);
      const probabilities = await output.data();
      tensor.dispose();
      output.dispose();

      // Build a predictions-like array from raw softmax output
      predictions = Array.from(probabilities).map((prob, idx) => ({
        className: `class_${idx}`,
        probability: prob,
      }));
    }

    // Sort by probability descending and take the top prediction
    predictions.sort((a, b) => b.probability - a.probability);
    const top = predictions[0];

    const label = top.className;
    const confidence = top.probability;

    // Look up treatment data
    const remedy = getRemedy(label);

    const result = {
      label,
      confidence,
      cropName,
      partName,
      treatment: remedy.treatment,
      severity: remedy.severity,
    };

    // Log to IndexedDB only when confidence is actionable (>= 50%)
    if (confidence >= 0.50) {
      try {
        await diagnosisStore.setItem(`diagnosis_${Date.now()}`, {
          cropName,
          partName,
          label,
          confidence,
          severity: remedy.severity,
          timestamp: new Date().toISOString(),
        });
      } catch (dbErr) {
        // IndexedDB write failure must not break the UX — log and continue
        console.warn('AgriEngine: IndexedDB log failed', dbErr);
      }
    }

    return result;
  } catch (err) {
    console.error('AgriEngine: inference failed', err);
    return { error: true, message: err.message || 'Inference failed. Please try again.' };
  }
}
