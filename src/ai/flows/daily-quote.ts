'use server';

/**
 * @fileOverview Generates a daily inspirational quote, tailored to the user's entries in their daily lists.
 *
 * - getDailyQuote - A function that generates the daily quote.
 * - DailyQuoteInput - The input type for the getDailyQuote function.
 * - DailyQuoteOutput - The return type for the getDailyQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyQuoteInputSchema = z.object({
  worries: z.string().describe('The user\u0027s list of daily worries.'),
  gratitude: z.string().describe('The user\u0027s list of things they are grateful for.'),
  goals: z.string().describe('The user\u0027s list of goals.'),
  tasks: z.string().describe('The user\u0027s list of tasks for the day.'),
  language: z.string().describe('The language for the quote (e.g., "en", "es", "fr").'),
});
export type DailyQuoteInput = z.infer<typeof DailyQuoteInputSchema>;

const DailyQuoteOutputSchema = z.object({
  quote: z.string().describe('An inspirational quote relevant to the user\u0027s entries.'),
});
export type DailyQuoteOutput = z.infer<typeof DailyQuoteOutputSchema>;

export async function getDailyQuote(input: DailyQuoteInput): Promise<DailyQuoteOutput> {
  return dailyQuoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dailyQuotePrompt',
  input: {schema: DailyQuoteInputSchema},
  output: {schema: DailyQuoteOutputSchema},
  prompt: `You are an AI that provides daily inspirational quotes to users.

  The quote should be relevant to the user's current state of mind, as reflected in their daily worries, gratitude, goals, and tasks.
  The quote MUST be in the following language: {{{language}}}.

  Here is the user's information:
  Worries: {{{worries}}}
  Gratitude: {{{gratitude}}}
  Goals: {{{goals}}}
  Tasks: {{{tasks}}}

  Please provide a single inspirational quote that is most relevant to the user's current situation.
  The quote should be motivational and supportive, and should help the user to focus on the positive aspects of their life and to achieve their goals.`,
});

const dailyQuoteFlow = ai.defineFlow(
  {
    name: 'dailyQuoteFlow',
    inputSchema: DailyQuoteInputSchema,
    outputSchema: DailyQuoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
