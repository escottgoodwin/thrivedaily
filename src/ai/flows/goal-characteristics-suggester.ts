
'use server';

/**
 * @fileOverview Generates suggestions for personal characteristics needed to achieve a goal.
 *
 * - getCharacteristicSuggestions - A function that generates the suggestions.
 * - CharacteristicSuggestionsInput - The input type for the function.
 * - CharacteristicSuggestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CharacteristicSuggestionsInputSchema = z.object({
  goal: z.string().describe("The user's goal."),
  description: z.string().optional().describe("A more detailed description of the goal."),
  language: z.string().describe('The language for the suggestions (e.g., "en", "es", "fr").'),
});
export type CharacteristicSuggestionsInput = z.infer<typeof CharacteristicSuggestionsInputSchema>;

const CharacteristicSuggestionsOutputSchema = z.object({
  characteristics: z
    .array(z.string())
    .describe('A list of 5-7 concise, one-to-two-word personal characteristics or traits.'),
});
export type CharacteristicSuggestionsOutput = z.infer<typeof CharacteristicSuggestionsOutputSchema>;

export async function getCharacteristicSuggestions(input: CharacteristicSuggestionsInput): Promise<CharacteristicSuggestionsOutput> {
  return characteristicSuggesterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'characteristicSuggesterPrompt',
  input: {schema: CharacteristicSuggestionsInputSchema},
  output: {schema: CharacteristicSuggestionsOutputSchema},
  prompt: `You are a motivational coach and personal development expert.
Your task is to identify the key personal characteristics a person needs to embody to achieve a specific goal.
Based on the goal and its description, provide a list of 5-7 essential traits.
Each characteristic should be concise, ideally one or two words (e.g., "Disciplined", "Resilient", "Focused Learner").
You MUST respond in the following language: {{{language}}}.

Goal: {{{goal}}}
Description: {{{description}}}

What are the key characteristics needed to achieve this?`,
});

const characteristicSuggesterFlow = ai.defineFlow(
  {
    name: 'characteristicSuggesterFlow',
    inputSchema: CharacteristicSuggestionsInputSchema,
    outputSchema: CharacteristicSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output || { characteristics: [] };
  }
);
