
// Importa el constructor de Genkit y el plugin unificado de Google AI
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Carga las variables de entorno
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Instancia centralizada de Genkit.
 * Pasamos explícitamente la API Key para asegurar compatibilidad en Vercel.
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY, 
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: false,
});
