"use server";

import { getDailyQuote, type DailyQuoteInput, type DailyQuoteOutput } from '@/ai/flows/daily-quote';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

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

export async function saveDailyLists(userId: string, lists: { worries: string[], gratitude: string[], goals: string[], tasks: string[] }) {
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const docRef = doc(db, 'users', userId, 'dailyData', today);
  try {
    await setDoc(docRef, {
      ...lists,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error saving daily lists:", error);
    return { success: false, error: "Failed to save data." };
  }
}

export async function getDailyLists(userId: string) {
  if (!userId) {
    return { worries: [], gratitude: [], goals: [], tasks: [] };
  }
  const today = new Date().toISOString().split('T')[0];
  const docRef = doc(db, 'users', userId, 'dailyData', today);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as { worries: string[], gratitude: string[], goals: string[], tasks: string[] };
  } else {
    return { worries: [], gratitude: [], goals: [], tasks: [] };
  }
}
