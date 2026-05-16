import axios from 'axios';

// Dynamic API URL that adapts to current network
// - In development: uses current hostname (works with any IP)
// - In production: uses environment variable
const getApiUrl = () => {
  // If explicitly set in .env, use that (for production)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development: automatically use current hostname
  // This works whether you access via localhost, 10.0.28.66, or any other IP
  if (import.meta.env.DEV) {
    const hostname = window.location.hostname;
    return `http://${hostname}:8000/api`;
  }
  
  // Fallback
  return 'http://127.0.0.1:8000/api';
};

const API_URL = getApiUrl();

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enable credentials for CORS
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

// Add token and correlation ID to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add unique request ID for tracing (Correlation ID)
    config.headers['X-Correlation-ID'] = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors gracefully
    if (!error.response) {
      console.warn('Network error - please check your connection');
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Handle 503 Maintenance Mode
    if (error.response?.status === 503 && error.response?.data?.maintenance_mode) {
      if (window.location.pathname !== '/maintenance' && !window.location.pathname.startsWith('/admin')) {
        window.location.href = '/maintenance';
      }
      return Promise.reject(error);
    }

    // Handle token expiration (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = localStorage.getItem('refresh_token');
      
      if (!refreshTokenValue) {
        // No refresh token available, logout
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      return new Promise((resolve, reject) => {
        axiosInstance
          .post('/auth/refresh-token', {
            refresh_token: refreshTokenValue
          })
          .then(response => {
            const { token } = response.data;
            localStorage.setItem('token', token);
            axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            processQueue(null, token);
            resolve(axiosInstance(originalRequest));
          })
          .catch(err => {
            console.error('Token refresh failed:', err);
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
            window.location.href = '/login';
            processQueue(err, null);
            reject(err);
          });
      });
    }
    
    // Handle 404 errors gracefully
    if (error.response?.status === 404) {
      console.warn('Resource not found');
      return Promise.reject(error);
    }
    
    // Handle 500 errors gracefully
    if (error.response?.status === 500) {
      console.warn('Server error - please try again later');
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
