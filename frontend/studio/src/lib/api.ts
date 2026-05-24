import axios from 'axios';

// Función robusta para determinar la URL del backend en desarrollo y producción
const getBackendUrl = () => {
  // 1. Prioridad: Variable de entorno explícita (Ideal para Producción en Vercel)
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }

  // 2. Detección dinámica para Cloud Workstations (Entorno de desarrollo actual)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (hostname.includes('cloudworkstations.dev')) {
      const urlWithNewPort = hostname.replace(/^(\d+)-/, '3001-');
      const finalHostname = urlWithNewPort
        .replace('9002', '3001')
        .replace('9000', '3001')
        .replace('3000', '3001');
        
      return `${protocol}//${finalHostname}`;
    }
  }

  // 3. Fallback para localhost tradicional
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
      console.error('Error de red: El backend no responde en ' + getBackendUrl());
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;