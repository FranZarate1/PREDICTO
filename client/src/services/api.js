/**
 * API Client — Servicio de comunicación con el backend.
 * Configurado con base URL del proxy de Vite.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '',  // Vacío porque Vite proxea /api/* al backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logging en desarrollo
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      '[API Error]',
      error.response?.status,
      error.response?.data?.error?.message || error.message
    );
    return Promise.reject(error);
  }
);

export default api;
