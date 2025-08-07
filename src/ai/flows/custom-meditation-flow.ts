
'use server';

/**
 * @fileOverview Generates a custom guided meditation script based on user's concerns.
 *
 * - getCustomMeditation - A function that generates the meditation script.
 * - CustomMeditationInput - The input type for the function.
 * - CustomMeditationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomMeditationInputSchema = z.object({
  concerns: z.array(z.string()).describe("A list of the user's current concerns or worries."),
  duration: z.number().describe('The desired duration of the meditation in seconds.'),
  language: z.string().describe('The language for the meditation script (e.g., "en", "es", "fr").'),
});
export type CustomMeditationInput = z.infer<typeof CustomMeditationInputSchema>;

const MeditationCueSchema = z.object({
  time: z.number().describe('The time in seconds from the start of the meditation when this cue should be spoken.'),
  text: z.string().describe('The text of the meditation cue to be spoken.'),
});

const CustomMeditationOutputSchema = z.object({
  title: z.string().describe('A suitable title for the custom meditation script.'),
  cues: z.array(MeditationCueSchema).describe('An array of timed cues for the guided meditation.'),
});
export type CustomMeditationOutput = z.infer<typeof CustomMeditationOutputSchema>;

export async function getCustomMeditation(input: CustomMeditationInput): Promise<CustomMeditationOutput> {
  return customMeditationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customMeditationPrompt',
  input: {schema: CustomMeditationInputSchema},
  output: {schema: CustomMeditationOutputSchema},
  prompt: `You are an expert meditation guide. Your task is to create a custom guided meditation script for a user based on their specific concerns. The script should be soothing, supportive, and help the user find peace and perspective.

The total duration of the meditation should be {{{duration}}} seconds.

The user's concerns are:
{{#each concerns}}
- {{{this}}}
{{/each}}

Please generate a script with a title and a series of timed cues. The cues should be spaced out appropriately throughout the duration. Start with a brief introduction to settle in, then gently address the concerns (without dwelling on them negatively), and end with a calming conclusion.

For example, you could guide them to acknowledge the concerns, visualize them floating away, and return to the breath as an anchor.

The script MUST be in the following language: {{{language}}}.

Structure the output as a JSON object with a 'title' and a 'cues' array, where each cue has a 'time' (in seconds) and 'text'. Ensure the final cue happens shortly before the total duration ends to allow for a moment of silence.
`,
});

const customMeditationFlow = ai.defineFlow(
  {
    name: 'customMeditationFlow',
    inputSchema: CustomMeditationInputSchema,
    outputSchema: CustomMeditationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
