import { ai } from './genkit';
import { z } from 'zod';

const ReferenceInputSchema = z.object({
  references: z.string().describe("El texto de las referencias a formatear (puede ser BibTeX, RIS o texto plano)."),
  targetFormat: z.enum(['APA 7', 'Vancouver', 'IEEE', 'Harvard', 'Chicago']).describe("El formato de citación destino."),
});

const ReferenceOutputSchema = z.object({
  formattedReferences: z.array(z.string()).describe("Lista de referencias formateadas individualmente."),
  count: z.number().describe("Cantidad total de referencias procesadas."),
});

export const referenceFormatterFlow = ai.defineFlow(
  {
    name: 'referenceFormatterFlow',
    inputSchema: ReferenceInputSchema,
    outputSchema: ReferenceOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-3.5-flash',
      input: {
        schema: ReferenceInputSchema,
        data: input,
      },
      output: {
        schema: ReferenceOutputSchema,
        format: 'json',
      },
      prompt: `Eres un experto bibliotecario y gestor de metadatos académicos.
      
      TAREA:
      Convierte el siguiente contenido bibliográfico al formato: ${input.targetFormat}.
      
      INSTRUCCIONES CRÍTICAS DE FORMATO:
      1. NO USES NINGÚN TIPO DE FORMATO MARKDOWN. 
      2. ESTÁ TOTALMENTE PROHIBIDO usar asteriscos (*), guiones bajos (_) o cualquier símbolo de estilo para cursivas o negritas.
      3. Devuelve el texto como TEXTO PLANO LIMPIO. Por ejemplo, en lugar de "*Science*", devuelve simplemente Science.
      
      REGLAS DE PROCESAMIENTO:
      1. Si el texto es BibTeX, extrae todos los campos y genera la cita completa.
      2. Si el texto es desordenado, reconstruye la cita con los datos disponibles.
      3. Mantén el orden alfabético.
      4. Devuelve UN ARREGLO de strings con las citas limpias.
      
      REFERENCIAS A PROCESAR:
      ${input.references}
      `,
    });

    if (!output) {
      throw new Error("La IA no pudo procesar las referencias con el modelo 3.5 Flash.");
    }

    return {
      formattedReferences: output.formattedReferences || [],
      count: output.formattedReferences?.length || 0
    };
  }
);
