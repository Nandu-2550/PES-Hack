/**
 * PlantScanner.jsx
 *
 * Single-component AI crop diagnosis wizard with 7 sequential view states:
 *   idle → cropSelect → partSelect → capture → analyzing → result | lowConfidence
 *
 * Design system: AgriHub dark-green Tailwind palette.
 * All animations are pure CSS / Tailwind — no GIF, no MP4, no external library.
 */

import React, { useState, useRef, useCallback } from 'react';
import { runDiagnosis } from '../services/aiEngine';
import { useImageClassifier } from '../hooks/useImageClassifier';
import {
  Leaf,
  Sprout,
  FlowerIcon,
  ScanLine,
  Camera,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Constants — must appear verbatim per spec
// ---------------------------------------------------------------------------
const CROPS = [
  "Ragi", "Coffee", "Sugarcane", "Maize", "Spices",
  "Groundnut", "Tomato", "Sericulture (Raw Silk)", "Mango",
  "Banana", "Grapes", "Almond", "Sunflower", "Cotton", "Finger Millet"
];

const PLANT_PARTS = ["Leaf", "Stem", "Root", "Fruit / Flower"];

// ---------------------------------------------------------------------------
// Crop emoji map — decorative, no impact on logic
// ---------------------------------------------------------------------------
const CROP_EMOJI = {
  "Ragi": "🌾",
  "Coffee": "☕",
  "Sugarcane": "🎋",
  "Maize": "🌽",
  "Spices": "🌶️",
  "Groundnut": "🥜",
  "Tomato": "🍅",
  "Sericulture (Raw Silk)": "🐛",
  "Mango": "🥭",
  "Banana": "🍌",
  "Grapes": "🍇",
  "Almond": "🌰",
  "Sunflower": "🌻",
  "Cotton": "🌿",
  "Finger Millet": "🌾",
};

// Plant part icon map
const PART_ICONS = {
  "Leaf": Leaf,
  "Stem": Sprout,
  "Root": ScanLine,
  "Fruit / Flower": FlowerIcon,
};

// Plant part description — shows under each hotspot button
const PART_DESC = {
  "Leaf":          "Spots, yellowing, wilting",
  "Stem":          "Lesions, discolouration, rot",
  "Root":          "Decay, stunted growth",
  "Fruit / Flower":"Blemishes, premature drop",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Full-screen section wrapper */
function Screen({ children, className = '' }) {
  return (
    <div className={`min-h-screen w-full bg-green-950 flex flex-col ${className}`}>
      {children}
    </div>
  );
}

/** Top bar with optional back button */
function TopBar({ title, onBack }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-green-800">
      {onBack && (
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-green-900 border border-green-800 text-green-300 hover:bg-green-800 transition-colors"
          aria-label="Go back"
        >
          <RotateCcw size={18} />
        </button>
      )}
      <h1 className="text-green-50 font-semibold text-lg leading-tight">{title}</h1>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pulsing-ring plant animation (pure CSS, no external assets)
// ---------------------------------------------------------------------------
function PlantScanAnimation() {
  return (
    <div className="relative flex items-center justify-center w-full h-64">
      {/* Outermost ring — slowest pulse */}
      <div
        className="absolute rounded-full border-2 border-emerald-800 opacity-30"
        style={{
          width: 240, height: 240,
          animation: 'agri-pulse 3.6s ease-in-out infinite',
        }}
      />
      {/* Second ring */}
      <div
        className="absolute rounded-full border-2 border-emerald-700 opacity-40"
        style={{
          width: 190, height: 190,
          animation: 'agri-pulse 3.0s ease-in-out infinite 0.4s',
        }}
      />
      {/* Third ring */}
      <div
        className="absolute rounded-full border-2 border-emerald-600 opacity-55"
        style={{
          width: 145, height: 145,
          animation: 'agri-pulse 2.4s ease-in-out infinite 0.8s',
        }}
      />
      {/* Inner ring — fastest, brightest */}
      <div
        className="absolute rounded-full border-2 border-emerald-500 opacity-70"
        style={{
          width: 100, height: 100,
          animation: 'agri-pulse 1.8s ease-in-out infinite 1.2s',
        }}
      />
      {/* Core — static filled circle with leaf icon */}
      <div className="relative z-10 w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
        <Leaf size={28} className="text-emerald-400" />
      </div>
      {/* Horizontal scan line sweeping over the rings */}
      <div
        className="absolute w-48 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80"
        style={{ animation: 'agri-scan 2.2s linear infinite' }}
      />

      {/* Keyframe definitions injected inline — avoids needing tailwind.config extension */}
      <style>{`
        @keyframes agri-pulse {
          0%   { transform: scale(0.92); opacity: 0.25; }
          50%  { transform: scale(1.06); opacity: 0.70; }
          100% { transform: scale(0.92); opacity: 0.25; }
        }
        @keyframes agri-scan {
          0%   { transform: translateY(-60px); opacity: 0; }
          20%  { opacity: 0.85; }
          80%  { opacity: 0.85; }
          100% { transform: translateY(60px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// State: cropSelect
// ---------------------------------------------------------------------------
function CropSelectScreen({ onSelect, onBack }) {
  return (
    <Screen>
      <TopBar title="Select Your Crop" onBack={onBack} />
      <p className="px-4 pt-3 pb-2 text-green-400 text-sm">
        Choose the crop you want to diagnose
      </p>
      <div className="flex-1 overflow-y-auto px-3 pb-6">
        <div className="grid grid-cols-3 gap-2.5 mt-1">
          {CROPS.map((crop) => (
            <button
              key={crop}
              onClick={() => onSelect(crop)}
              className="
                flex flex-col items-center justify-center gap-1.5
                bg-green-900 border border-green-800 rounded-xl
                px-2 py-4 text-center
                hover:bg-green-800 hover:border-emerald-600
                active:scale-95
                transition-all duration-150
              "
            >
              <span className="text-2xl leading-none" role="img" aria-hidden="true">
                {CROP_EMOJI[crop] || '🌿'}
              </span>
              <span className="text-green-50 text-xs font-medium leading-tight">
                {crop}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// State: partSelect
// ---------------------------------------------------------------------------
function PartSelectScreen({ cropName, onSelect, onBack }) {
  return (
    <Screen>
      <TopBar title={`${cropName} — Select Plant Part`} onBack={onBack} />

      {/* Full-bleed animated background */}
      <div className="relative overflow-hidden bg-green-950">
        <PlantScanAnimation />
        <p className="text-center text-green-500 text-xs pb-2">
          Scan in progress…
        </p>
      </div>

      {/* 2×2 hotspot grid */}
      <div className="flex-1 px-4 pb-6 pt-2">
        <p className="text-green-300 text-sm text-center mb-4 font-medium">
          Which part of the plant is affected?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {PLANT_PARTS.map((part) => {
            const Icon = PART_ICONS[part] || Leaf;
            return (
              <button
                key={part}
                onClick={() => onSelect(part)}
                className="
                  flex flex-col items-center justify-center gap-2
                  bg-green-900 border border-green-800 rounded-2xl
                  py-6 px-3 text-center
                  hover:bg-green-800 hover:border-emerald-500
                  active:scale-95
                  transition-all duration-150
                  group
                "
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-600/40 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <Icon size={24} className="text-emerald-400" />
                </div>
                <span className="text-green-50 font-semibold text-sm">{part}</span>
                <span className="text-green-500 text-xs leading-tight">{PART_DESC[part]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// State: capture
// ---------------------------------------------------------------------------
function CaptureScreen({ cropName, partName, onImageSelected, onBack }) {
  const cameraRef = useRef(null);
  const fileRef   = useRef(null);

  return (
    <Screen>
      <TopBar title={`${cropName} — ${partName}`} onBack={onBack} />

      {/* Context label */}
      <div className="px-4 pt-5 pb-2">
        <div className="bg-green-900/60 border border-green-800 rounded-xl px-4 py-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-600/40 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ScanLine size={16} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-green-50 text-sm font-medium">Ready to scan</p>
            <p className="text-green-400 text-xs mt-0.5">
              Take or upload a clear, well-lit close-up of the {partName.toLowerCase()} for best results.
            </p>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onImageSelected}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageSelected}
      />

      {/* Bottom sheet — slides up via translate-y animation */}
      <div
        className="flex-1 flex flex-col justify-end px-4 pb-8"
        style={{ animation: 'slide-up 0.35s cubic-bezier(0.34,1.06,0.64,1) both' }}
      >
        <style>{`
          @keyframes slide-up {
            from { transform: translateY(60px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
        `}</style>

        <div className="bg-green-900 border border-green-800 rounded-2xl p-5 space-y-3">
          <p className="text-green-300 text-sm text-center font-medium mb-1">
            How would you like to add the image?
          </p>

          {/* Take a photo */}
          <button
            onClick={() => cameraRef.current.click()}
            className="
              w-full flex items-center justify-between gap-3
              bg-emerald-500 hover:bg-emerald-400
              text-green-950 font-semibold
              rounded-xl px-5 py-4
              transition-colors duration-150
              active:scale-95
            "
          >
            <div className="flex items-center gap-3">
              <Camera size={22} />
              <span>Take a photo</span>
            </div>
            <ChevronRight size={18} />
          </button>

          {/* Upload from files */}
          <button
            onClick={() => fileRef.current.click()}
            className="
              w-full flex items-center justify-between gap-3
              bg-green-900 hover:bg-green-800
              border border-green-700 hover:border-emerald-600
              text-green-50 font-semibold
              rounded-xl px-5 py-4
              transition-all duration-150
              active:scale-95
            "
          >
            <div className="flex items-center gap-3">
              <Upload size={22} className="text-emerald-400" />
              <span>Upload from files</span>
            </div>
            <ChevronRight size={18} className="text-green-500" />
          </button>
        </div>
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// State: analyzing
// ---------------------------------------------------------------------------
function AnalyzingScreen({ cropName, partName }) {
  return (
    <Screen className="items-center justify-center gap-6">
      {/* Spinner */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-green-800" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-400 animate-spin"
        />
        <div className="absolute inset-3 rounded-full bg-green-950 flex items-center justify-center">
          <Leaf size={24} className="text-emerald-400" />
        </div>
      </div>
      <div className="text-center px-8">
        <p className="text-green-50 font-semibold text-lg">
          Scanning {cropName}
        </p>
        <p className="text-green-400 text-sm mt-1">
          Analysing {partName}…
        </p>
        <p className="text-green-600 text-xs mt-3">
          Running on-device AI model
        </p>
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// State: result
// ---------------------------------------------------------------------------
const SEVERITY_STYLES = {
  High:    'bg-red-900/60 border-red-700 text-red-300',
  Medium:  'bg-yellow-900/50 border-yellow-700 text-yellow-300',
  Low:     'bg-green-900/60 border-green-700 text-green-300',
  None:    'bg-green-900/60 border-green-700 text-green-400',
  Unknown: 'bg-green-900/40 border-green-800 text-green-500',
};

function ResultScreen({ result, onReset }) {
  const confidencePct = Math.round(result.confidence * 100);
  const severityStyle = SEVERITY_STYLES[result.severity] || SEVERITY_STYLES.Unknown;

  return (
    <Screen>
      <TopBar title="Diagnosis Complete" />
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

        {/* Hero card */}
        <div className="bg-green-900 border border-green-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
            <span className="text-green-300 text-sm font-medium">
              {result.cropName} — {result.partName}
            </span>
          </div>

          {/* Disease label */}
          <h2 className="text-green-50 text-2xl font-bold leading-tight mb-1">
            {result.label}
          </h2>

          {/* Confidence bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-green-400 text-xs">Confidence</span>
              <span className="text-green-50 text-xs font-semibold">{confidencePct}%</span>
            </div>
            <div className="h-2 rounded-full bg-green-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
                style={{ width: `${confidencePct}%` }}
              />
            </div>
          </div>

          {/* Severity badge */}
          <div className="mt-3">
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${severityStyle}`}>
              Severity: {result.severity}
            </span>
          </div>
        </div>

        {/* Treatment section */}
        <div className="bg-green-900 border border-green-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 rounded-full bg-emerald-500" />
            <h3 className="text-green-50 font-semibold">Recommended Treatment</h3>
          </div>
          <p className="text-green-300 text-sm leading-relaxed">
            {result.treatment}
          </p>
        </div>

        {/* Diagnose another button */}
        <button
          onClick={onReset}
          className="
            w-full bg-emerald-500 hover:bg-emerald-400
            text-green-950 font-bold text-base
            rounded-xl py-4
            transition-colors duration-150
            active:scale-95 flex items-center justify-center gap-2
          "
        >
          <RotateCcw size={18} />
          Diagnose another
        </button>
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// State: lowConfidence
// ---------------------------------------------------------------------------
function LowConfidenceScreen({ result, onRetake, onReset }) {
  return (
    <Screen className="items-center justify-center px-5">
      <div className="w-full max-w-sm space-y-5">

        {/* Error card */}
        <div className="bg-red-900/60 border border-red-700 rounded-2xl p-5 text-center">
          <AlertTriangle size={40} className="text-red-400 mx-auto mb-3" />
          <h2 className="text-red-300 font-semibold text-base mb-2">
            Unclear diagnosis
          </h2>
          <p className="text-red-300/80 text-sm leading-relaxed">
            Disease could not be clearly identified. Please retake a clear photo of the
            plant part or select a different image.
          </p>
          {result?.confidence !== undefined && (
            <p className="text-red-400/60 text-xs mt-3">
              Confidence: {Math.round(result.confidence * 100)}% (threshold: 50%)
            </p>
          )}
        </div>

        {/* Retake — goes back to capture, preserving crop + part */}
        <button
          onClick={onRetake}
          className="
            w-full bg-emerald-500 hover:bg-emerald-400
            text-green-950 font-bold text-base
            rounded-xl py-4
            transition-colors duration-150
            active:scale-95 flex items-center justify-center gap-2
          "
        >
          <Camera size={18} />
          Retake photo
        </button>

        {/* Start over */}
        <button
          onClick={onReset}
          className="
            w-full bg-transparent
            border border-green-700 hover:border-green-600
            text-green-400 font-medium text-sm
            rounded-xl py-3
            transition-all duration-150
            active:scale-95 flex items-center justify-center gap-2
          "
        >
          <X size={16} />
          Start over
        </button>
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// State: idle
// ---------------------------------------------------------------------------
function IdleScreen({ modelReady, modelError, errorToast, onDismissToast, onStart }) {
  return (
    <Screen className="px-4 pt-10">
      {/* Model unavailability inline toast */}
      {errorToast && (
        <div className="mb-4 bg-yellow-900/50 border border-yellow-700 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-300 text-sm flex-1">
            AI model unavailable — connect once to download it.
          </p>
          <button
            onClick={onDismissToast}
            className="text-yellow-500 hover:text-yellow-300 transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Hero area */}
      <div className="flex flex-col items-center text-center pt-6 pb-8">
        <div className="relative w-36 h-36 mb-6">
          {/* Decorative concentric rings */}
          <div className="absolute inset-0 rounded-full border-2 border-emerald-900 opacity-60" style={{ animation: 'agri-pulse 3s ease-in-out infinite' }} />
          <div className="absolute inset-4 rounded-full border-2 border-emerald-800 opacity-70" style={{ animation: 'agri-pulse 2.4s ease-in-out infinite 0.5s' }} />
          <div className="absolute inset-8 rounded-full bg-emerald-500/10 border-2 border-emerald-600 flex items-center justify-center">
            <Leaf size={40} className="text-emerald-400" />
          </div>
          <style>{`
            @keyframes agri-pulse {
              0%   { transform: scale(0.92); opacity: 0.25; }
              50%  { transform: scale(1.06); opacity: 0.70; }
              100% { transform: scale(0.92); opacity: 0.25; }
            }
          `}</style>
        </div>

        <h1 className="text-green-50 text-3xl font-bold mb-2">AI Crop Scanner</h1>
        <p className="text-green-400 text-sm leading-relaxed max-w-xs">
          Identify plant diseases instantly — even offline — using on-device AI trained on
          Karnataka's most common crops.
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {['15 crops', '4 plant parts', '100% offline', 'Instant results'].map((f) => (
          <span
            key={f}
            className="text-xs text-green-400 bg-green-900 border border-green-800 rounded-full px-3 py-1"
          >
            {f}
          </span>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        disabled={!modelReady}
        title={!modelReady ? 'AI model loading…' : 'Start diagnosis'}
        className="
          w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed
          text-green-950 font-bold text-lg
          rounded-xl py-4
          transition-colors duration-150
          active:scale-95 flex items-center justify-center gap-2
        "
      >
        {modelReady ? (
          <>
            <ScanLine size={22} />
            Diagnose Now
          </>
        ) : (
          <>
            <div className="w-5 h-5 border-2 border-green-900 border-t-green-950 rounded-full animate-spin" />
            Loading AI…
          </>
        )}
      </button>

      {modelError && !errorToast && (
        <p className="text-red-400 text-xs text-center mt-3">
          {modelError}
        </p>
      )}
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Main PlantScanner component
// ---------------------------------------------------------------------------
export default function PlantScanner() {
  const [viewState, setViewState] = useState('idle');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null);

  // Hidden img element ref — used to pass to TF.js inference
  const hiddenImgRef = useRef(null);

  const { modelReady, modelError, errorToast, dismissToast } = useImageClassifier();

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleCropSelect = useCallback((crop) => {
    setSelectedCrop(crop);
    setViewState('partSelect');
  }, []);

  const handlePartSelect = useCallback((part) => {
    setSelectedPart(part);
    setViewState('capture');
  }, []);

  /**
   * Shared onChange handler for both hidden <input type="file"> elements.
   * Reads the selected file, loads it into a hidden <img>, then triggers inference.
   */
  const handleImageSelected = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset value so the same file can be re-selected after a retake
    e.target.value = '';

    const objectUrl = URL.createObjectURL(file);

    // Advance to analyzing state immediately so the user sees feedback
    setViewState('analyzing');
    setDiagnosisResult(null);

    // Load the image into the hidden <img> element so TF.js can read pixels
    const img = hiddenImgRef.current;
    img.onload = async () => {
      const result = await runDiagnosis(img, selectedCrop, selectedPart);
      URL.revokeObjectURL(objectUrl);

      if (result.error) {
        // Engine-level error — treat as low confidence to allow retake
        setDiagnosisResult({ confidence: 0, label: 'Error', treatment: result.message, severity: 'Unknown' });
        setViewState('lowConfidence');
        return;
      }

      setDiagnosisResult(result);
      setViewState(result.confidence >= 0.50 ? 'result' : 'lowConfidence');
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setDiagnosisResult({ confidence: 0, label: 'Image load error', treatment: 'Could not load the selected image.', severity: 'Unknown' });
      setViewState('lowConfidence');
    };
    img.src = objectUrl;
  }, [selectedCrop, selectedPart]);

  const resetToIdle = useCallback(() => {
    setViewState('idle');
    setSelectedCrop(null);
    setSelectedPart(null);
    setDiagnosisResult(null);
  }, []);

  const retakePhoto = useCallback(() => {
    // Keep selectedCrop and selectedPart — only go back to capture
    setViewState('capture');
    setDiagnosisResult(null);
  }, []);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <>
      {/* Hidden img element — mounted outside the view tree, always in DOM */}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img
        ref={hiddenImgRef}
        aria-hidden="true"
        className="hidden"
        crossOrigin="anonymous"
      />

      {viewState === 'idle' && (
        <IdleScreen
          modelReady={modelReady}
          modelError={modelError}
          errorToast={errorToast}
          onDismissToast={dismissToast}
          onStart={() => setViewState('cropSelect')}
        />
      )}

      {viewState === 'cropSelect' && (
        <CropSelectScreen
          onSelect={handleCropSelect}
          onBack={() => setViewState('idle')}
        />
      )}

      {viewState === 'partSelect' && (
        <PartSelectScreen
          cropName={selectedCrop}
          onSelect={handlePartSelect}
          onBack={() => setViewState('cropSelect')}
        />
      )}

      {viewState === 'capture' && (
        <CaptureScreen
          cropName={selectedCrop}
          partName={selectedPart}
          onImageSelected={handleImageSelected}
          onBack={() => setViewState('partSelect')}
        />
      )}

      {viewState === 'analyzing' && (
        <AnalyzingScreen
          cropName={selectedCrop}
          partName={selectedPart}
        />
      )}

      {viewState === 'result' && diagnosisResult && (
        <ResultScreen
          result={diagnosisResult}
          onReset={resetToIdle}
        />
      )}

      {viewState === 'lowConfidence' && (
        <LowConfidenceScreen
          result={diagnosisResult}
          onRetake={retakePhoto}
          onReset={resetToIdle}
        />
      )}
    </>
  );
}
