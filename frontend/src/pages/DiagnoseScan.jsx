import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUnsyncedLogs } from '../db/localForage';
import PlantScanner from '../components/PlantScanner';
import { AlertTriangle, Wifi, ScanLine } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Neon blueprint tree component
 * Renders an animated highly-realistic SVG tree and absolute-positioned interaction hotspots.
 */
function NeonTree({ stage, onPartSelect, t }) {
  const isGrowing = stage === 'growing';
  const isSelecting = stage === 'selecting';

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1, 
      transition: { duration: 1.8, ease: "easeInOut" }
    }
  };

  const Hotspot = ({ part, label, icon, top, left, delay }) => {
    if (!isSelecting) return null;
    
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [1, 1.05, 1], opacity: 1 }}
        transition={{ scale: { repeat: Infinity, duration: 2 }, opacity: { delay, duration: 0.3 } }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPartSelect(part)}
        className="absolute flex items-center justify-center gap-2 px-4 py-2 rounded-full z-20"
        style={{
          top, left,
          transform: 'translate(-50%, -50%)',
          background: 'rgba(26, 36, 33, 0.42)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px)',
          color: '#34D399',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 0 15px rgba(52,211,153,0.15)'
        }}
      >
        <span className="text-lg leading-none">{icon}</span>
        <span className="text-xs font-bold tracking-wide text-white">{label}</span>
      </motion.button>
    );
  };

  return (
    <div className="relative w-full max-w-md aspect-square mx-auto flex items-center justify-center my-auto">
      {/* Realistic Image Canvas - renders only during growing or selecting phase */}
      {(isGrowing || isSelecting) && (
        <motion.div
          className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
          initial={{ clipPath: 'inset(100% 0 0 0)' }}
          animate={{ clipPath: 'inset(0% 0 0 0)' }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        >
          <img 
            src="/realistic-plant.png" 
            alt="Neon Plant Anatomy" 
            className="w-full h-full object-contain"
            style={{ filter: 'drop-shadow(0 0 20px rgba(52,211,153,0.3))' }}
          />
        </motion.div>
      )}

      {/* Interactive Absolute Overlays */}
      <Hotspot part="Fruit / Flower" label={t('part_fruit_flower') || "Fruit/Flower"} icon="🍎" top="20%" left="50%" delay={0.1} />
      <Hotspot part="Leaf" label={t('part_leaves') || "Leaves"} icon="🍃" top="42%" left="82%" delay={0.2} />
      <Hotspot part="Stem" label={t('part_stem') || "Stem/Stalk"} icon="🪵" top="62%" left="40%" delay={0.3} />
      <Hotspot part="Root" label={t('part_roots') || "Roots"} icon="🌱" top="90%" left="60%" delay={0.4} />
    </div>
  );
}

const DiagnoseScan = () => {
  const { t } = useLanguage();
  const [pendingLogs, setPendingLogs] = useState(0);
  const [scanStage, setScanStage] = useState('idle'); 
  const [selectedPart, setSelectedPart] = useState(null);

  useEffect(() => {
    getUnsyncedLogs().then(logs => setPendingLogs(logs.length));
    const handleOnline = () => setTimeout(() => setPendingLogs(0), 2000);
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handleStartGrowth = () => {
    setScanStage('growing');
    setTimeout(() => {
      setScanStage('selecting');
    }, 1800);
  };

  const handlePartSelect = (part) => {
    setSelectedPart(part);
    setScanStage('uploading');
  };

  return (
    <div className="relative min-h-screen bg-transparent overflow-hidden flex flex-col">
      <div className="nfv-orb nfv-orb-emerald nfv-orb-animate-1 pointer-events-none" style={{ width: 300, height: 300, top: '10%', left: '-8%', zIndex: 0 }} aria-hidden="true" />
      <div className="nfv-orb nfv-orb-teal nfv-orb-animate-2 pointer-events-none" style={{ width: 220, height: 220, bottom: '15%', right: '-6%', zIndex: 0 }} aria-hidden="true" />

      <AnimatePresence>
        {pendingLogs > 0 && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed top-0 left-0 right-0 z-50 flex items-center gap-2 px-4 py-2.5"
            style={{ background: 'rgba(251,191,36,0.08)', borderBottom: '1px solid rgba(251,191,36,0.2)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            <motion.div animate={{ rotate: [0, -8, 8, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}>
              <AlertTriangle size={15} className="text-yellow-400 flex-shrink-0" />
            </motion.div>
            <span className="text-yellow-300 text-xs font-semibold">
              {pendingLogs} {t('offline_scans_pending') || 'offline scan(s) pending sync'}
            </span>
            <div className="ml-auto flex items-center gap-1 text-yellow-400/60 text-xs">
              <Wifi size={11} />
              <span>{t('will_auto_sync') || 'Will auto-sync'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 w-full h-full pb-20">
        <AnimatePresence mode="wait">
          
          {scanStage === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center h-full w-full max-w-sm mx-auto"
            >
              <div 
                className="w-full flex flex-col items-center justify-between px-6 py-10 relative"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(28px)',
                  WebkitBackdropFilter: 'blur(28px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '32px',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                }}
              >
                <div className="mb-6">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-400/60 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                    <ScanLine size={40} className="text-emerald-300" />
                  </div>
                </div>
                <h1 
                  className="text-white text-3xl font-extrabold mb-3 text-center tracking-tight" 
                  style={{ textShadow: '0 0 30px rgba(52,211,153,0.6)' }}
                >
                  {t('agrishield_vision') || 'AgriShield Vision'}
                </h1>
                <p className="text-slate-200 text-sm text-center mb-10 max-w-[260px] leading-relaxed">
                  {t('initialize_mapping_desc') || 'Initialize the visual blueprint mapping to precisely target structural plant diseases.'}
                </p>
                <button
                  onClick={handleStartGrowth}
                  className="w-full py-4 text-[17px] font-bold flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #34D399, #10B981)',
                    boxShadow: '0 10px 30px rgba(16,185,129,0.4), inset 0 2px 0 rgba(255,255,255,0.2)',
                    borderRadius: '16px', border: 'none', color: '#022C22'
                  }}
                >
                  <ScanLine size={22} /> {t('initialize_mapping_btn') || 'Initialize Mapping'}
                </button>
              </div>
            </motion.div>
          )}

          {(scanStage === 'growing' || scanStage === 'selecting') && (
            <motion.div
              key="tree"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center w-full relative"
            >
              <h2 
                className="absolute top-10 text-white font-bold text-xl tracking-wide z-20"
                style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}
              >
                {t('select_structural_area') || 'Select Structural Area'}
              </h2>
              <NeonTree stage={scanStage} onPartSelect={handlePartSelect} t={t} />
            </motion.div>
          )}

          {scanStage === 'uploading' && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-20"
            >
              <PlantScanner 
                initialViewState="capture" 
                initialCrop={t('unknown_crop') || "Unknown Crop"} 
                initialPart={selectedPart} 
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default DiagnoseScan;
