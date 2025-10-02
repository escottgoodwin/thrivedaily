
'use server';

/**
 * @fileOverview Generates suggestions for actionable tasks to achieve a goal.
 *
 * - getTaskSuggestions - A function that generates task suggestions.
 * - TaskSuggestionsInput - The input type for the function.
 * - TaskSuggestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSuggestionsInputSchema = z.object({
  goal: z.string().describe("The user's goal."),
  description: z.string().optional().describe("A more detailed description of the goal."),
  existingTasks: z.array(z.string()).optional().describe("A list of tasks the user has already defined."),
  language: z.string().describe('The language for the suggestions (e.g., "en", "es", "fr").'),
});
export type TaskSuggestionsInput = z.infer<typeof TaskSuggestionsInputSchema>;

const TaskSuggestionsOutputSchema = z.object({
  tasks: z.array(z.string()).describe('A list of 5-7 concise, actionable tasks.'),
});
export type TaskSuggestionsOutput = z.infer<typeof TaskSuggestionsOutputSchema>;

export async function getTaskSuggestions(input: TaskSuggestionsInput): Promise<TaskSuggestionsOutput> {
  return taskSuggesterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'taskSuggesterPrompt',
  input: {schema: TaskSuggestionsInputSchema},
  output: {schema: TaskSuggestionsOutputSchema},
  prompt: `You are an expert productivity coach and project manager.
Your task is to break down a user's goal into small, actionable tasks.
Based on the goal and its description, provide a list of 5-7 clear and concise tasks.
Each task should be a concrete action the user can take.
You MUST respond in the following language: {{{language}}}.

Goal: {{{goal}}}
Description: {{{description}}}

{{#if existingTasks}}
The user has already created the following tasks. Do not suggest similar ones:
{{#each existingTasks}}
- {{{this}}}
{{/each}}
{{/if}}

What are the next actionable steps to achieve this goal?`,
});

const taskSuggesterFlow = ai.defineFlow(
  {
    name: 'taskSuggesterFlow',
    inputSchema: TaskSuggestionsInputSchema,
    outputSchema: TaskSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output || { tasks: [] };
  }
);
