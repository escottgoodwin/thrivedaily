
'use server';

/**
 * @fileOverview Provides a single, consolidated AI flow to generate suggestions for the Decision Matrix.
 *
 * - getDecisionMatrixSuggestions - Suggests a "false reward," a "new decision," and supporting "evidence" based on a single limiting belief.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// --- Consolidated Suggestions Flow ---

const SuggestionsInputSchema = z.object({
  limitingBelief: z.string().describe("The user's limiting belief."),
  language: z.string().describe('The language for the suggestions (e.g., "en", "es", "fr").'),
});
export type SuggestionsInput = z.infer<typeof SuggestionsInputSchema>;

const SuggestionsOutputSchema = z.object({
  falseReward: z.string().describe("The perceived benefit or 'false reward' of holding onto the limiting belief."),
  newDecision: z.string().describe("An empowering new decision to replace the limiting belief."),
  evidence: z.array(z.string()).describe("A list of 3-4 short, concrete pieces of evidence or actions that support the new decision.")
});
export type SuggestionsOutput = z.infer<typeof SuggestionsOutputSchema>;

export async function getDecisionMatrixSuggestions(input: SuggestionsInput): Promise<SuggestionsOutput> {
  return decisionMatrixSuggesterFlow(input);
}


const beliefAnalysisPrompt = ai.definePrompt({
  name: 'beliefAnalysisPrompt',
  input: {schema: z.object({ limitingBelief: z.string(), language: z.string() })},
  output: {schema: z.object({ falseReward: z.string(), newDecision: z.string() }) },
  prompt: `You are an expert in cognitive behavioral therapy. A user has provided a limiting belief.
Your task is to analyze it and provide two things:
1.  **False Reward**: The hidden, psychological benefit the user gets from this belief. It's not a real reward, but a way to avoid something painful or difficult. For example, if the limiting belief is "making money is hard," the false reward might be "I don't have to take responsibility for my financial situation" because it protects them from the fear of failure. Focus on what difficult feeling or responsibility the belief helps them avoid.
2.  **New Decision**: A positive, empowering, and actionable belief to replace the old one. It should be stated in the first person ("I am...", "I can...").

You MUST respond in the following language: {{{language}}}.

Limiting Belief: "{{{limitingBelief}}}"
`,
});


const evidenceSuggesterPrompt = ai.definePrompt({
    name: 'evidenceSuggesterPrompt',
    input: {schema: z.object({ newDecision: z.string(), language: z.string() })},
    output: {schema: z.object({ evidence: z.array(z.string()) })},
    prompt: `You are a motivational coach. A user has created a new, empowering decision.
Your task is to provide a list of 3-4 short, concrete examples or actions that would serve as evidence to prove this new decision is true.
Each piece of evidence should be a specific, observable action or a past success.

You MUST respond in the following language: {{{language}}}.

New Decision: "{{{newDecision}}}"
`
});


const decisionMatrixSuggesterFlow = ai.defineFlow(
  {
    name: 'decisionMatrixSuggesterFlow',
    inputSchema: SuggestionsInputSchema,
    outputSchema: SuggestionsOutputSchema,
  },
  async (input) => {
    const beliefAnalysis = await beliefAnalysisPrompt(input);
    
    if (!beliefAnalysis.output) {
      throw new Error("Failed to get belief analysis.");
    }
    
    const evidence = await evidenceSuggesterPrompt({
        newDecision: beliefAnalysis.output.newDecision,
        language: input.language,
    });

    if (!evidence.output) {
        throw new Error("Failed to get evidence suggestions.");
    }

    return {
      falseReward: beliefAnalysis.output.falseReward,
      newDecision: beliefAnalysis.output.newDecision,
      evidence: evidence.output.evidence,
    };
  }
);
