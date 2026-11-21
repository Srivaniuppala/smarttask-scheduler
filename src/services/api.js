import axios from 'axios';

// Base Axios instance configured for Python Flask REST API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to attach authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('focusai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server returned status code outside 2xx
      if (error.response.status === 401) {
        // Unauthorized - session expired
        localStorage.removeItem('focusai_token');
      }
      return Promise.reject(error.response.data || { message: 'Server error' });
    } else if (error.request) {
      // Backend server is not reachable - fallback gracefully
      console.warn('[SmartTask AI API] Backend unreachable, using local browser storage');
      return Promise.reject({ isOffline: true, message: 'Backend unreachable' });
    }
    return Promise.reject(error);
  }
);

export default api;
