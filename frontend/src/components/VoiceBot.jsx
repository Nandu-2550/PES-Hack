import React, { useState } from 'react';
import { Mic, MicOff, X } from 'lucide-react';
import { useVoiceBot } from '../hooks/useVoiceBot';
import { useLanguage } from '../context/LanguageContext';

export default function VoiceBot() {
  const { t, lang } = useLanguage();
  const { listening, transcript, startListening, stopListening } = useVoiceBot(lang);
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: '80px', right: '16px',
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          border: 'none', cursor: 'pointer', zIndex: 999,
          boxShadow: '0 0 20px rgba(16,185,129,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        aria-label={t('voice_bot')}
      >
        <Mic color="white" size={22} />
      </button>

      {/* Voice Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '145px', right: '16px',
          width: '260px', background: '#13191C',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '16px', padding: '16px',
          boxShadow: '0 0 30px rgba(0,0,0,0.5)',
          zIndex: 1000,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#10B981', fontWeight: 600, fontSize: '14px' }}>{t('voice_bot')}</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X color="rgba(255,255,255,0.5)" size={16} />
            </button>
          </div>

          <button
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
            style={{
              width: '100%', padding: '12px',
              borderRadius: '10px', border: 'none', cursor: 'pointer',
              background: listening ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.1)',
              color: listening ? '#EF4444' : '#10B981',
              fontWeight: 600, display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '8px', transition: 'all 0.2s',
            }}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
            {listening ? t('listening') : t('tap_to_speak')}
          </button>

          {transcript && (
            <p style={{ marginTop: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
              "{transcript}"
            </p>
          )}

          <p style={{ marginTop: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
            {lang === 'kn' ? 'ಉದಾ: "ಮಾರುಕಟ್ಟೆ ತೆರೆ"' : lang === 'hi' ? 'जैसे: "बाज़ार खोलो"' : 'e.g. "open market"'}
          </p>
        </div>
      )}
    </>
  );
}
