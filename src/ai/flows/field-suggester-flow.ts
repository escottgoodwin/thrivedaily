
'use server';

/**
 * @fileOverview Generates contextual suggestions for a specific input field.
 *
 * - getFieldSuggestion - Generates a list of suggestions for a given field.
 * - FieldSuggestionInput - Input for the suggester.
 * - FieldSuggestionOutput - Output for the suggester.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FieldSuggestionInputSchema = z.object({
  fieldName: z.string().describe('The name of the field for which to generate suggestions (e.g., "False Reward", "New Decision", "Evidence").'),
  context: z.record(z.string()).describe('A key-value map of related fields and their current values to provide context for the suggestion.'),
  language: z.string().describe('The language for the suggestions (e.g., "en", "es", "fr").'),
});
export type FieldSuggestionInput = z.infer<typeof FieldSuggestionInputSchema>;

const FieldSuggestionOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of 3-4 concise suggestions for the specified field.'),
});
export type FieldSuggestionOutput = z.infer<typeof FieldSuggestionOutputSchema>;

export async function getFieldSuggestion(input: FieldSuggestionInput): Promise<FieldSuggestionOutput> {
  return fieldSuggesterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fieldSuggesterPrompt',
  input: {schema: FieldSuggestionInputSchema},
  output: {schema: FieldSuggestionOutputSchema},
  prompt: `You are an expert cognitive behavioral therapy coach.
Your task is to provide a list of 3-4 helpful and insightful suggestions for a specific field based on the context provided by the user.
The suggestions should be concise, thought-provoking, and directly relevant to the target field.
You MUST respond in the following language: {{{language}}}.

**Target Field to Suggest For**: {{{fieldName}}}

**Provided Context**:
{{#each context}}
- {{this.key}}: "{{this.value}}"
{{/each}}

Based on the context, provide suggestions for the target field.
`,
});

const fieldSuggesterFlow = ai.defineFlow(
  {
    name: 'fieldSuggesterFlow',
    inputSchema: FieldSuggestionInputSchema,
    outputSchema: FieldSuggestionOutputSchema,
  },
  async (input) => {
    // Convert context object to an array of key-value pairs for Handlebars
    const contextArray = Object.entries(input.context).map(([key, value]) => ({ key, value }));
    const {output} = await prompt({...input, context: contextArray as any});
    return output!;
  }
);
