import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

console.log('🚀 API.JS: Initializing API client');
console.log('🚀 API.JS: Backend URL:', BACKEND_URL);
console.log('🚀 API.JS: API URL:', API);

const api = axios.create({ 
  baseURL: API,
  timeout: 10000 // 10 second timeout
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🚀 API.JS: Request with token to:', config.url);
  } else {
    console.log('🚀 API.JS: Request without token to:', config.url);
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('🚀 API.JS: Response received from:', response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    console.error('🚨 API.JS: Request failed:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      code: error.code
    });
    
    if (error.code === 'ECONNABORTED') {
      console.error('🚨 API.JS: Request timeout');
    }
    return Promise.reject(error);
  }
);

export default api;
