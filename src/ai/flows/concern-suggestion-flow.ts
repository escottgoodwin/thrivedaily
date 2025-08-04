'use server';

/**
 * @fileOverview Generates a helpful suggestion for a specific user concern.
 *
 * - getConcernSuggestion - A function that generates the suggestion.
 * - ConcernSuggestionInput - The input type for the getConcernSuggestion function.
 * - ConcernSuggestionOutput - The return type for the getConcernSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConcernSuggestionInputSchema = z.object({
  concern: z.string().describe("The user's specific concern."),
  language: z.string().describe('The language for the suggestion (e.g., "en", "es", "fr").'),
});
export type ConcernSuggestionInput = z.infer<typeof ConcernSuggestionInputSchema>;

const ConcernSuggestionOutputSchema = z.object({
  suggestion: z.
    string()
    .describe('A helpful and actionable suggestion for dealing with the concern.'),
});
export type ConcernSuggestionOutput = z.infer<typeof ConcernSuggestionOutputSchema>;

export async function getConcernSuggestion(input: ConcernSuggestionInput): Promise<ConcernSuggestionOutput> {
  return concernSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'concernSuggestionPrompt',
  input: {schema: ConcernSuggestionInputSchema},
  output: {schema: ConcernSuggestionOutputSchema},
  prompt: `You are a caring and supportive AI assistant. A user is sharing one of their concerns with you.
  
  Your task is to provide a single, concise, and actionable piece of advice to help them address this concern. The suggestion should be practical and encouraging.
  The suggestion MUST be in the following language: {{{language}}}.

  User's Concern: {{{concern}}}
  `,
});

const concernSuggestionFlow = ai.defineFlow(
  {
    name: 'concernSuggestionFlow',
    inputSchema: ConcernSuggestionInputSchema,
    outputSchema: ConcernSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
