import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LANGS = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ', full: 'Kannada' },
  { code: 'hi', label: 'हि', full: 'Hindi' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <div style={{
      display: 'flex', gap: '6px', position: 'fixed',
      top: '12px', right: '12px', zIndex: 1000,
    }}>
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          style={{
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            border: lang === code ? '1px solid #10B981' : '1px solid rgba(255,255,255,0.1)',
            background: lang === code ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)',
            color: lang === code ? '#10B981' : 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
