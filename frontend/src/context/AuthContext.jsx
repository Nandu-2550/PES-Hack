import React, { createContext, useState, useEffect } from "react";
import client from "../api/client";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedToken = localStorage.getItem('agrishield_token');
    const cachedUser = localStorage.getItem('agrishield_user');

    if (cachedToken && cachedUser) {
      // Immediately restore session from cache — no network needed
      setUser(JSON.parse(cachedUser));
      setToken(cachedToken);
      setLoading(false);

      // Then silently try to refresh from server in background
      client.get('/api/auth/me')
        .then(res => {
          setUser(res.data);
          localStorage.setItem('agrishield_user', JSON.stringify(res.data));
        })
        .catch(err => {
          if (err.response?.status === 401) {
            // Token is actually invalid/expired
            logout();
          } else {
            // Server unreachable — stay on cached session, do NOT logout
            console.warn('AgriShield: offline session active');
          }
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (payload) => {
    const res = await client.post("/api/auth/login", payload);
    setToken(res.data.token);
    localStorage.setItem("agrishield_token", res.data.token);
    localStorage.setItem("agrishield_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    // Return the full response so callers can persist session keys independently
    return res;
  };

  const register = async (formData) => {
    const res = await client.post("/api/auth/register", formData);
    setToken(res.data.token);
    localStorage.setItem("agrishield_token", res.data.token);
    localStorage.setItem("agrishield_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    // Return the full response so callers can persist session keys independently
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    // Remove AuthContext keys
    localStorage.removeItem("agrishield_token");
    localStorage.removeItem("agrishield_user");
    // Remove ProtectedRoute keys — must be cleared together on logout
    localStorage.removeItem("userToken");
    localStorage.removeItem("userProfile");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
