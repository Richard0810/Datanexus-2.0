import axios from 'axios';

// Función para determinar la URL del backend dinámicamente en el entorno de Cloud Workstations
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Si estamos en una Cloud Workstation (Firebase Studio)
    if (hostname.includes('cloudworkstations.dev')) {
      // El patrón habitual es puerto-nombre-id.cluster...
      // Queremos cambiar el puerto 9002 (frontend) por el 3001 (backend)
      if (hostname.startsWith('9002-')) {
        return `${protocol}//${hostname.replace('9002-', '3001-')}`;
      }
      
      // Fallback: si el puerto no está al inicio, intentamos reemplazarlo en cualquier parte
      // (algunas configuraciones de red pueden variar)
      const newHostname = hostname.replace('9002', '3001');
      if (newHostname !== hostname) {
        return `${protocol}//${newHostname}`;
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
    console.error('Error en la llamada a la API:', {
      url: error.config?.url,
      message: error.message,
      status: error.response?.status,
      baseURL: error.config?.baseURL
    });
    return Promise.reject(error);
  }
);

export default api;
