import axios from 'axios';

const getBackendUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // 1. En un entorno de producción (identificado por NODE_ENV), la variable de entorno es OBLIGATORIA.
  if (process.env.NODE_ENV === 'production') {
    if (!backendUrl) {
      // Detiene la aplicación si la URL del backend no está configurada en producción.
      throw new Error('FATAL: La variable de entorno NEXT_PUBLIC_BACKEND_URL no está configurada para el despliegue de producción.');
    }
    return backendUrl.replace(/\/$/, ''); // Limpia la URL y la devuelve.
  }

  // 2. En desarrollo (Cloud Workstations), se intenta generar la URL dinámicamente.
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('cloudworkstations.dev')) {
      const protocol = window.location.protocol;
      // Reemplaza el puerto del frontend (ej. 3000, 9000, 9002) por el del backend (3001)
      const urlWithBackendPort = hostname.replace(/^(\d+)-/, '3001-');
      return `${protocol}//${urlWithBackendPort}`;
    }
  }

  // 3. Fallback para desarrollo local estándar (ej. `npm run dev` en tu máquina).
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
      console.error('CRITICAL: Error de red o servidor no disponible en ' + getBackendUrl());
    }
    return Promise.reject(error);
  }
);

export default api;