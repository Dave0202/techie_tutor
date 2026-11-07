import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' }
});

export function getPublicFileUrl(fileUrl) {
  if (!fileUrl) return '';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  const baseUrl = api.defaults.baseURL.replace(/\/$/, '');
  return `${baseUrl}${fileUrl.startsWith('/api/') ? fileUrl.slice(4) : `/${fileUrl.replace(/^\/+/, '')}`}`;
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
