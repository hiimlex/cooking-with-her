import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333',
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('cwh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRoute = window.location.pathname === import.meta.env.BASE_URL ||
      window.location.pathname === import.meta.env.BASE_URL.replace(/\/$/, '');
    if (error.response?.status === 401 && !isLoginRoute) {
      localStorage.removeItem('cwh_token');
      window.location.href = import.meta.env.BASE_URL;
    }
    return Promise.reject(error);
  },
);
