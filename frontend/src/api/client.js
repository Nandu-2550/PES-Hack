import axios from "axios";

// Using relative path so it hits the Vite dev server proxy or the current host
const client = axios.create();

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
