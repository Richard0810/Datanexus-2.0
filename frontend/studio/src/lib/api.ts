
import axios from 'axios';

// Función robusta para determinar la URL del backend en Cloud Workstations
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Si estamos en una Cloud Workstation
    if (hostname.includes('cloudworkstations.dev')) {
      // Reemplazamos el puerto del frontend (cualquiera que sea) por el 3001 del backend
      // El patrón suele ser: puerto-studio-id.dominio
      const portPrefixMatch = hostname.match(/^(\d+)-/);
      if (portPrefixMatch) {
        const currentPort = portPrefixMatch[1];
        return `${protocol}//${hostname.replace(`${currentPort}-`, '3001-')}`;
      }
      
      // Fallback: búsqueda y reemplazo directo de puertos comunes
      const fallbackHostname = hostname.replace('9002', '3001').replace('9000', '3001').replace('3000', '3001');
      return `${protocol}//${fallbackHostname}`;
    }
  }
  // Localhost por defecto
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
    const errorInfo = {
      url: error.config?.url,
      message: error.message,
      status: error.response?.status,
      baseURL: error.config?.baseURL,
      data: error.response?.data
    };
    
    console.error('Error en la llamada a la API:', errorInfo);
    return Promise.reject(error);
  }
);

export default api;
