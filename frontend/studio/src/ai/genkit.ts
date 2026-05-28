
import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai'; // Asegúrate de que el nombre del paquete sea correcto

// Carga las variables de entorno para la clave de API
// (Asegúrate de que GOOGLE_API_KEY esté configurada en Vercel)
import * as dotenv from 'dotenv';
dotenv.config();

// Inicializa y configura los plugins de Genkit
configureGenkit({
  plugins: [
    googleAI({
      // Opcional: especifica la versión de la API si es necesario
      // apiVersion: 'v1beta', 
    }),
  ],
  // Habilita el logging en desarrollo para depuración
  logLevel: 'debug',
  // Asegura que los errores en producción no expongan demasiada información
  enableTracingAndMetrics: process.env.NODE_ENV === 'production',
});

// IMPORTANTE: Importa todos los flujos aquí para que se registren
// De esta forma, el archivo principal de la API solo necesita importar este archivo.
import './pico'; 
