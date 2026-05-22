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
import OfflineBanner from "./components/OfflineBanner";
import { ProtectedRoute } from "./components/ProtectedRoute";

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

        {/* Catch-all — redirect unknown paths to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <OfflineBanner />
    </BrowserRouter>
  );
};

export default App;
