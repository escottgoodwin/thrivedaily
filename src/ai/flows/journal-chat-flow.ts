'use server';

/**
 * @fileOverview Handles a chat conversation about a user's journal entry.
 *
 * - chatAboutJournalEntry - A function that continues a chat conversation.
 * - JournalChatInput - The input type for the chatAboutJournalEntry function.
 * - JournalChatOutput - The return type for the chatAboutJournalEntry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const JournalChatInputSchema = z.object({
  journalContent: z.string().describe("The content of the user's journal entry."),
  history: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
  language: z.string().describe('The language for the conversation (e.g., "en", "es", "fr").'),
});
export type JournalChatInput = z.infer<typeof JournalChatInputSchema>;

const JournalChatOutputSchema = z.object({
  response: z.string().describe("The AI model's response to the user."),
});
export type JournalChatOutput = z.infer<typeof JournalChatOutputSchema>;


export async function chatAboutJournalEntry(input: JournalChatInput): Promise<JournalChatOutput> {
  return journalChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'journalChatPrompt',
  input: {schema: JournalChatInputSchema},
  output: {schema: JournalChatOutputSchema},
  prompt: `You are a thoughtful, empathetic, and insightful AI companion. A user wants to discuss a journal entry they have written.
Your purpose is to help them explore the thoughts and feelings in their entry, ask gentle, clarifying questions, and offer new perspectives without being preachy or overly clinical. Help them connect the dots and understand themselves better.
You MUST respond in the following language: {{{language}}}.

The user's journal entry is:
---
{{{journalContent}}}
---

This is the conversation history so far:
{{#each history}}
  {{#if this.isUser}}
    User: {{{this.content}}}
  {{else}}
    You: {{{this.content}}}
  {{/if}}
{{/each}}

Continue the conversation. Provide a supportive, curious, and reflective response to the last user message. Keep your responses concise and focused on helping the user explore their own entry.
`,
});


const journalChatFlow = ai.defineFlow(
  {
    name: 'journalChatFlow',
    inputSchema: JournalChatInputSchema,
    outputSchema: JournalChatOutputSchema,
  },
  async input => {
     const historyWithRoleFlag = input.history.map(m => ({...m, isUser: m.role === 'user'}));
    const {output} = await prompt({...input, history: historyWithRoleFlag});
    return output!;
  }
);
