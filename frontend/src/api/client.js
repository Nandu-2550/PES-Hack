import axios from "axios";

const API_BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:5000"
  : "https://agrihub-backend.onrender.com";

const client = axios.create({
  baseURL: API_BASE_URL,
});

client.interceptors.request.use(
  (config) => {
    // AuthContext persists token under `agrishield_token`.
    const token = localStorage.getItem("agrishield_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default client;
