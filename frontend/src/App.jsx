import React, { useContext, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { getUnsyncedLogs, markLogsSynced } from "./db/localForage";
import api from "./api/client";
import { AuthContext } from "./context/AuthContext";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import DiagnoseScan from "./pages/DiagnoseScan";
import JobBoard from "./pages/JobBoard";
import Machinery from "./pages/Machinery";
import Weather from "./pages/Weather";
import BottomNav from "./components/BottomNav";
import OfflineBanner from "./components/OfflineBanner";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="page-container">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
};

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
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#1a3a2a',
          color: '#fff',
        }
      }}/>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/diagnose" element={<ProtectedRoute><DiagnoseScan /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><JobBoard /></ProtectedRoute>} />
        <Route path="/machinery" element={<ProtectedRoute><Machinery /></ProtectedRoute>} />
        <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <OfflineBanner />
    </BrowserRouter>
  );
};

export default App;
