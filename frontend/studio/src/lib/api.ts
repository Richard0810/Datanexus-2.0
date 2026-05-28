
import axios from 'axios';

const getBackendUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // 1. En producción, la variable de entorno es obligatoria
  if (process.env.NODE_ENV === 'production') {
    if (!backendUrl) {
      console.warn('NEXT_PUBLIC_BACKEND_URL no configurada en producción.');
      return '';
    }
    return backendUrl.replace(/\/$/, ''); // Limpia barras diagonales finales
  }

  // 2. En desarrollo (Cloud Workstations), se intenta generar la URL dinámicamente
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('cloudworkstations.dev')) {
      const protocol = window.location.protocol;
      const urlWithBackendPort = hostname.replace(/^(\d+)-/, '3001-');
      return `${protocol}//${urlWithBackendPort}`;
    }
  }

  // 3. Fallback para desarrollo local
  return 'http://localhost:3001';
};

const api = axios.create({
  baseURL: getBackendUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('Error de red: El servidor backend no está respondiendo en ' + getBackendUrl());
    }
    return Promise.reject(error);
  }
);

export default api;
