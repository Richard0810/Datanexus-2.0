// Importa el constructor de Genkit y el plugin unificado de Google AI
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Carga las variables de entorno
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Instancia centralizada de Genkit.
 * Utilizamos el plugin @genkit-ai/google-genai para mayor estabilidad en producción.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY, // Aseguramos que la llave se pase explícitamente para Vercel
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: false,
});