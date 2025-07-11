'use server';

/**
 * @fileOverview Handles a chat conversation about a user's worry.
 *
 * - chatAboutWorry - A function that continues a chat conversation.
 * - WorryChatInput - The input type for the chatAboutWorry function.
 * - WorryChatOutput - The return type for the chatAboutWorry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define a schema for a single chat message
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const WorryChatInputSchema = z.object({
  worry: z.string().describe("The user's initial worry that started the conversation."),
  history: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
});
export type WorryChatInput = z.infer<typeof WorryChatInputSchema>;

const WorryChatOutputSchema = z.object({
  response: z.string().describe("The AI model's response to the user."),
});
export type WorryChatOutput = z.infer<typeof WorryChatOutputSchema>;

export async function chatAboutWorry(input: WorryChatInput): Promise<WorryChatOutput> {
  return worryChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'worryChatPrompt',
  input: {schema: WorryChatInputSchema},
  output: {schema: WorryChatOutputSchema},
  prompt: `You are a caring and supportive AI assistant. A user is sharing one of their worries with you.
Your goal is to help them explore their feelings and find constructive ways to cope.

The initial worry is: {{{worry}}}

This is the conversation history so far:
{{#each history}}
  {{#if (eq role 'user')}}
    User: {{{content}}}
  {{else}}
    You: {{{content}}}
  {{/if}}
{{/each}}

Continue the conversation. Provide a supportive, empathetic, and helpful response to the last user message. Keep your responses concise and focused.
`,
});

const worryChatFlow = ai.defineFlow(
  {
    name: 'worryChatFlow',
    inputSchema: WorryChatInputSchema,
    outputSchema: WorryChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);