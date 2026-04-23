'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating AI-powered summaries or explanations of selected data subsets.
 *
 * - aiDataInsightSummary - A function that handles the generation of data insights.
 * - AiDataInsightSummaryInput - The input type for the aiDataInsightSummary function.
 * - AiDataInsightSummaryOutput - The return type for the aiDataInsightSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiDataInsightSummaryInputSchema = z.object({
  data: z
    .array(z.string())
    .describe('An array of data records, each as a string, to be summarized or explained.'),
});
export type AiDataInsightSummaryInput = z.infer<typeof AiDataInsightSummaryInputSchema>;

const AiDataInsightSummaryOutputSchema = z.object({
  summary: z.string().describe('An AI-generated summary or explanation of the provided data subset.'),
});
export type AiDataInsightSummaryOutput = z.infer<typeof AiDataInsightSummaryOutputSchema>;

const aiDataInsightSummaryPrompt = ai.definePrompt({
  name: 'aiDataInsightSummaryPrompt',
  input: {schema: AiDataInsightSummaryInputSchema},
  output: {schema: AiDataInsightSummaryOutputSchema},
  prompt: `You are an expert data analyst.
Based on the following subset of data records, provide a concise summary or explanation. Highlight key insights, patterns, or anomalies.
The data records are provided as an array of strings. Each string represents a data record.

Data:
{{#each data}}
- {{{this}}}
{{/each}}`,
});

const aiDataInsightSummaryFlow = ai.defineFlow(
  {
    name: 'aiDataInsightSummaryFlow',
    inputSchema: AiDataInsightSummaryInputSchema,
    outputSchema: AiDataInsightSummaryOutputSchema,
  },
  async input => {
    const {output} = await aiDataInsightSummaryPrompt(input);
    return output!;
  }
);

export async function aiDataInsightSummary(
  input: AiDataInsightSummaryInput
): Promise<AiDataInsightSummaryOutput> {
  return aiDataInsightSummaryFlow(input);
}
