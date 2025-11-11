
'use server';

/**
 * @fileOverview Generates a helpful "revision" for a past situation a user regrets.
 *
 * - getRevisionSuggestion - A function that generates the suggestion.
 * - RevisionSuggestionInput - The input type for the function.
 * - RevisionSuggestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RevisionSuggestionInputSchema = z.object({
  situation: z.string().describe("The user's description of a past event they regret or wish had gone differently."),
  language: z.string().describe('The language for the suggestion (e.g., "en", "es", "fr").'),
});
export type RevisionSuggestionInput = z.infer<typeof RevisionSuggestionInputSchema>;

const RevisionSuggestionOutputSchema = z.object({
  suggestion: z.
    string()
    .describe('A detailed, helpful, and constructive revision of the event, written in the first person as if the user is describing their ideal outcome.'),
});
export type RevisionSuggestionOutput = z.infer<typeof RevisionSuggestionOutputSchema>;

export async function getRevisionSuggestion(input: RevisionSuggestionInput): Promise<RevisionSuggestionOutput> {
  return revisionSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'revisionSuggestionPrompt',
  input: {schema: RevisionSuggestionInputSchema},
  output: {schema: RevisionSuggestionOutputSchema},
  prompt: `You are an expert in narrative therapy and personal reframing. A user wants to revise a past event they regret.
  
  Your task is to rewrite the event from a first-person perspective, focusing on the ideal actions and outcomes. The revision should be empowering, detailed, and emotionally positive. It should not just be a simple reversal, but a thoughtful reconstruction of the event as the user wishes it had happened.
  The suggestion MUST be in the following language: {{{language}}}.

  User's Situation: {{{situation}}}

  Generate a constructive and detailed revision for this situation.
  `,
});

const revisionSuggestionFlow = ai.defineFlow(
  {
    name: 'revisionSuggestionFlow',
    inputSchema: RevisionSuggestionInputSchema,
    outputSchema: RevisionSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
