import { ai } from './genkit';
import { z } from 'zod';

const PicoInputSchema = z.object({
  tema: z.string().optional(),
  poblacion: z.string(),
  intervencion: z.string(),
  comparacion: z.string(),
  resultado: z.string(),
  contexto: z.string().optional(),
});

const PicoOutputSchema = z.object({
  preguntaPICO: z.string().describe("La pregunta de investigación formulada en formato PICO."),
  preguntaPECO: z.string().describe("La pregunta de investigación formulada en formato PECO."),
  sugerencia: z.string().describe("Sugerencia de un experto bibliotecario para refinar la búsqueda."),
  keywords: z.array(z.string()).describe("Lista de palabras clave (Keywords) recomendadas."),
});

const generarPreguntaPico = ai.definePrompt({
  name: 'generarPreguntaPico',
  model: 'gemini-1.5-flash',
  input: { schema: PicoInputSchema },
  output: { 
    schema: PicoOutputSchema,
    format: 'json'
  },
  prompt: `Eres un experto bibliotecario y especialista en revisiones sistemáticas. 
  A partir de los siguientes componentes, genera una pregunta de investigación en formato PICO (Población, Intervención, Comparación, Resultado) 
  y otra en formato PECO (Población, Exposición, Comparación, Resultado). 
  
  Además, proporciona una "Sugerencia del Experto" sobre cómo mejorar la búsqueda en bases de datos académicas 
  y una lista de al menos 5 palabras clave (keywords) relevantes tanto en inglés como en español.

  DATOS PROPORCIONADOS:
  Tema: {{{tema}}}
  Población (P): {{{poblacion}}}
  Intervención/Exposición (I/E): {{{intervencion}}}
  Comparación (C): {{{comparacion}}}
  Resultado (O): {{{resultado}}}
  {{#if contexto}}Contexto: {{{contexto}}}{{/if}}
  `,
});

export const picoQuestionFlow = ai.defineFlow(
  { 
    name: 'picoQuestionFlow',
    inputSchema: PicoInputSchema,
    outputSchema: PicoOutputSchema,
  },
  async (input) => {
    const { output } = await generarPreguntaPico(input);

    if (!output) {
      throw new Error("La IA no devolvió una respuesta en el formato esperado.");
    }

    return output;
  }
);