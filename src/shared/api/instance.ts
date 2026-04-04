import axios from 'axios';

export const API_URL = 'https://my-json-server.typicode.com/AlexanderAr-dev/mock-api';

export const api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(err);
  },
);
