import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enable credentials for CORS
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

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
    
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Handle token expiration (403)
    if (error.response?.status === 403) {
      console.log('Token expired, attempting refresh...');
      // Try to refresh token
      refreshToken().then(() => {
        // Retry original request with new token
        return axiosInstance(error.config);
      }).catch(() => {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.href = '/login';
      });
      return Promise.reject(error);
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

// Refresh token function
async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axiosInstance.post('/api/auth/refresh-token', {
      refresh_token: refreshToken
    });
    
    const { token } = response.data;
    localStorage.setItem('token', token);
    return token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
}

export default axiosInstance;
