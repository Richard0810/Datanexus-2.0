import axios from 'axios';

const api = axios.create({
  // Prioriza la variable de entorno, de lo contrario usa el puerto por defecto de NestJS
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true,
});

export default api;
