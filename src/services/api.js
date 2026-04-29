import axios from 'axios';

// Use a relative `/api` base during development so Vite's proxy forwards requests
// to the deployed backend and avoids CORS. In production, allow overriding
// with `VITE_API_URL` or fall back to the deployed backend URL.
const DEFAULT_PROD_URL = 'https://cdps-backend.onrender.com/api';
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? '/api' : DEFAULT_PROD_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
  ,
  // Avoid hanging requests when backend is unreachable
  timeout: 8000
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
