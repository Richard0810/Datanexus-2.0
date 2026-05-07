
import axios from 'axios';

// Función para determinar la URL del backend dinámicamente en el entorno de Cloud Workstations
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Si estamos en una Cloud Workstation (Firebase Studio)
    if (hostname.includes('cloudworkstations.dev')) {
      // Reemplazamos cualquier puerto al inicio (ej: 9000-, 9002-) por el puerto del backend (3001-)
      // Buscamos un patrón de puerto al inicio (ej: 9002-studio-...)
      const portPrefixMatch = hostname.match(/^(\d+)-/);
      if (portPrefixMatch) {
        const currentPort = portPrefixMatch[1];
        if (currentPort !== '3001') {
          return `${protocol}//${hostname.replace(`${currentPort}-`, '3001-')}`;
        }
      }
      
      // Fallback: si no hay puerto al inicio, intentamos reemplazar 9002 por 3001 en cualquier parte
      const fallbackHostname = hostname.replace('9002', '3001');
      if (fallbackHostname !== hostname) {
        return `${protocol}//${fallbackHostname}`;
      }
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

// Interceptor para logs de error en desarrollo
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Evitamos mostrar un objeto vacío en el log
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
