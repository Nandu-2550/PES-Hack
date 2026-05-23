import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'EN' },
  { code: 'kn', label: 'ಕನ್ನಡ', native: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'हिन्दी', native: 'हि' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLanguage = (code) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: 'fixed', top: '12px', right: '12px', zIndex: 1000, display: 'inline-block' }}>
      {/* Single trigger button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'rgba(19, 25, 28, 0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '6px 14px',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition: 'all 0.2s',
        }}
      >
        <span>🌐</span>
        <span>{currentLang.native}</span>
        <span style={{ fontSize: '9px', opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div style={{
          position: 'absolute',
          top: '110%',
          right: 0,
          background: '#13191C',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '12px',
          overflow: 'hidden',
          zIndex: 9999,
          minWidth: '140px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          {LANGUAGES.map((langItem) => (
            <button
              key={langItem.code}
              onClick={() => switchLanguage(langItem.code)}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 16px',
                background: langItem.code === lang ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: langItem.code === lang ? '#10B981' : '#e2e8f0',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: langItem.code === lang ? '700' : '400',
                transition: 'all 0.15s',
              }}
            >
              {langItem.native} — {langItem.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
