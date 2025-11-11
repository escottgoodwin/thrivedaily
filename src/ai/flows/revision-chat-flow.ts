
'use server';

/**
 * @fileOverview Handles a chat conversation about revising a past event.
 *
 * - chatAboutRevision - A function that continues a chat conversation.
 * - RevisionChatInput - The input type for the function.
 * - RevisionChatOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const RevisionChatInputSchema = z.object({
  situation: z.string().describe("The user's initial description of the event they want to revise."),
  revision: z.string().optional().describe("The user's current revision, if they have started one."),
  history: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
  language: z.string().describe('The language for the conversation (e.g., "en", "es", "fr").'),
});
export type RevisionChatInput = z.infer<typeof RevisionChatInputSchema>;

const RevisionChatOutputSchema = z.object({
  response: z.string().describe("The AI model's response to the user."),
});
export type RevisionChatOutput = z.infer<typeof RevisionChatOutputSchema>;

export async function chatAboutRevision(input: RevisionChatInput): Promise<RevisionChatOutput> {
  return revisionChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'revisionChatPrompt',
  input: {schema: RevisionChatInputSchema},
  output: {schema: RevisionChatOutputSchema},
  prompt: `You are an empathetic and insightful coach specializing in narrative therapy. A user wants to discuss and revise a past event they regret.
Your goal is to help them explore what happened, why it happened, and how they could have acted differently to achieve a better outcome. Help them craft a powerful, positive revision.
You MUST respond in the following language: {{{language}}}.

The initial situation is: {{{situation}}}
{{#if revision}}
The user's current revision is: {{{revision}}}
{{/if}}

This is the conversation history so far:
{{#each history}}
  {{#if (eq this.role "user")}}
    User: {{{this.content}}}
  {{else}}
    You: {{{this.content}}}
  {{/if}}
{{/each}}

Continue the conversation. Provide a supportive, curious, and helpful response to the last user message. Ask clarifying questions to help them think more deeply about their ideal actions and feelings.
`,
});

const revisionChatFlow = ai.defineFlow(
  {
    name: 'revisionChatFlow',
    inputSchema: RevisionChatInputSchema,
    outputSchema: RevisionChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
