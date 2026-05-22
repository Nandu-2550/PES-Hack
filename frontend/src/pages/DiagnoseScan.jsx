/**
 * DiagnoseScan.jsx
 *
 * Route page for /diagnose.
 * Delegates the full diagnosis wizard to PlantScanner, which manages its own
 * internal state machine (idle → cropSelect → partSelect → capture → analyzing
 * → result | lowConfidence).
 *
 * Offline sync notification (pending logs badge) is preserved from the
 * original implementation.
 */

import React, { useEffect, useState } from 'react';
import { getUnsyncedLogs } from '../db/localForage';
import PlantScanner from '../components/PlantScanner';
import { AlertTriangle } from 'lucide-react';

const DiagnoseScan = () => {
  const [pendingLogs, setPendingLogs] = useState(0);

  useEffect(() => {
    // Show count of offline scans that haven't synced yet
    getUnsyncedLogs().then(logs => setPendingLogs(logs.length));

    const handleOnline = () => {
      // App.jsx handles the actual sync; clear the badge after a delay
      setTimeout(() => setPendingLogs(0), 2000);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0B0F12] text-slate-200">
      {/* Pending-sync notification banner */}
      {pendingLogs > 0 && (
        <div className="
          fixed top-0 left-0 right-0 z-50
          bg-yellow-500/10 border-b border-yellow-500/20
          px-4 py-2.5
          flex items-center gap-2
          backdrop-blur-md
        ">
          <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0" />
          <span className="text-yellow-300 text-xs font-semibold">
            {pendingLogs} offline scan{pendingLogs !== 1 ? 's' : ''} pending sync
          </span>
        </div>
      )}

      {/* Full-screen wizard — manages its own view state */}
      <PlantScanner />
    </div>
  );
};

export default DiagnoseScan;
