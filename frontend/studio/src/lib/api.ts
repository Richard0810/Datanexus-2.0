import axios from 'axios';

// Función para determinar la URL del backend dinámicamente
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Si estamos en una Cloud Workstation de Firebase Studio
    if (hostname.includes('cloudworkstations.dev')) {
      // Las workstations mapean puertos en el subdominio: puerto-nombre-id...
      // Ejemplo: 9002-studio-xxx.cloudworkstations.dev -> 3001-studio-xxx.cloudworkstations.dev
      const portPattern = /^(\d+)-(.*)/;
      if (portPattern.test(hostname)) {
        const newHostname = hostname.replace(portPattern, '3001-$2');
        return `${protocol}//${newHostname}`;
      }
      
      // Si no tiene el puerto en el subdominio, intentamos localhost (aunque puede fallar por Mixed Content)
      return `http://localhost:3001`; 
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
