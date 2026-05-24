import axios from 'axios';

// Función robusta para determinar la URL del backend
const getBackendUrl = () => {
  // En producción, usamos la variable de entorno NEXT_PUBLIC_BACKEND_URL
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }

  // Fallback para entornos de desarrollo en Cloud Workstations
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
      console.error('CRITICAL: Error de red o servidor no disponible:', error.message);
      return Promise.reject(error);
    }

    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    };
    
    console.error('API Error:', `[${errorInfo.method}] ${errorInfo.url} - Status: ${errorInfo.status}`, errorInfo.data);
    return Promise.reject(error);
  }
);

export default api;
