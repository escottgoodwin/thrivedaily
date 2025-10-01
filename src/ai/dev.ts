import { config } from 'dotenv';
config();

import '@/ai/flows/daily-quote.ts';
import '@/ai/flows/concern-suggestion-flow.ts';
import '@/ai/flows/concern-chat-flow.ts';
import '@/ai/flows/goal-chat-flow.ts';
import '@/ai/flows/goal-characteristics-suggester.ts';
import '@/ai/flows/task-suggester-flow.ts';
import '@/ai/flows/journal-analyzer-flow.ts';
import '@/ai/flows/custom-meditation-flow.ts';
import '@/ai/flows/journal-chat-flow.ts';
import '@/ai/flows/field-suggester-flow.ts';
    
