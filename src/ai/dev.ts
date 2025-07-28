import { config } from 'dotenv';
config();

import '@/ai/flows/daily-quote.ts';
import '@/ai/flows/worry-suggestion-flow.ts';
import '@/ai/flows/worry-chat-flow.ts';
import '@/ai/flows/goal-chat-flow.ts';
import '@/ai/flows/goal-characteristics-suggester.ts';
import '@/ai/flows/task-suggester-flow.ts';
import '@/ai/flows/decision-matrix-suggester-flow.ts';
