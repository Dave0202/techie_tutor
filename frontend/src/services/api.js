import axios from 'axios';

const configuredBaseURL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? 'http://localhost:8080/api' : 'https://techietutors.onrender.com/api');
const trimmedBaseURL = configuredBaseURL.replace(/\/+$/, '');
const apiBaseURL = /\/api$/i.test(trimmedBaseURL) ? trimmedBaseURL : `${trimmedBaseURL}/api`;

const api = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' }
});

export function getPublicFileUrl(fileUrl) {
  if (!fileUrl) return '';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  
  // Extract root origin by removing trailing /api from baseURL
  const rootOrigin = api.defaults.baseURL.replace(/\/api\/?$/, '');
  const cleanPath = fileUrl.startsWith('/api') ? fileUrl.slice(4) : fileUrl;
  
  return `${rootOrigin}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('vt_token');
      localStorage.removeItem('vt_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
