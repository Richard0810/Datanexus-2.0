import axios from 'axios';

// Función robusta para determinar la URL del backend en Cloud Workstations
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Si estamos en una Cloud Workstation (IDX / Firebase Studio)
    if (hostname.includes('cloudworkstations.dev')) {
      // Buscamos cualquier prefijo de puerto (ej. 9002-) y lo reemplazamos por 3001-
      const urlWithNewPort = hostname.replace(/^(\d+)-/, '3001-');
      
      // Si no tiene prefijo pero tiene el puerto al final o en medio
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
      // Error de red puro (CORS o Servidor caído)
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
