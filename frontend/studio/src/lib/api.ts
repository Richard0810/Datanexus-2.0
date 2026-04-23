import axios from 'axios';

const api = axios.create({
  // En desarrollo local/Cloud Workstations, el backend corre en el puerto 3001
  baseURL: 'http://localhost:3001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
