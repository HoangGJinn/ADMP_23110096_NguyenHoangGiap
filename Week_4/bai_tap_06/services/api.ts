import axios from 'axios';

// Base URL configuration
// For Android Emulator: use 10.0.2.2 to access localhost
// For Physical Device: use your computer's IP address
const BASE_URL = 'http://10.0.2.2:8085/api/auth';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    // Token will be added by AuthContext when needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'Đã xảy ra lỗi';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request was made but no response
      return Promise.reject(new Error('Không thể kết nối đến server'));
    } else {
      return Promise.reject(new Error('Đã xảy ra lỗi'));
    }
  }
);

export default api;
