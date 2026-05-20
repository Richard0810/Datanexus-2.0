
import axios from 'axios';

// Función robusta para determinar la URL del backend en Cloud Workstations
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Si estamos en una Cloud Workstation
    if (hostname.includes('cloudworkstations.dev')) {
      // Reemplazamos el puerto del frontend (9002) por el 3001 del backend
      const portPrefixMatch = hostname.match(/^(\d+)-/);
      if (portPrefixMatch) {
        const currentPort = portPrefixMatch[1];
        return `${protocol}//${hostname.replace(`${currentPort}-`, '3001-')}`;
      }
      
      const fallbackHostname = hostname.replace('9002', '3001').replace('9000', '3001').replace('3000', '3001');
      return `${protocol}//${fallbackHostname}`;
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
    // Si es un error de red (backend caído o CORS), evitamos JSON.stringify que puede fallar o devolver {}
    if (!error.response) {
      console.error('Error de red o servidor no disponible:', error.message);
      return Promise.reject(error);
    }

    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    };
    
    // Logueamos de forma más detallada para depuración
    console.error('API Error:', `[${errorInfo.method}] ${errorInfo.url} - Status: ${errorInfo.status}`, errorInfo.data);
    return Promise.reject(error);
  }
);

export default api;
