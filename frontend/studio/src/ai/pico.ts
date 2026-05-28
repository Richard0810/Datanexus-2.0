import { ai } from './genkit';
import { z } from 'zod';

// Esquema de entrada que coincide con el formulario del frontend
const PicoInputSchema = z.object({
  tema: z.string().optional(),
  poblacion: z.string().optional(),
  intervencion: z.string().optional(),
  comparacion: z.string().optional(),
  resultado: z.string().optional(),
  contexto: z.string().optional(),
});

// Esquema de salida para garantizar una respuesta JSON consistente
const PicoOutputSchema = z.object({
  preguntaPICO: z.string(),
  preguntaPECO: z.string(),
  sugerencia: z.string(),
  keywords: z.array(z.string()),
});

// 1. Definición del Prompt para Gemini
export const picoPrompt = ai.definePrompt({
  name: 'picoQuestionPrompt',
  model: 'googleai/gemini-1.5-flash', // Usamos el modelo recomendado
  input: { schema: PicoInputSchema },
  output: { 
    schema: PicoOutputSchema,
    format: 'json', // Forzamos la salida a JSON
  },
  prompt: `
    Eres un experto en metodología de la investigación y salud pública, especializado en la formulación de preguntas clínicas y de investigación.
    
    Tu tarea es ayudar a un investigador a estructurar una pregunta de investigación clara y enfocada a partir de los componentes que te proporcionen, utilizando los formatos PICO y PECO.

    - **PICO**: Para preguntas sobre la efectividad de una intervención.
      - **P**: Población/Paciente
      - **I**: Intervención
      - **C**: Comparación
      - **O**: Outcome (Resultado)

    - **PECO**: Para preguntas sobre la exposición a un factor de riesgo o pronóstico.
      - **P**: Población/Paciente
      - **E**: Exposición
      - **C**: Comparación
      - **O**: Outcome (Resultado)

    A partir de los siguientes datos de entrada:
    - Tema de Investigación: {{{tema}}}
    - Población (P): {{{poblacion}}}
    - Intervención (I) / Exposición (E): {{{intervencion}}}
    - Comparación (C): {{{comparacion}}}
    - Resultado (O): {{{resultado}}}
    - Contexto (Opcional): {{{contexto}}}

    Realiza las siguientes acciones:
    1.  **Formula la Pregunta PICO**: Construye la pregunta de investigación usando el formato PICO. Asume que la entrada "Intervención / Exposición" es una intervención. Si el campo de comparación está vacío, usa "el tratamiento estándar", "la no intervención" o una alternativa lógica.
    2.  **Formula la Pregunta PECO**: Construye la pregunta de investigación usando el formato PECO. Asume que la entrada "Intervención / Exposición" es una exposición a un factor. Si el campo de comparación está vacío, usa "la no exposición al factor" o una alternativa lógica.
    3.  **Proporciona una Sugerencia Experta**: Ofrece una breve recomendación para mejorar o refinar la pregunta. La sugerencia debe ser constructiva, como proponer una población más específica, un resultado más medible o considerar un contexto diferente.
    4.  **Genera Palabras Clave (Keywords)**: Extrae de 4 a 6 palabras clave o términos MeSH relevantes de los componentes proporcionados, que sean útiles para una búsqueda bibliográfica en bases de datos como PubMed o Scopus. Devuelve las palabras clave en un array de strings.

    **IMPORTANTE**: Devuelve tu respuesta exclusivamente en formato JSON, siguiendo el esquema definido. No incluyas texto adicional, explicaciones fuera del JSON o bloques de Markdown.
  `,
});

// 2. Definición del Flujo que orquesta la llamada a la IA
export const picoFlow = ai.defineFlow(
  {
    name: 'picoQuestionFlow',
    input: { schema: PicoInputSchema },
    output: { schema: PicoOutputSchema },
  },
  async (input) => {
    // Llama al prompt con la entrada validada
    const { output } = await picoPrompt(input);

    // Valida que la IA devolvió una respuesta antes de enviarla
    if (!output) {
      throw new Error("La IA no devolvió el formato de respuesta esperado. Por favor, intenta de nuevo.");
    }

    return output;
  }
);
