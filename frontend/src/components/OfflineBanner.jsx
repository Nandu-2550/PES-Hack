import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function OfflineBanner() {
  const { t } = useLanguage();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '5%', right: '5%',
      background: 'rgba(26, 21, 16, 0.85)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      color: '#f4a261',
      padding: '12px 16px',
      borderRadius: 12,
      border: '1px solid rgba(244,162,97,0.15)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', gap: 12,
      zIndex: 9999
    }}>
      <span style={{ fontSize: 20 }}>⚠</span>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{t('you_are_offline')}</h4>
        <p style={{ margin: 0, fontSize: 12, opacity: 0.8, color: '#f4a261aa' }}>
          {t('offline_alert_body') || 'AgriShield is running in offline mode. Syncing is paused.'}
        </p>
      </div>
    </div>
  );
}
