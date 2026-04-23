import axios from 'axios';

// Función para determinar la URL del backend dinámicamente
const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Si estamos en una Cloud Workstation de Firebase Studio
    if (hostname.includes('cloudworkstations.dev')) {
      // El backend suele estar disponible en el puerto 3001 del mismo host
      // Pero las workstations a veces requieren una URL específica. 
      // Por defecto intentamos localhost, pero permitimos override si es necesario.
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
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

export default api;
