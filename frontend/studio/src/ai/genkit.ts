
// Importa el constructor de Genkit y el plugin de Google AI
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Carga las variables de entorno (necesario para la API Key)
import * as dotenv from 'dotenv';
dotenv.config();

// Crea y exporta la instancia de Genkit configurada
// Esta es la instancia que todos los demás archivos importarán para definir flujos y prompts.
export const ai = genkit({
  plugins: [
    // Configura el plugin de Google AI con la API Key desde las variables de entorno
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY, // Vercel debe tener esta variable configurada
    }),
  ],
  // Habilita el logging en desarrollo para una mejor depuración
  logLevel: 'debug',
  // Deshabilita el tracing en producción para evitar dependencias opcionales (como Jaeger)
  enableTracingAndMetrics: false,
});
