import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1/web';

export const api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(err);
  },
);
