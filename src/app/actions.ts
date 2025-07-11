
"use server";

import { getDailyQuote, type DailyQuoteInput, type DailyQuoteOutput } from '@/ai/flows/daily-quote';
import { getWorrySuggestion, type WorrySuggestionInput, type WorrySuggestionOutput } from '@/ai/flows/worry-suggestion-flow';
import { chatAboutWorry, type WorryChatInput, type WorryChatOutput } from '@/ai/flows/worry-chat-flow';
import { db } from '@/lib/firebase';
import { arrayRemove, arrayUnion, doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Task, Goal, ChatMessage } from './types';


interface DailyLists {
  worries: string[];
  gratitude: string[];
  goals: Goal[];
  tasks: string[];
}

interface GetDailyQuoteActionInput {
    worries: string;
    gratitude: string;
    goals: Goal[];
    tasks: string[];
}


export async function getDailyQuoteAction(input: GetDailyQuoteActionInput): Promise<DailyQuoteOutput> {
  // Add a default if inputs are empty, to avoid empty prompts
  const filledInput: DailyQuoteInput = {
    worries: input.worries || "nothing in particular",
    gratitude: input.gratitude || "the day ahead",
    goals: input.goals.map(g => g.text).join(', ') || "to have a good day",
    tasks: input.tasks.join(', ') || "to stay present",
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

export async function getWorrySuggestionAction(worry: string): Promise<WorrySuggestionOutput> {
  try {
    const result = await getWorrySuggestion({ worry });
    return result;
  } catch (error) {
    console.error("Error in getWorrySuggestionAction:", error);
    return { suggestion: "Take a deep breath. Sometimes acknowledging the worry is the first step. You can handle this." };
  }
}

export async function chatAboutWorryAction(input: WorryChatInput): Promise<WorryChatOutput> {
  try {
    const result = await chatAboutWorry(input);
    return result;
  } catch (error) {
    console.error("Error in chatAboutWorryAction:", error);
    return { response: "I'm sorry, I'm having a little trouble responding right now. Could you try rephrasing?" };
  }
}


export async function saveDailyLists(userId: string, lists: { worries: string[], gratitude: string[], goals: string[], tasks: string[] }) {
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const docRef = doc(db, 'users', userId, 'dailyData', today);
  try {
    const currentData = await getDailyLists(userId);

    // This logic was causing the issue. It needs to handle goals correctly.
    // Let's get the full goal objects instead of just text.
    const goalsToSave = currentData.goals.map(existingGoal => {
        // If the goal from dashboard (string array) still exists, keep it.
        if (lists.goals.includes(existingGoal.text)) {
            return existingGoal;
        }
        return null; // This will be filtered out.
    }).filter(g => g !== null) as Goal[];

    // Add any new goals from the dashboard list
    lists.goals.forEach(goalText => {
        if (!goalsToSave.some(g => g.text === goalText)) {
            goalsToSave.push({ id: crypto.randomUUID(), text: goalText, tasks: [] });
        }
    });


    await setDoc(docRef, {
      worries: lists.worries,
      gratitude: lists.gratitude,
      tasks: lists.tasks,
      goals: goalsToSave,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    revalidatePath('/');
    revalidatePath('/goals');
    return { success: true };
  } catch (error) {
    console.error("Error saving daily lists:", error);
    return { success: false, error: "Failed to save data." };
  }
}

export async function getDailyLists(userId: string): Promise<DailyLists> {
  if (!userId) {
    return { worries: [], gratitude: [], goals: [], tasks: [] };
  }
  const today = new Date().toISOString().split('T')[0];
  const docRef = doc(db, 'users', userId, 'dailyData', today);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Ensure goals is always an array of objects
    const goals = (data.goals || []).map((g: any) => {
      if (typeof g === 'string') {
        return { id: crypto.randomUUID(), text: g, tasks: [] };
      }
      return g;
    });
    // remove non-serializable data
    const { updatedAt, ...serializableData } = data;
    return { ...serializableData, goals } as DailyLists;
  } else {
    return { worries: [], gratitude: [], goals: [], tasks: [] };
  }
}

// --- Goals & Tasks Actions ---

export async function addGoal(userId: string, goalText: string) {
  if (!userId) throw new Error("User not authenticated");
  const today = new Date().toISOString().split('T')[0];
  const docRef = doc(db, 'users', userId, 'dailyData', today);

  const newGoal: Goal = {
    id: crypto.randomUUID(),
    text: goalText,
    tasks: [],
  };

  try {
    await updateDoc(docRef, {
      goals: arrayUnion(newGoal)
    });
    revalidatePath('/goals');
    return { success: true, goal: newGoal };
  } catch (error) {
    console.error("Error adding goal:", error);
    if ((error as any).code === 'not-found') {
        await setDoc(docRef, { goals: [newGoal], worries: [], gratitude: [], tasks: [], updatedAt: serverTimestamp() });
        revalidatePath('/goals');
        return { success: true, goal: newGoal };
    }
    return { success: false, error: "Failed to add goal." };
  }
}

export async function deleteGoal(userId: string, goalId: string) {
  if (!userId) throw new Error("User not authenticated");
  const today = new Date().toISOString().split('T')[0];
  const docRef = doc(db, 'users', userId, 'dailyData', today);

  try {
    const dailyLists = await getDailyLists(userId);
    const updatedGoals = dailyLists.goals.filter(goal => goal.id !== goalId);

    await updateDoc(docRef, {
      goals: updatedGoals
    });
    revalidatePath('/goals');
    return { success: true };
  } catch (error) {
    console.error("Error deleting goal:", error);
    return { success: false, error: "Failed to delete goal." };
  }
}

export async function addTask(userId: string, goalId: string, taskText: string, dueDate?: string) {
  if (!userId) throw new Error("User not authenticated");
  const today = new Date().toISOString().split('T')[0];
  const docRef = doc(db, 'users', userId, 'dailyData', today);
  
  const newTask: Task = {
    id: crypto.randomUUID(),
    text: taskText,
    completed: false,
    ...(dueDate && { dueDate }),
  };

  try {
    const dailyLists = await getDailyLists(userId);
    const updatedGoals = dailyLists.goals.map(goal => {
      if (goal.id === goalId) {
        // Ensure tasks array exists before pushing
        const tasks = goal.tasks || [];
        return { ...goal, tasks: [...tasks, newTask] };
      }
      return goal;
    });

    await updateDoc(docRef, { goals: updatedGoals });
    revalidatePath('/goals');
    return { success: true, task: newTask };
  } catch (error) {
    console.error("Error adding task:", error);
    return { success: false, error: "Failed to add task." };
  }
}

export async function updateTask(userId: string, goalId: string, updatedTask: Task) {
    if (!userId) throw new Error("User not authenticated");
    const today = new Date().toISOString().split('T')[0];
    const docRef = doc(db, 'users', userId, 'dailyData', today);

    try {
        const dailyLists = await getDailyLists(userId);
        const updatedGoals = dailyLists.goals.map(goal => {
            if (goal.id === goalId) {
                const tasks = goal.tasks.map(task => task.id === updatedTask.id ? updatedTask : task);
                return { ...goal, tasks };
            }
            return goal;
        });

        await updateDoc(docRef, { goals: updatedGoals });
        revalidatePath('/goals');
        return { success: true };
    } catch (error) {
        console.error("Error updating task:", error);
        return { success: false, error: "Failed to update task." };
    }
}

export async function deleteTask(userId: string, goalId: string, taskId: string) {
    if (!userId) throw new Error("User not authenticated");
    const today = new Date().toISOString().split('T')[0];
    const docRef = doc(db, 'users', userId, 'dailyData', today);

    try {
        const dailyLists = await getDailyLists(userId);
        const updatedGoals = dailyLists.goals.map(goal => {
            if (goal.id === goalId) {
                const tasks = goal.tasks.filter(task => task.id !== taskId);
                return { ...goal, tasks };
            }
            return goal;
        });

        await updateDoc(docRef, { goals: updatedGoals });
        revalidatePath('/goals');
        return { success: true };
    } catch (error) {
        console.error("Error deleting task:", error);
        return { success: false, error: "Failed to delete task." };
    }
}
