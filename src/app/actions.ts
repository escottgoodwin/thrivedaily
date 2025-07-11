
"use server";

import { getDailyQuote, type DailyQuoteInput, type DailyQuoteOutput } from '@/ai/flows/daily-quote';
import { getWorrySuggestion, type WorrySuggestionInput, type WorrySuggestionOutput } from '@/ai/flows/worry-suggestion-flow';
import { chatAboutWorry, type WorryChatInput, type WorryChatOutput } from '@/ai/flows/worry-chat-flow';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, serverTimestamp, updateDoc, getDocs, addDoc, deleteDoc, query } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Task, Goal, ChatMessage, DecisionMatrixEntry } from './types';


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
    language: string;
}


export async function getDailyQuoteAction(input: GetDailyQuoteActionInput): Promise<DailyQuoteOutput> {
  const filledInput: DailyQuoteInput = {
    worries: input.worries || "nothing in particular",
    gratitude: input.gratitude || "the day ahead",
    goals: (input.goals || []).map(g => g.text).join(', ') || "to have a good day",
    tasks: Array.isArray(input.tasks) ? input.tasks.join(', ') : input.tasks || "to stay present",
    language: input.language || 'en'
  };
  
  try {
    const result = await getDailyQuote(filledInput);
    return result;
  } catch (error) {
    console.error("Error in getDailyQuoteAction:", error);
    return { quote: "Embrace the journey, for every step is a new beginning." };
  }
}

interface WorrySuggestionActionInput {
    worry: string;
    language: string;
}

export async function getWorrySuggestionAction(input: WorrySuggestionActionInput): Promise<WorrySuggestionOutput> {
  try {
    const result = await getWorrySuggestion(input);
    return result;
  } catch (error) {
    console.error("Error in getWorrySuggestionAction:", error);
    return { suggestion: "Take a deep breath. Sometimes acknowledging the worry is the first step. You can handle this." };
  }
}

interface ChatAboutWorryActionInput extends WorryChatInput {
    language: string;
}

export async function chatAboutWorryAction(input: ChatAboutWorryActionInput): Promise<WorryChatOutput> {
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

    const goalsToSave = currentData.goals.map(existingGoal => {
        if (lists.goals.includes(existingGoal.text)) {
            return existingGoal;
        }
        return null;
    }).filter(g => g !== null) as Goal[];

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

export async function getGoal(userId: string, goalId: string): Promise<Goal | null> {
    if (!userId) return null;
    const dailyLists = await getDailyLists(userId);
    return dailyLists.goals.find(g => g.id === goalId) || null;
}

export async function updateGoal(userId: string, updatedGoal: Goal) {
    if (!userId) throw new Error("User not authenticated");
    const today = new Date().toISOString().split('T')[0];
    const docRef = doc(db, 'users', userId, 'dailyData', today);

    try {
        const dailyLists = await getDailyLists(userId);
        const updatedGoals = dailyLists.goals.map(goal => 
            goal.id === updatedGoal.id ? updatedGoal : goal
        );
        
        await updateDoc(docRef, { goals: updatedGoals });
        revalidatePath(`/goals/${updatedGoal.id}`);
        revalidatePath('/goals');
        return { success: true };
    } catch (error) {
        console.error("Error updating goal:", error);
        return { success: false, error: "Failed to update goal." };
    }
}

export async function addGoal(userId: string, goalText: string) {
  if (!userId) throw new Error("User not authenticated");
  const today = new Date().toISOString().split('T')[0];
  const docRef = doc(db, 'users', userId, 'dailyData', today);
  const docSnap = await getDoc(docRef);

  const newGoal: Goal = {
    id: crypto.randomUUID(),
    text: goalText,
    tasks: [],
  };

  try {
     if (docSnap.exists()) {
      await updateDoc(docRef, {
        goals: [...(docSnap.data().goals || []), newGoal]
      });
    } else {
      await setDoc(docRef, { 
          goals: [newGoal], 
          worries: [], 
          gratitude: [], 
          tasks: [], 
          updatedAt: serverTimestamp() 
      });
    }
    revalidatePath('/goals');
    revalidatePath('/');
    return { success: true, goal: newGoal };
  } catch (error) {
    console.error("Error adding goal:", error);
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
        const tasks = goal.tasks || [];
        return { ...goal, tasks: [...tasks, newTask] };
      }
      return goal;
    });

    await updateDoc(docRef, { goals: updatedGoals });
    revalidatePath('/goals');
    revalidatePath(`/goals/${goalId}`);
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
                const tasks = (goal.tasks || []).map(task => task.id === updatedTask.id ? updatedTask : task);
                return { ...goal, tasks };
            }
            return goal;
        });

        await updateDoc(docRef, { goals: updatedGoals });
        revalidatePath('/goals');
        revalidatePath(`/goals/${goalId}`);
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
                const tasks = (goal.tasks || []).filter(task => task.id !== taskId);
                return { ...goal, tasks };
            }
            return goal;
        });

        await updateDoc(docRef, { goals: updatedGoals });
        revalidatePath('/goals');
        revalidatePath(`/goals/${goalId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting task:", error);
        return { success: false, error: "Failed to delete task." };
    }
}


// --- Decision Matrix Actions ---

export async function getDecisionMatrixEntries(userId: string): Promise<DecisionMatrixEntry[]> {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'users', userId, 'decisionMatrix'));
    const querySnapshot = await getDocs(q);
    const entries: DecisionMatrixEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // remove non-serializable data
      const { createdAt, ...serializableData } = data;
      entries.push({ id: doc.id, ...serializableData } as DecisionMatrixEntry);
    });
    return entries;
  } catch (error) {
    console.error("Error getting decision matrix entries:", error);
    return [];
  }
}

export async function addDecisionMatrixEntry(userId: string, entryData: Omit<DecisionMatrixEntry, 'id'>) {
  if (!userId) throw new Error("User not authenticated");
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'decisionMatrix'), {
      ...entryData,
      createdAt: serverTimestamp(),
    });
    revalidatePath('/decision-matrix');
    // Return a serializable entry object without the timestamp
    return { success: true, entry: { id: docRef.id, ...entryData } };
  } catch (error) {
    console.error("Error adding decision matrix entry:", error);
    return { success: false, error: "Failed to add entry." };
  }
}

export async function updateDecisionMatrixEntry(userId: string, entry: DecisionMatrixEntry) {
  if (!userId) throw new Error("User not authenticated");
  try {
    const docRef = doc(db, 'users', userId, 'decisionMatrix', entry.id);
    const { id, ...dataToUpdate } = entry;
    await updateDoc(docRef, dataToUpdate);
    revalidatePath('/decision-matrix');
    return { success: true };
  } catch (error) {
    console.error("Error updating decision matrix entry:", error);
    return { success: false, error: "Failed to update entry." };
  }
}

export async function deleteDecisionMatrixEntry(userId: string, entryId: string) {
  if (!userId) throw new Error("User not authenticated");
  try {
    await deleteDoc(doc(db, 'users', userId, 'decisionMatrix', entryId));
    revalidatePath('/decision-matrix');
    return { success: true };
  } catch (error) {
    console.error("Error deleting decision matrix entry:", error);
    return { success: false, error: "Failed to delete entry." };
  }
}
