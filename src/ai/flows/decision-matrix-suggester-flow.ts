
'use server';

/**
 * @fileOverview Provides AI-powered suggestions for the Decision Matrix feature.
 *
 * - getBeliefAnalysis - Suggests a "false reward" and a "new decision" based on a limiting belief.
 * - getEvidenceSuggestions - Suggests evidence to support a new empowering decision.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// --- Belief Analysis Flow ---

const BeliefAnalysisInputSchema = z.object({
  limitingBelief: z.string().describe("The user's limiting belief."),
  language: z.string().describe('The language for the suggestions (e.g., "en", "es", "fr").'),
});
export type BeliefAnalysisInput = z.infer<typeof BeliefAnalysisInputSchema>;

const BeliefAnalysisOutputSchema = z.object({
  falseReward: z.string().describe("The perceived benefit or 'false reward' of holding onto the limiting belief."),
  newDecision: z.string().describe("An empowering new decision to replace the limiting belief."),
});
export type BeliefAnalysisOutput = z.infer<typeof BeliefAnalysisOutputSchema>;

export async function getBeliefAnalysis(input: BeliefAnalysisInput): Promise<BeliefAnalysisOutput> {
  return beliefAnalysisFlow(input);
}

const beliefAnalysisPrompt = ai.definePrompt({
  name: 'beliefAnalysisPrompt',
  input: {schema: BeliefAnalysisInputSchema},
  output: {schema: BeliefAnalysisOutputSchema},
  prompt: `You are an expert in cognitive behavioral therapy. A user has provided a limiting belief.
Your task is to analyze it and provide two things:
1.  **False Reward**: The hidden, perceived benefit the user gets from this belief. Why do they hold onto it? What painful thing does it help them avoid (e.g., failure, rejection, discomfort)? This should be concise.
2.  **New Decision**: A positive, empowering, and actionable belief to replace the old one. It should be stated in the first person ("I am...", "I can...").

You MUST respond in the following language: {{{language}}}.

Limiting Belief: "{{{limitingBelief}}}"
`,
});

const beliefAnalysisFlow = ai.defineFlow(
  {
    name: 'beliefAnalysisFlow',
    inputSchema: BeliefAnalysisInputSchema,
    outputSchema: BeliefAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


// --- Evidence Suggester Flow ---

const EvidenceSuggestionInputSchema = z.object({
  newDecision: z.string().describe("The new, empowering decision the user has made."),
  language: z.string().describe('The language for the suggestions (e.g., "en", "es", "fr").'),
});
export type EvidenceSuggestionInput = z.infer<typeof EvidenceSuggestionInputSchema>;

const EvidenceSuggestionOutputSchema = z.object({
    evidence: z.array(z.string()).describe("A list of 3-4 short, concrete pieces of evidence or actions that support the new decision.")
});
export type EvidenceSuggestionOutput = z.infer<typeof EvidenceSuggestionOutputSchema>;


export async function getEvidenceSuggestions(input: EvidenceSuggestionInput): Promise<EvidenceSuggestionOutput> {
  return evidenceSuggesterFlow(input);
}

const evidenceSuggesterPrompt = ai.definePrompt({
    name: 'evidenceSuggesterPrompt',
    input: {schema: EvidenceSuggestionInputSchema},
    output: {schema: EvidenceSuggestionOutputSchema},
    prompt: `You are a motivational coach. A user has created a new, empowering decision.
Your task is to provide a list of 3-4 short, concrete examples or actions that would serve as evidence to prove this new decision is true.
Each piece of evidence should be a specific, observable action or a past success.

You MUST respond in the following language: {{{language}}}.

New Decision: "{{{newDecision}}}"
`
});

const evidenceSuggesterFlow = ai.defineFlow(
    {
        name: 'evidenceSuggesterFlow',
        inputSchema: EvidenceSuggestionInputSchema,
        outputSchema: EvidenceSuggestionOutputSchema,
    },
    async input => {
        const {output} = await prompt(input);
        return output!;
    }
);
