import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai'; // Corregido: Usar el paquete correcto para la v1.8.0

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GEMINI_API_KEY })
  ],
});
