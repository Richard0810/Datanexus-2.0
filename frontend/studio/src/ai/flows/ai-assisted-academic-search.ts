'use server';
/**
 * @fileOverview AI-Assisted Academic Search Flow.
 *
 * This file defines a Genkit flow for performing academic searches using natural language queries.
 * It provides structured results including snippets, probable sources, and search refinement tips.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchResultSchema = z.object({
  title: z.string().describe('The title of the research material.'),
  snippet: z.string().describe('A brief summary or key finding of the material.'),
  source: z.string().describe('The academic database or type of source (e.g., PubMed, Scielo, Google Scholar).'),
});

const NaturalLanguageAcademicSearchInputSchema = z.object({
  query: z.string().min(5).describe('The natural language query to use for the academic search.'),
});
export type NaturalLanguageAcademicSearchInput = z.infer<typeof NaturalLanguageAcademicSearchInputSchema>;

const NaturalLanguageAcademicSearchOutputSchema = z.object({
  results: z.array(SearchResultSchema).describe('A list of relevant research materials found.'),
  refinements: z.array(z.string()).describe('Suggestions to refine the search using boolean operators or more specific terms.'),
  expertTip: z.string().describe('A tip from an expert librarian on how to approach this specific research topic.'),
});
export type NaturalLanguageAcademicSearchOutput = z.infer<typeof NaturalLanguageAcademicSearchOutputSchema>;

export async function naturalLanguageAcademicSearch(input: NaturalLanguageAcademicSearchInput): Promise<NaturalLanguageAcademicSearchOutput> {
  return naturalLanguageAcademicSearchFlow(input);
}

const naturalLanguageAcademicSearchPrompt = ai.definePrompt({
  name: 'naturalLanguageAcademicSearchPrompt',
  model: 'googleai/gemini-3.5-flash',
  input: {schema: NaturalLanguageAcademicSearchInputSchema},
  output: {
    schema: NaturalLanguageAcademicSearchOutputSchema,
    format: 'json'
  },
  prompt: `Eres un Bibliotecario Académico Senior y experto en recuperación de información.
  Tu tarea es procesar la siguiente consulta en lenguaje natural y proporcionar una estructura de resultados de investigación.

  CONSULTA DEL USUARIO: {{{query}}}

  INSTRUCCIONES:
  1. Genera 5 resultados de investigación altamente relevantes (pueden ser artículos, libros o tesis).
  2. Para cada resultado, proporciona un título académico, un 'snippet' (resumen de 2 líneas) y la fuente académica más probable.
  3. Proporciona 3 sugerencias de refinamiento de búsqueda usando operadores booleanos (AND, OR, NOT).
  4. Incluye un "Expert Tip" sobre qué bases de datos específicas o descriptores (MeSH, DeCS) serían ideales para este tema.
  
  IMPORTANTE: No uses formato Markdown como asteriscos o negritas en los textos descriptivos. Devuelve JSON puro.
  `,
});

export const naturalLanguageAcademicSearchFlow = ai.defineFlow(
  {
    name: 'naturalLanguageAcademicSearchFlow',
    inputSchema: NaturalLanguageAcademicSearchInputSchema,
    outputSchema: NaturalLanguageAcademicSearchOutputSchema,
  },
  async input => {
    const {output} = await naturalLanguageAcademicSearchPrompt(input);
    if (!output) {
      throw new Error('La IA no pudo procesar la búsqueda académica.');
    }
    return output;
  }
);
