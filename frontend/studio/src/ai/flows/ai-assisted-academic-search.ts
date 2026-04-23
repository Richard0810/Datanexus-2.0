'use server';
/**
 * @fileOverview AI-Assisted Academic Search Flow.
 *
 * This file defines a Genkit flow for performing academic searches using natural language queries.
 * It takes a natural language query as input and returns a list of relevant research materials.
 *
 * @interface NaturalLanguageAcademicSearchInput - The input type for the academic search flow.
 * @interface NaturalLanguageAcademicSearchOutput - The output type for the academic search flow.
 * @function naturalLanguageAcademicSearch - The main function to trigger the academic search flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NaturalLanguageAcademicSearchInputSchema = z.object({
  query: z.string().describe('The natural language query to use for the academic search.'),
});
export type NaturalLanguageAcademicSearchInput = z.infer<typeof NaturalLanguageAcademicSearchInputSchema>;

const NaturalLanguageAcademicSearchOutputSchema = z.object({
  results: z.array(z.string()).describe('A list of relevant research materials found.'),
});
export type NaturalLanguageAcademicSearchOutput = z.infer<typeof NaturalLanguageAcademicSearchOutputSchema>;

export async function naturalLanguageAcademicSearch(input: NaturalLanguageAcademicSearchInput): Promise<NaturalLanguageAcademicSearchOutput> {
  return naturalLanguageAcademicSearchFlow(input);
}

const naturalLanguageAcademicSearchPrompt = ai.definePrompt({
  name: 'naturalLanguageAcademicSearchPrompt',
  input: {schema: NaturalLanguageAcademicSearchInputSchema},
  output: {schema: NaturalLanguageAcademicSearchOutputSchema},
  prompt: `You are an AI assistant specialized in academic research.
  Your task is to take a natural language query and find relevant research materials.
  Return a list of research material titles that would be helpful to the user.

  Query: {{{query}}}
  `,
});

const naturalLanguageAcademicSearchFlow = ai.defineFlow(
  {
    name: 'naturalLanguageAcademicSearchFlow',
    inputSchema: NaturalLanguageAcademicSearchInputSchema,
    outputSchema: NaturalLanguageAcademicSearchOutputSchema,
  },
  async input => {
    const {output} = await naturalLanguageAcademicSearchPrompt(input);
    return output!;
  }
);
