
'use server';

/**
 * @fileOverview Handles a chat conversation about a user's goal.
 *
 * - chatAboutGoal - A function that continues a chat conversation about a goal.
 * - GoalChatInput - The input type for the chatAboutGoal function.
 * - GoalChatOutput - The return type for the chatAboutGoal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const GoalChatInputSchema = z.object({
  goal: z.string().describe("The user's goal that is the topic of the conversation."),
  history: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
  language: z.string().describe('The language for the conversation (e.g., "en", "es", "fr").'),
});
export type GoalChatInput = z.infer<typeof GoalChatInputSchema>;

const GoalChatOutputSchema = z.object({
  response: z.string().describe("The AI model's response to the user."),
});
export type GoalChatOutput = z.infer<typeof GoalChatOutputSchema>;


export async function chatAboutGoal(input: GoalChatInput): Promise<GoalChatOutput> {
  return goalChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'goalChatPrompt',
  input: {schema: GoalChatInputSchema},
  output: {schema: GoalChatOutputSchema},
  prompt: `You are a motivational and strategic AI coach. A user wants to discuss their goal with you.
Your purpose is to help them break down the goal, brainstorm steps, overcome obstacles, and stay motivated.
You MUST respond in the following language: {{{language}}}.

The user's goal is: {{{goal}}}

This is the conversation history so far:
{{#each history}}
  {{#if (eq this.role "user")}}
    User: {{{this.content}}}
  {{else}}
    You: {{{this.content}}}
  {{/if}}
{{/each}}

Continue the conversation. Provide a supportive, encouraging, and strategic response to the last user message. Ask clarifying questions to help them think more deeply. Keep your responses concise and focused.
`,
});


const goalChatFlow = ai.defineFlow(
  {
    name: 'goalChatFlow',
    inputSchema: GoalChatInputSchema,
    outputSchema: GoalChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
