'use server';
/**
 * @fileOverview A flow to assist students in formulating PICO/PECO questions.
 *
 * - formulatePicoPecoQuestion - A function that formulates PICO/PECO questions based on user input.
 * - FormulatePicoPecoQuestionInput - The input type for the formulatePicoPecoQuestion function.
 * - FormulatePicoPecoQuestionOutput - The return type for the formulatePicoPecoQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormulatePicoPecoQuestionInputSchema = z.object({
  topic: z.string().describe('The research topic.'),
  interventionOrExposure: z.string().describe('The intervention or exposure being considered.'),
  comparison: z.string().describe('The comparison group or intervention.'),
  outcome: z.string().describe('The desired outcome or effect.'),
  population: z.string().describe('The population of interest.'),
  context: z.string().optional().describe('Additional context or background information.'),
});
export type FormulatePicoPecoQuestionInput = z.infer<typeof FormulatePicoPecoQuestionInputSchema>;

const FormulatePicoPecoQuestionOutputSchema = z.object({
  picoQuestion: z.string().describe('A formulated PICO question.'),
  pecoQuestion: z.string().describe('A formulated PECO question.'),
});
export type FormulatePicoPecoQuestionOutput = z.infer<typeof FormulatePicoPecoQuestionOutputSchema>;

export async function formulatePicoPecoQuestion(input: FormulatePicoPecoQuestionInput): Promise<FormulatePicoPecoQuestionOutput> {
  return formulatePicoPecoQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'formulatePicoPecoQuestionPrompt',
  input: {schema: FormulatePicoPecoQuestionInputSchema},
  output: {schema: FormulatePicoPecoQuestionOutputSchema},
  prompt: `You are an expert in research methodology, skilled in formulating PICO and PECO questions.
Based on the information provided, create both a PICO and a PECO question.

Topic: {{{topic}}}
Population (P): {{{population}}}
Intervention (I) / Exposure (E): {{{interventionOrExposure}}}
Comparison (C): {{{comparison}}}
Outcome (O): {{{outcome}}}
{{#if context}}
Context: {{{context}}}
{{/if}}

Formulate the PICO Question and the PECO question based on the data.
  `,
});

const formulatePicoPecoQuestionFlow = ai.defineFlow(
  {
    name: 'formulatePicoPecoQuestionFlow',
    inputSchema: FormulatePicoPecoQuestionInputSchema,
    outputSchema: FormulatePicoPecoQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a response.');
    }
    return output;
  }
);
