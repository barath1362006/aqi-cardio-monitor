import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include token in headers
api.interceptors.request.use((config) => {
  const userString = localStorage.getItem('aqi_user');
  if (userString) {
    try {
      const user = JSON.parse(userString);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (e) {
      console.error('Error parsing user from localStorage', e);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      console.warn('Unauthorized request detected. Clearing session and redirecting...');
      localStorage.removeItem('aqi_user');
      window.location.href = '/'; // Simple redirect to Login
    }
    return Promise.reject(error);
  }
);

export default api;
