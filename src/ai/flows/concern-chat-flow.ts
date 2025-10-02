'use server';

/**
 * @fileOverview Handles a chat conversation about a user's concern.
 *
 * - chatAboutConcern - A function that continues a chat conversation.
 * - ConcernChatInput - The input type for the chatAboutConcern function.
 * - ConcernChatOutput - The return type for the chatAboutConcern function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define a schema for a single chat message
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ConcernChatInputSchema = z.object({
  concern: z.string().describe("The user's initial concern that started the conversation."),
  history: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
  language: z.string().describe('The language for the conversation (e.g., "en", "es", "fr").'),
});
export type ConcernChatInput = z.infer<typeof ConcernChatInputSchema>;

const ConcernChatOutputSchema = z.object({
  response: z.string().describe("The AI model's response to the user."),
});
export type ConcernChatOutput = z.infer<typeof ConcernChatOutputSchema>;

export async function chatAboutConcern(input: ConcernChatInput): Promise<ConcernChatOutput> {
  return concernChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'concernChatPrompt',
  input: {schema: ConcernChatInputSchema},
  output: {schema: ConcernChatOutputSchema},
  prompt: `You are a caring and supportive AI assistant. A user is sharing one of their concerns with you.
Your goal is to help them explore their feelings and find constructive ways to cope.
You MUST respond in the following language: {{{language}}}.

The initial concern is: {{{concern}}}

This is the conversation history so far:
{{#each history}}
  {{#if (eq this.role "user")}}
    User: {{{this.content}}}
  {{else}}
    You: {{{this.content}}}
  {{/if}}
{{/each}}

Continue the conversation. Provide a supportive, empathetic, and helpful response to the last user message. Keep your responses concise and focused.
`,
});


const concernChatFlow = ai.defineFlow(
  {
    name: 'concernChatFlow',
    inputSchema: ConcernChatInputSchema,
    outputSchema: ConcernChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
