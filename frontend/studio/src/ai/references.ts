import { ai } from './genkit';
import { z } from 'zod';

const ReferenceInputSchema = z.object({
  references: z.string().describe("El texto de las referencias a formatear."),
  targetFormat: z.enum(['APA 7', 'Vancouver', 'IEEE', 'Harvard', 'Chicago']).describe("El formato de citación destino."),
});

const ReferenceOutputSchema = z.object({
  formattedReferences: z.array(z.string()).describe("Lista de referencias formateadas."),
  count: z.number().describe("Cantidad de referencias procesadas."),
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
      prompt: `Eres un experto en bibliografía y gestión de referencias académicas.
      Tu tarea es tomar el texto proporcionado y convertir cada referencia al formato solicitado: ${input.targetFormat}.
      
      INSTRUCCIONES:
      1. Identifica cada referencia individual en el texto.
      2. Aplica estrictamente las reglas de ${input.targetFormat} (autores, año, títulos en cursiva si aplica, editorial, URL/DOI, etc.).
      3. Devuelve una lista de strings con las referencias formateadas.
      
      REFERENCIAS A PROCESAR:
      {{{references}}}
      `,
    });

    if (!output) {
      throw new Error("La IA no pudo procesar las referencias.");
    }

    return output;
  }
);
