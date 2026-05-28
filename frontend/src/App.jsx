import React, { useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Leaf } from "lucide-react";
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
import { ThemeProvider } from "./context/ThemeContext";

import Profile from "./pages/Profile";

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

  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 1]);
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-20 overflow-hidden">
          <motion.div style={{ rotate, scale, x, display: 'flex' }}>
            <Leaf size={400} color="#34d399" />
          </motion.div>
        </div>
        <div className="relative z-10 w-full min-h-screen">
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Toaster
            position="bottom-center"
            gutter={10}
            toastOptions={{
              duration: 3500,
              style: {
                background: 'rgba(19, 25, 28, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                color: '#e2e8f0',
                borderRadius: '14px',
                fontSize: '13px',
                padding: '10px 16px',
                maxWidth: '340px',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#022c22' },
              },
              error: {
                iconTheme: { primary: '#f87171', secondary: '#1c0000' },
              },
            }}
          />
          <div className="flex items-center justify-end p-4 gap-4">

            <LanguageSwitcher />
          </div>
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

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Catch-all — redirect unknown paths to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <OfflineBanner />
        <VoiceBot />
      </BrowserRouter>
      </div>
    </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
