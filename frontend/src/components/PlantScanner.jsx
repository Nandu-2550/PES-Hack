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
import { useLanguage } from '../context/LanguageContext';
import client from '../api/client';
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
    <div className={`min-h-screen w-full bg-transparent flex flex-col ${className}`}>
      {children}
    </div>
  );
}

/** Top bar with optional back button */
function TopBar({ title, onBack }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-white/5">
      {onBack && (
        <button
          onClick={onBack}
          className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white transition-colors"
          style={{ background: 'rgba(0,0,0,0.32)' }}
          aria-label="Go back"
        >
          <RotateCcw size={18} />
        </button>
      )}
      <h1 className="text-white font-semibold text-lg leading-tight">{title}</h1>
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
      <p className="px-4 pt-3 pb-2 text-slate-400 text-sm">
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
                border border-white/10 rounded-xl
                px-2 py-4 text-center
                hover:border-emerald-500/30 hover:shadow-glow-sm
                active:scale-95
                transition-all duration-300
              "
              style={{ background: 'rgba(26,36,33,0.42)', backdropFilter: 'blur(20px)' }}
            >
              <span className="text-2xl leading-none" role="img" aria-hidden="true">
                {CROP_EMOJI[crop] || '🌿'}
              </span>
              <span className="text-white text-xs font-medium leading-tight">
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
      <div className="relative overflow-hidden bg-transparent">
        <PlantScanAnimation />
        <p className="text-center text-slate-500 text-xs pb-2">
          Scan in progress…
        </p>
      </div>

      {/* 2×2 hotspot grid */}
      <div className="flex-1 px-4 pb-6 pt-2">
        <p className="text-slate-300 text-sm text-center mb-4 font-medium">
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
                  border border-white/10 rounded-2xl
                  py-6 px-3 text-center
                  hover:border-emerald-500/30 hover:shadow-glow-sm
                  active:scale-95
                  transition-all duration-300
                  group
                "
                style={{ background: 'rgba(26,36,33,0.42)', backdropFilter: 'blur(20px)' }}
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-600/40 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <Icon size={24} className="text-emerald-400" />
                </div>
                <span className="text-white font-semibold text-sm">{part}</span>
                <span className="text-slate-400 text-xs leading-tight">{PART_DESC[part]}</span>
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
        <div className="border border-white/10 rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: 'rgba(26,36,33,0.42)', backdropFilter: 'blur(20px)' }}>
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-600/40 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ScanLine size={16} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Ready to scan</p>
            <p className="text-slate-400 text-xs mt-0.5">
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

        <div className="border border-white/10 rounded-2xl p-5 space-y-3 shadow-glow-sm" style={{ background: 'rgba(26,36,33,0.42)', backdropFilter: 'blur(20px)' }}>
          <p className="text-slate-300 text-sm text-center font-medium mb-1">
            How would you like to add the image?
          </p>

          {/* Take a photo */}
          <button
            onClick={() => cameraRef.current.click()}
            className="
              w-full flex items-center justify-between gap-3
              bg-emerald-500 hover:bg-emerald-400
              text-black font-semibold
              rounded-xl px-5 py-4
              shadow-glow-sm
              transition-all duration-150
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
              border border-white/10 hover:border-emerald-500/30 hover:shadow-glow-sm
              text-white font-semibold
              rounded-xl px-5 py-4
              transition-all duration-300
              active:scale-95
            "
            style={{ background: 'rgba(0,0,0,0.32)' }}
          >
            <div className="flex items-center gap-3">
              <Upload size={22} className="text-emerald-400" />
              <span>Upload from files</span>
            </div>
            <ChevronRight size={18} className="text-slate-500" />
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
        <div className="absolute inset-0 rounded-full border-4 border-white/5" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-400 animate-spin"
        />
        <div className="absolute inset-3 rounded-full flex items-center justify-center" style={{ background: 'rgba(26,36,33,0.6)' }}>
          <Leaf size={24} className="text-emerald-400" />
        </div>
      </div>
      <div className="text-center px-8">
        <p className="text-white font-semibold text-lg">
          Scanning {cropName}
        </p>
        <p className="text-slate-400 text-sm mt-1">
          Analysing {partName}…
        </p>
        <p className="text-slate-500 text-xs mt-3">
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
  High:    'bg-red-500/10 border-red-500/20 text-red-400',
  Medium:  'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  Low:     'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  None:    'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  Unknown: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
};

function ResultScreen({ result, runMode, t, onReset }) {
  return (
    <Screen>
      <TopBar title="Diagnosis Complete" />
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        <div className="diagnosis-result-card">

          {/* Header: Disease name + severity badge */}
          <div className="result-header">
            <div>
              <h2 className="disease-name">{result.disease || result.label || 'Analysis Complete'}</h2>
              <span style={{
                display: 'inline-block', marginTop: '4px',
                fontSize: '11px', color: 'var(--text-secondary-2)',
                background: 'var(--surface-glass)',
                padding: '2px 10px', borderRadius: '20px',
                border: '1px solid var(--border-subtle)'
              }}>
                {runMode}
              </span>
            </div>
            <div className="severity-container">
              <span className={`severity-badge severity-${(result.severity || 'unknown').toLowerCase()}`}>
                {result.severity || 'Unknown'}
              </span>
              {result.confidence && (
                <div className="confidence-bar-wrap">
                  <div className="confidence-bar"
                    style={{ width: `${Math.round((result.confidence || 0) * 100)}%` }} />
                  <span className="confidence-text">
                    {Math.round((result.confidence || 0) * 100)}% confidence
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* What was observed */}
          {result.symptoms_observed && (
            <div className="result-section">
              <h4>🔍 {t('symptoms_observed') || 'Symptoms Observed'}</h4>
              <p>{result.symptoms_observed}</p>
            </div>
          )}

          {/* Immediate Action — most prominent */}
          <div className="result-section result-urgent">
            <h4>⚡ {t('immediate_action') || 'Do This TODAY'}</h4>
            <p>{result.immediate_action || result.action}</p>
          </div>

          {/* Treatment */}
          <div className="result-section">
            <h4>💊 {t('chemical_treatment') || 'Chemical Treatment'}</h4>
            <p>{result.chemical_treatment}</p>
            {result.dose && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <strong>Dose:</strong> {result.dose}
            </p>}
          </div>

          {/* Organic Alternative */}
          {result.organic_alternative && (
            <div className="result-section">
              <h4>🌿 {t('organic_alternative') || 'Organic Alternative'}</h4>
              <p>{result.organic_alternative}</p>
            </div>
          )}

          {/* Prevention */}
          {result.prevention && (
            <div className="result-section">
              <h4>🛡️ {t('prevention') || 'Prevention'}</h4>
              <p>{result.prevention}</p>
            </div>
          )}

          {/* Yield Impact + Spread Risk */}
          {(result.yield_impact || result.spread_risk) && (
            <div className="result-meta-row">
              {result.yield_impact && (
                <div className="result-meta-chip">
                  <span>📉 Yield Risk</span>
                  <strong>{result.yield_impact}</strong>
                </div>
              )}
              {result.spread_risk && (
                <div className="result-meta-chip">
                  <span>🔴 Spread Risk</span>
                  <strong>{result.spread_risk}</strong>
                </div>
              )}
            </div>
          )}

          {/* BUY PRODUCTS — the critical feature */}
          {result.buyLinks && result.buyLinks.length > 0 && (
            <div className="result-section buy-links-section">
              <h4>🛒 {t('buy_products') || 'Buy Treatment Products'}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {t('verified_sellers') || 'Verified agricultural suppliers in India:'}
              </p>
              <div className="buy-links-grid">
                {result.buyLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="buy-link-btn"
                  >
                    🛍️ {link.name}
                    <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.7 }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Retake button */}
          <button
            onClick={onReset}
            className="btn-primary"
            style={{ marginTop: '16px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <RotateCcw size={18} />
            {t('scan_another') || 'Scan Another Crop'}
          </button>
        </div>
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
        <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-5 text-center">
          <AlertTriangle size={40} className="text-red-400 mx-auto mb-3" />
          <h2 className="text-red-400 font-semibold text-base mb-2">
            Unclear diagnosis
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Disease could not be clearly identified. Please retake a clear photo of the
            plant part or select a different image.
          </p>
          {result?.confidence !== undefined && (
            <p className="text-slate-500 text-xs mt-3">
              Confidence: {Math.round(result.confidence * 100)}% (threshold: 50%)
            </p>
          )}
        </div>

        {/* Retake — goes back to capture, preserving crop + part */}
        <button
          onClick={onRetake}
          className="
            btn-primary w-full py-4 text-base font-bold
            flex items-center justify-center gap-2
          "
        >
          <Camera size={18} />
          Retake photo
        </button>

        {/* Start over */}
        <button
          onClick={onReset}
          className="
            btn-outline w-full py-3 text-sm
            flex items-center justify-center gap-2
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
    <Screen className="px-4 py-8 flex flex-col items-center justify-center">
      <div
        className="w-full max-w-sm flex flex-col items-center justify-between px-5 py-8 relative"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '32px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          minHeight: '540px',
        }}
      >
        {/* Model unavailability inline toast */}
        {errorToast && (
          <div className="absolute top-4 left-4 right-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 flex items-start gap-3 z-10">
            <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-400 text-sm flex-1">
              AI model unavailable — connect once to download it.
            </p>
            <button
              onClick={onDismissToast}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex flex-col items-center text-center w-full mt-4">
          {/* Decorative concentric rings */}
          <div className="relative w-36 h-36 mb-6">
            <div className="absolute inset-0 rounded-full border border-emerald-400/40 opacity-80" style={{ animation: 'agri-pulse 3s ease-in-out infinite' }} />
            <div className="absolute inset-4 rounded-full border border-emerald-400/50 opacity-90" style={{ animation: 'agri-pulse 2.4s ease-in-out infinite 0.5s' }} />
            <div className="absolute inset-8 rounded-full bg-emerald-500/15 border-2 border-emerald-400/60 flex items-center justify-center">
              <Leaf size={40} className="text-emerald-300" style={{ filter: 'drop-shadow(0 0 10px rgba(52,211,153,0.8))' }} />
            </div>
            <style>{`
              @keyframes agri-pulse {
                0%   { transform: scale(0.92); opacity: 0.35; }
                50%  { transform: scale(1.06); opacity: 0.80; }
                100% { transform: scale(0.92); opacity: 0.35; }
              }
            `}</style>
          </div>

          <h1 
            className="text-white text-[32px] font-extrabold mb-3 tracking-tight leading-none"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3), 0 0 30px rgba(255,255,255,0.4), 0 0 50px rgba(52,211,153,0.6)' }}
          >
            AI Crop Scanner
          </h1>
          <p className="text-white text-sm leading-relaxed max-w-[280px]" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            Identify plant diseases instantly — even offline — using on-device AI trained on
            Karnataka's most common crops.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8 mb-auto">
          {['15 crops', '4 plant parts', '100% offline', 'Instant results'].map((f) => (
            <span
              key={f}
              className="text-xs text-emerald-300 border border-white/20 rounded-full px-4 py-1.5 font-medium tracking-wide"
              style={{ background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
            >
              {f}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="w-full mt-8">
          <button
            onClick={onStart}
            disabled={!modelReady}
            title={!modelReady ? 'AI model loading…' : 'Start diagnosis'}
            className="
              btn-primary w-full py-4 text-[17px] font-bold
              flex items-center justify-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            style={{
              background: 'linear-gradient(135deg, #34D399, #10B981)',
              boxShadow: '0 10px 30px rgba(16,185,129,0.4), inset 0 2px 0 rgba(255,255,255,0.2)',
              borderRadius: '16px',
              border: 'none',
              color: '#022C22'
            }}
          >
            {modelReady ? (
              <>
                <ScanLine size={22} />
                Diagnose Now
              </>
            ) : (
              <>
                <div className="w-5 h-5 border-2 border-[#022C22] border-t-emerald-100 rounded-full animate-spin" />
                Loading AI…
              </>
            )}
          </button>
        </div>

        {modelError && !errorToast && (
          <p className="text-red-400/90 text-xs text-center absolute bottom-2 w-full font-medium" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {modelError}
          </p>
        )}
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Main PlantScanner component
// ---------------------------------------------------------------------------
export default function PlantScanner({ initialViewState = 'idle', initialCrop = null, initialPart = null }) {
  const [viewState, setViewState] = useState(initialViewState);
  const [selectedCrop, setSelectedCrop] = useState(initialCrop);
  const [selectedPart, setSelectedPart] = useState(initialPart);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [runMode, setRunMode] = useState(null);

  const { t } = useLanguage();

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

    e.target.value = '';
    const objectUrl = URL.createObjectURL(file);

    setViewState('analyzing');
    setDiagnosisResult(null);
    setRunMode(null);

    const img = hiddenImgRef.current;
    img.onload = async () => {
      // ── TIER 1: Gemini Vision API (via backend) ──────────────────
      if (navigator.onLine) {
        try {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          const response = await client.post('/api/diagnose/gemini', {
            imageBase64: base64,
            mimeType: file.type || 'image/jpeg',
            crop: selectedCrop,
            part: selectedPart,
          });

          if (response.data && !response.data.fallback) {
            setDiagnosisResult({ ...response.data, tier: 1 });
            setRunMode('☁️ Gemini AI Vision');
            setViewState('result');
            URL.revokeObjectURL(objectUrl);
            return;
          }
        } catch (err) {
          console.warn('[Tier 1] Gemini failed, trying FastAPI:', err.message);
        }
      }

      // ── TIER 2: FastAPI Rule-Based Engine ────────────────────────
      if (navigator.onLine) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('crop', selectedCrop);
          formData.append('part', selectedPart);

          const response = await client.post('/api/diagnose', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          const data = response.data;
          
          let diagnosisData = data.diagnosis || data;
          if (diagnosisData && diagnosisData.disease) {
            setDiagnosisResult({ ...diagnosisData, tier: 2 });
            setRunMode('🔬 Expert Rules Engine');
            setViewState('result');
            URL.revokeObjectURL(objectUrl);
            return;
          }
        } catch (err) {
          console.warn('[Tier 2] FastAPI failed, using offline:', err.message);
        }
      }

      // ── TIER 3: TF.js Offline Classifier ────────────────────────
      try {
        const { classifyImage } = await import('../ai/cropClassifier');
        const offlineResult = await classifyImage(img, selectedCrop, selectedPart);
        setDiagnosisResult({ ...offlineResult, tier: 3 });
        setRunMode('📱 On-Device AI (Offline)');
        setViewState('result');
      } catch (err) {
        console.error('[Tier 3] All tiers failed:', err);
        setDiagnosisResult({
          disease: 'Analysis Error',
          severity: 'Unknown',
          immediate_action: 'Please retake the photo in better lighting and try again. Ensure the affected area fills the frame.',
          chemical_treatment: 'Consult your local KVK or agricultural officer.',
          buyLinks: [{ name: 'AgriBegri', url: 'https://agribegri.com' }],
          tier: 0,
        });
        setRunMode('⚠️ Service Unavailable');
        setViewState('lowConfidence');
      }
      
      URL.revokeObjectURL(objectUrl);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setDiagnosisResult({ disease: 'Image load error', severity: 'Unknown' });
      setRunMode('⚠️ Service Unavailable');
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
          runMode={runMode}
          t={t}
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
