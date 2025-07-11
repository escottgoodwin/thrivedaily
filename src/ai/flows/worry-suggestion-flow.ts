'use server';

/**
 * @fileOverview Generates a helpful suggestion for a specific user worry.
 *
 * - getWorrySuggestion - A function that generates the suggestion.
 * - WorrySuggestionInput - The input type for the getWorrySuggestion function.
 * - WorrySuggestionOutput - The return type for the getWorrySuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WorrySuggestionInputSchema = z.object({
  worry: z.string().describe("The user's specific worry."),
});
export type WorrySuggestionInput = z.infer<typeof WorrySuggestionInputSchema>;

const WorrySuggestionOutputSchema = z.object({
  suggestion: z.
    string()
    .describe('A helpful and actionable suggestion for dealing with the worry.'),
});
export type WorrySuggestionOutput = z.infer<typeof WorrySuggestionOutputSchema>;

export async function getWorrySuggestion(input: WorrySuggestionInput): Promise<WorrySuggestionOutput> {
  return worrySuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'worrySuggestionPrompt',
  input: {schema: WorrySuggestionInputSchema},
  output: {schema: WorrySuggestionOutputSchema},
  prompt: `You are a caring and supportive AI assistant. A user is sharing one of their worries with you.
  
  Your task is to provide a single, concise, and actionable piece of advice to help them address this worry. The suggestion should be practical and encouraging.

  User's Worry: {{{worry}}}
  `,
});

const worrySuggestionFlow = ai.defineFlow(
  {
    name: 'worrySuggestionFlow',
    inputSchema: WorrySuggestionInputSchema,
    outputSchema: WorrySuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);