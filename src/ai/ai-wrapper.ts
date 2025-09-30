"use server";

import {
  GenerateRequest,
  GenerationResponse,
  defineFlow,
  Flow,
  FlowDefinition,
  prompt,
} from 'genkit';
import { ai as originalAI } from './genkit';
import { logAIUsage } from '@/app/actions';
import { isUserSubscribed } from '@/lib/subscription-utils';

type FlowWithAuth<Request, Response> = Flow<Request, Response, { userId: string }>;
type FlowDefinitionWithAuth<Request, Response> = FlowDefinition<Request, Response, { userId: string }>;

interface GenerateWithAuthRequest extends GenerateRequest {
    userId: string;
}

// Function to log AI request details
async function logAIRequest(
    userId: string,
    requestType: string,
    response: GenerationResponse,
    model: string
) {
    if (!response.usage) return;

    const { inputTokens, outputTokens } = response.usage;
    
    const isPremiumUser = await isUserSubscribed(userId);

    await logAIUsage({
        userId,
        requestType,
        model: model,
        inputTokens,
        outputTokens,
        isPremiumUser,
    });
}


function wrappedDefineFlow<Request, Response>(
  name: string,
  schema: FlowDefinitionWithAuth<Request, Response>,
  fn: (input: Request, streamingCallback?: (chunk: Response) => void, auth?: { userId: string }) => Promise<Response>
): FlowWithAuth<Request, Response> {
  const originalFlow = originalAI.defineFlow(name, schema, (input, streamingCallback, auth) => {
    return fn(input, streamingCallback, auth);
  });

  return originalFlow;
}


async function wrappedGenerate(request: GenerateWithAuthRequest): Promise<GenerationResponse> {
    const { userId, ...originalRequest } = request;
    const response = await originalAI.generate(originalRequest);
    
    // Asynchronously log the request without blocking the response
    if(userId && originalRequest.model) {
        logAIRequest(userId, `generate:${originalRequest.model}`, response, originalRequest.model.name).catch(console.error);
    }
    
    return response;
}

export const ai = {
  ...originalAI,
  defineFlow: wrappedDefineFlow,
  generate: wrappedGenerate,
};
