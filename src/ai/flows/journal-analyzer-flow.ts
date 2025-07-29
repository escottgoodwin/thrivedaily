
'use server';

/**
 * @fileOverview Analyzes a journal entry to extract specific items like worries, gratitude, or goals.
 *
 * - analyzeJournalEntry - Extracts items based on the analysis type.
 * - JournalAnalysisInput - The input type for the function.
 * - JournalAnalysisOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JournalAnalysisInputSchema = z.object({
  content: z.string().describe('The full text content of the journal entry.'),
  analysisType: z.enum(['worries', 'gratitude', 'goals']).describe('The type of items to extract from the journal entry.'),
   language: z.string().describe('The language for the output (e.g., "en", "es", "fr").'),
});
export type JournalAnalysisInput = z.infer<typeof JournalAnalysisInputSchema>;

const JournalAnalysisOutputSchema = z.object({
  items: z.array(z.string()).describe('A list of items (worries, gratitudes, or goals) extracted from the journal entry.'),
});
export type JournalAnalysisOutput = z.infer<typeof JournalAnalysisOutputSchema>;


export async function analyzeJournalEntry(input: JournalAnalysisInput): Promise<JournalAnalysisOutput> {
  return journalAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'journalAnalyzerPrompt',
  input: {schema: JournalAnalysisInputSchema},
  output: {schema: JournalAnalysisOutputSchema},
  prompt: `You are an expert in text analysis and personal development. Your task is to carefully read the following journal entry and extract a list of items based on the specified analysis type.
Each extracted item should be a concise phrase or sentence.
You MUST respond in the following language: {{{language}}}.

**Analysis Type**: Extract all phrases related to '{{{analysisType}}}'.

- If the type is 'worries', look for expressions of anxiety, fear, concern, or stress.
- If the type is 'gratitude', look for expressions of thankfulness, appreciation, or joy for things, people, or events.
- If the type is 'goals', look for expressions of ambition, aspiration, or things the user wants to achieve or work towards.

**Journal Entry**:
---
{{{content}}}
---
`,
});

const journalAnalyzerFlow = ai.defineFlow(
  {
    name: 'journalAnalyzerFlow',
    inputSchema: JournalAnalysisInputSchema,
    outputSchema: JournalAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
