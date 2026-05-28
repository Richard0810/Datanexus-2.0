
// Importa la instancia 'ai' de nuestro archivo de configuración central
import { ai } from './genkit';
import * as z from 'zod';

// 1. Esquema de Entrada (Input Schema)
// Define la estructura de los datos que el usuario nos dará desde el frontend.
const PicoInputSchema = z.object({
  tema: z.string(),
  poblacion: z.string(),
  intervencion: z.string(),
  comparacion: z.string(),
  resultado: z.string(),
  contexto: z.string().optional(),
});

// 2. Esquema de Salida (Output Schema)
// Define la estructura JSON que QUEREMOS que la IA nos devuelva. Es nuestra garantía.
const PicoOutputSchema = z.object({
  preguntaPico: z.string().describe("La pregunta de investigación formulada en español en formato PICO/PECO."),
  preguntaIngles: z.string().describe("La pregunta de investigación traducida al inglés."),
  ecuacionBusqueda: z.string().describe("La ecuación de búsqueda booleana avanzada para bases de datos académicas, en inglés."),
});

// 3. El Prompt
// Aquí es donde le decimos a la IA qué hacer. Usamos la instancia 'ai' importada.
const generarPreguntaPico = ai.definePrompt({
  name: 'generarPreguntaPico',
  model: 'googleai/gemini-1.5-flash', // Usamos un modelo moderno y eficiente
  input: { schema: PicoInputSchema },
  output: { 
    schema: PicoOutputSchema,
    format: 'json' // ¡CRÍTICO! Forzamos la salida a JSON para evitar errores de parseo.
  },
  prompt: `Eres un experto bibliotecario y especialista en revisiones sistemáticas. A partir de los siguientes componentes PICO/PECO, genera una pregunta de investigación clara y concisa, su traducción al inglés y una ecuación de búsqueda booleana avanzada para usar en Scopus o Web of Science. 

  Tema: {{{tema}}}
  Población (P): {{{poblacion}}}
  Intervención/Exposición (I/E): {{{intervencion}}}
  Comparación (C): {{{comparacion}}}
  Resultado (O): {{{resultado}}}
  {{#if contexto}}Contexto: {{{contexto}}}{{/if}}
  `,
});

// 4. El Flujo (Flow)
// Este es el endpoint que nuestro frontend llamará. Orquesta la lógica.
export const picoQuestionFlow = ai.defineFlow(
  { 
    name: 'picoQuestionFlow',
    inputSchema: PicoInputSchema,
    outputSchema: PicoOutputSchema,
  },
  async (input) => {
    // Llama al prompt con la entrada del usuario
    const { output } = await generarPreguntaPico(input);

    // Validación: Nos aseguramos de que la IA no devolvió algo inesperado
    if (!output) {
      throw new Error("La IA no devolvió una respuesta en el formato esperado.");
    }

    // Devolvemos la respuesta estructurada
    return output;
  }
);
