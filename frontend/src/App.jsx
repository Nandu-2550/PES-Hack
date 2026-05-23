import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { getUnsyncedLogs, markLogsSynced } from "./db/localForage";
import api from "./api/client";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import DiagnoseScan from "./pages/DiagnoseScan";
import JobBoard from "./pages/JobBoard";
import Machinery from "./pages/Machinery";
import Weather from "./pages/Weather";
import CropMarket from "./pages/CropMarket";
import Schemes from "./pages/Schemes";
import Loans from "./pages/Loans";
import OfflineBanner from "./components/OfflineBanner";
import LanguageSwitcher from "./components/LanguageSwitcher";
import VoiceBot from "./components/VoiceBot";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LanguageProvider } from "./context/LanguageContext";

const App = () => {
  useEffect(() => {
    const handleOnline = async () => {
      try {
        const logs = await getUnsyncedLogs();
        if (logs.length > 0) {
          const res = await api.post('/api/diagnose/sync', { logs });
          if (res.data.syncedCount) {
            const keys = logs.map(l => l.id);
            await markLogsSynced(keys);
            toast.success(`Successfully synced ${logs.length} offline scans!`);
          }
        }
      } catch (err) {
        console.error("Failed to sync offline logs", err);
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <LanguageProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Toaster position="top-center" toastOptions={{
          style: {
            background: '#13191C',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.05)',
          }
        }}/>
        <LanguageSwitcher />
        <Routes>
          {/* Public routes — no token required */}
          <Route path="/" element={<Onboarding />} />

          {/* Protected routes — require userToken in localStorage.
              ProtectedRoute reads localStorage directly on every render,
              so the check survives hard refreshes and offline navigation. */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diagnose"
            element={
              <ProtectedRoute>
                <DiagnoseScan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/machinery"
            element={
              <ProtectedRoute>
                <Machinery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weather"
            element={
              <ProtectedRoute>
                <Weather />
              </ProtectedRoute>
            }
          />
          <Route
            path="/market"
            element={
              <ProtectedRoute>
                <CropMarket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schemes"
            element={
              <ProtectedRoute>
                <Schemes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loans"
            element={
              <ProtectedRoute>
                <Loans />
              </ProtectedRoute>
            }
          />

          {/* Catch-all — redirect unknown paths to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <OfflineBanner />
        <VoiceBot />
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
