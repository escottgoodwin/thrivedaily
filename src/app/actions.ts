"use server";

import { getDailyQuote, type DailyQuoteInput, type DailyQuoteOutput } from '@/ai/flows/daily-quote';

export async function getDailyQuoteAction(input: DailyQuoteInput): Promise<DailyQuoteOutput> {
  // Add a default if inputs are empty, to avoid empty prompts
  const filledInput = {
    worries: input.worries || "nothing in particular",
    gratitude: input.gratitude || "the day ahead",
    goals: input.goals || "to have a good day",
    tasks: input.tasks || "to stay present",
  };
  
  try {
    const result = await getDailyQuote(filledInput);
    return result;
  } catch (error) {
    console.error("Error in getDailyQuoteAction:", error);
    // Return a default quote on error
    return { quote: "Embrace the journey, for every step is a new beginning." };
  }
}
