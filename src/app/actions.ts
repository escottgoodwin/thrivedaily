
"use server";

import { getDailyQuote, type DailyQuoteInput, type DailyQuoteOutput } from '@/ai/flows/daily-quote';
import { getConcernSuggestion, type ConcernSuggestionInput, type ConcernSuggestionOutput } from '@/ai/flows/concern-suggestion-flow';
import { chatAboutConcern, type ConcernChatInput, type ConcernChatOutput } from '@/ai/flows/concern-chat-flow';
import { chatAboutGoal, type GoalChatInput, type GoalChatOutput } from '@/ai/flows/goal-chat-flow';
import { getCharacteristicSuggestions, type CharacteristicSuggestionsInput, type CharacteristicSuggestionsOutput } from '@/ai/flows/goal-characteristics-suggester';
import { getTaskSuggestions, type TaskSuggestionsInput, type TaskSuggestionsOutput } from '@/ai/flows/task-suggester-flow';
import { analyzeJournalEntry, type JournalAnalysisInput, type JournalAnalysisOutput } from '@/ai/flows/journal-analyzer-flow';
import { getCustomMeditation, type CustomMeditationInput, type CustomMeditationOutput } from '@/ai/flows/custom-meditation-flow';
import { chatAboutJournalEntry, type JournalChatInput, type JournalChatOutput } from '@/ai/flows/journal-chat-flow';


import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, serverTimestamp, updateDoc, getDocs, addDoc, deleteDoc, query, orderBy, Timestamp, writeBatch } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Task, Goal, ChatMessage, ConcernAnalysisEntry, Concern, RecentWin, JournalEntry, DailyTask, DailyReview, SavedMeditationScript } from './types';


interface DailyLists {
  concerns: Concern[];
  gratitude: string[];
  tasks: DailyTask[];
}

interface GetDailyQuoteActionInput {
    concerns: Concern[];
    gratitude: string;
    tasks: DailyTask[];
    language: string;
}


export async function getDailyQuoteAction(input: GetDailyQuoteActionInput): Promise<DailyQuoteOutput> {
  const filledInput: DailyQuoteInput = {
    concerns: input.concerns.map(w => w.text).join(', ') || "nothing in particular",
    gratitude: input.gratitude || "the day ahead",
    goals: "to have a good day",
    tasks: (input.tasks || []).map(t => t.text).join(', ') || "to stay present",
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

interface ConcernSuggestionActionInput {
    concern: string;
    language: string;
}

export async function getConcernSuggestionAction(input: ConcernSuggestionActionInput): Promise<ConcernSuggestionOutput> {
  try {
    const result = await getConcernSuggestion(input);
    return result;
  } catch (error) {
    console.error("Error in getConcernSuggestionAction:", error);
    return { suggestion: "Take a deep breath. Sometimes acknowledging the concern is the first step. You can handle this." };
  }
}

interface ChatAboutConcernActionInput extends ConcernChatInput {
    language: string;
}

export async function chatAboutConcernAction(input: ChatAboutConcernActionInput): Promise<ConcernChatOutput> {
  try {
    const result = await chatAboutConcern(input);
    return result;
  } catch (error) {
    console.error("Error in chatAboutConcernAction:", error);
    return { response: "I'm sorry, I'm having a little trouble responding right now. Could you try rephrasing?" };
  }
}

export async function chatAboutGoalAction(input: GoalChatInput): Promise<GoalChatOutput> {
  try {
    const result = await chatAboutGoal(input);
    return result;
  } catch (error) {
    console.error("Error in chatAboutGoalAction:", error);
    return { response: "I'm having a bit of trouble thinking about that goal right now. Maybe we can try a different approach?" };
  }
}

export async function getCharacteristicSuggestionsAction(input: CharacteristicSuggestionsInput): Promise<CharacteristicSuggestionsOutput> {
    try {
        const result = await getCharacteristicSuggestions(input);
        return result;
    } catch (error) {
        console.error("Error getting characteristic suggestions:", error);
        return { characteristics: [] };
    }
}


export async function getTaskSuggestionsAction(input: TaskSuggestionsInput): Promise<TaskSuggestionsOutput> {
    try {
        const result = await getTaskSuggestions(input);
        return result;
    } catch (error) {
        console.error("Error getting task suggestions:", error);
        return { tasks: [] };
    }
}

export async function analyzeJournalEntryAction(input: JournalAnalysisInput): Promise<JournalAnalysisOutput> {
    try {
        const result = await analyzeJournalEntry(input);
        return result;
    } catch (error) {
        console.error("Error analyzing journal entry:", error);
        return { items: [] };
    }
}

export async function getCustomMeditationAction(input: CustomMeditationInput): Promise<CustomMeditationOutput> {
    try {
        const result = await getCustomMeditation(input);
        return result;
    } catch (error) {
        console.error("Error getting custom meditation script:", error);
        return { title: "Error", cues: [{ time: 0, text: "Sorry, I couldn't create a meditation script right now. Please try again later." }] };
    }
}

export async function chatAboutJournalEntryAction(input: JournalChatInput): Promise<JournalChatOutput> {
  try {
    const result = await chatAboutJournalEntry(input);
    return result;
  } catch (error) {
    console.error("Error in chatAboutJournalEntryAction:", error);
    return { response: "I'm sorry, I'm having a little trouble responding right now. Could you try rephrasing?" };
  }
}


// --- New granular list functions ---
export async function getListForToday<T extends 'concerns' | 'gratitude'>(userId: string, listType: T): Promise<T extends 'concerns' ? Concern[] : string[]> {
  if (!userId) return [] as any;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const docRef = doc(db, 'users', userId, listType, today);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    // For concerns, ensure each item has an ID.
    if (listType === 'concerns') {
      const items = data.items || [];
      return items.map((item: any) => 
        typeof item === 'string' ? { id: crypto.randomUUID(), text: item } : item
      ) as any;
    }
    return (data.items || []) as any;
  }
  return [] as any;
}

export async function saveListForToday(userId: string, listType: 'concerns' | 'gratitude', items: Concern[] | string[]) {
  if (!userId) throw new Error("User not authenticated");
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const docRef = doc(db, 'users', userId, listType, today);
  try {
    let itemsToSave;
    if (listType === 'concerns') {
      itemsToSave = (items as (Concern | string)[]).map(item => {
        if (typeof item === 'string') {
          return { id: crypto.randomUUID(), text: item };
        }
        return item.id ? item : { ...item, id: crypto.randomUUID() };
      });
    } else {
      itemsToSave = items;
    }

    await setDoc(docRef, { items: itemsToSave, updatedAt: serverTimestamp() }, { merge: true });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error(`Error saving ${listType} list:`, error);
    return { success: false, error: "Failed to save data." };
  }
}

// --- Chat History ---

export async function getConcernChatHistory(userId: string, concernId: string): Promise<ChatMessage[]> {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'users', userId, 'concernChats', concernId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const { createdAt, ...rest } = data;
      return { 
        ...rest, 
        // Convert Firestore Timestamp to a serializable format (ISO string)
        createdAt: (createdAt as Timestamp)?.toDate().toISOString() 
      } as ChatMessage;
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}

export async function saveConcernChatMessage(userId: string, concernId: string, message: ChatMessage) {
  if (!userId) throw new Error("User not authenticated");
  try {
    await addDoc(collection(db, 'users', userId, 'concernChats', concernId, 'messages'), {
      ...message,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving chat message:", error);
    return { success: false, error: "Failed to save message." };
  }
}

export async function getGoalChatHistory(userId: string, goalId: string): Promise<ChatMessage[]> {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'users', userId, 'goalChats', goalId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const { createdAt, ...rest } = data;
      return { 
        ...rest, 
        createdAt: (createdAt as Timestamp)?.toDate().toISOString() 
      } as ChatMessage;
    });
  } catch (error) {
    console.error("Error fetching goal chat history:", error);
    return [];
  }
}

export async function saveGoalChatMessage(userId: string, goalId: string, message: ChatMessage) {
  if (!userId) throw new Error("User not authenticated");
  try {
    await addDoc(collection(db, 'users', userId, 'goalChats', goalId, 'messages'), {
      ...message,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving goal chat message:", error);
    return { success: false, error: "Failed to save message." };
  }
}

export async function getJournalChatHistory(userId: string, journalDate: string): Promise<ChatMessage[]> {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'users', userId, 'journalChats', journalDate, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const { createdAt, ...rest } = data;
      return { 
        ...rest, 
        createdAt: (createdAt as Timestamp)?.toDate().toISOString() 
      } as ChatMessage;
    });
  } catch (error) {
    console.error("Error fetching journal chat history:", error);
    return [];
  }
}

export async function saveJournalChatMessage(userId: string, journalDate: string, message: ChatMessage) {
  if (!userId) throw new Error("User not authenticated");
  try {
    // Ensure the parent document exists
    const chatDocRef = doc(db, 'users', userId, 'journalChats', journalDate);
    await setDoc(chatDocRef, { lastActivity: serverTimestamp() }, { merge: true });

    // Add the message to the subcollection
    await addDoc(collection(chatDocRef, 'messages'), {
      ...message,
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving journal chat message:", error);
    return { success: false, error: "Failed to save message." };
  }
}


// --- Goals & Tasks stored in dailyData document ---

export async function saveDailyTasks(userId: string, tasks: DailyTask[]) {
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const docRef = doc(db, 'users', userId, 'dailyData', today);
  try {
    await setDoc(docRef, { tasks: tasks, updatedAt: serverTimestamp() }, { merge: true });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error saving daily tasks:", error);
    return { success: false, error: "Failed to save data." };
  }
}


export async function getDailyGoalsAndTasks(userId: string, date?: string): Promise<{ goals: Goal[], tasks: DailyTask[] }> {
  if (!userId) {
    return { goals: [], tasks: [] };
  }
  const dateString = date || new Date().toISOString().split('T')[0];
  const docRef = doc(db, 'users', userId, 'dailyData', dateString);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const goals = (data.goals || []).map((g: any) => {
      if (typeof g === 'string') {
        return { id: crypto.randomUUID(), text: g, tasks: [] };
      }
      return g;
    });
     const tasks = (data.tasks || []).map((t: any) => {
      if (typeof t === 'string') {
        return { id: crypto.randomUUID(), text: t, completed: false };
      }
      return t;
    });
    return { goals, tasks };
  } else {
    return { goals: [], tasks: [] };
  }
}

export async function updateDailyTask(userId: string, updatedTask: DailyTask) {
  if (!userId) throw new Error("User not authenticated");
  const today = new Date().toISOString().split('T')[0];
  const docRef = doc(db, 'users', userId, 'dailyData', today);

  try {
    const { tasks } = await getDailyGoalsAndTasks(userId);
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    
    await updateDoc(docRef, { tasks: updatedTasks });
    revalidatePath(`/`);
    return { success: true };
  } catch (error) {
    console.error("Error updating daily task:", error);
    return { success: false, error: "Failed to update task." };
  }
}

// --- Recent Wins ---
export async function getRecentWins(userId: string): Promise<RecentWin[]> {
  if (!userId) return [];
  const allWins: RecentWin[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    const docRef = doc(db, 'users', userId, 'dailyData', dateString);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.goals && Array.isArray(data.goals)) {
        data.goals.forEach((goal: Goal) => {
          if (goal.wins && Array.isArray(goal.wins)) {
            goal.wins.forEach(winText => {
              allWins.push({
                id: `${goal.id}-${dateString}-${winText.substring(0, 10)}`,
                win: winText,
                goalText: goal.text,
                date: dateString
              });
            });
          }
        });
      }
    }
  }

  // Sort by date descending
  return allWins.sort((a, b) => b.date.localeCompare(a.date));
}

// --- Goals & Tasks Actions ---

export async function getGoal(userId: string, goalId: string): Promise<Goal | null> {
    if (!userId) return null;
    const { goals } = await getDailyGoalsAndTasks(userId);
    return goals.find(g => g.id === goalId) || null;
}

export async function updateGoal(userId: string, updatedGoal: Goal) {
    if (!userId) throw new Error("User not authenticated");
    const today = new Date().toISOString().split('T')[0];
    const docRef = doc(db, 'users', userId, 'dailyData', today);

    try {
        const { goals, tasks } = await getDailyGoalsAndTasks(userId);
        const updatedGoals = goals.map(goal => 
            goal.id === updatedGoal.id ? updatedGoal : goal
        );
        
        await updateDoc(docRef, { goals: updatedGoals });
        revalidatePath(`/goals/${updatedGoal.id}`);
        revalidatePath('/goals');
        revalidatePath('/daily-review');
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
          concerns: [], 
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
    const { goals } = await getDailyGoalsAndTasks(userId);
    const updatedGoals = goals.filter(goal => goal.id !== goalId);

    await updateDoc(docRef, {
      goals: updatedGoals
    });
    revalidatePath('/goals');
    revalidatePath('/');
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
    const { goals } = await getDailyGoalsAndTasks(userId);
    const updatedGoals = goals.map(goal => {
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

export async function addMultipleTasks(userId: string, goalId: string, taskTexts: string[]) {
  if (!userId) throw new Error("User not authenticated");
  const today = new Date().toISOString().split('T')[0];
  const docRef = doc(db, 'users', userId, 'dailyData', today);

  const newTasks: Task[] = taskTexts.map(text => ({
    id: crypto.randomUUID(),
    text: text,
    completed: false,
  }));

  try {
    const { goals } = await getDailyGoalsAndTasks(userId);
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const tasks = goal.tasks || [];
        return { ...goal, tasks: [...tasks, ...newTasks] };
      }
      return goal;
    });

    await updateDoc(docRef, { goals: updatedGoals });
    revalidatePath('/goals');
    revalidatePath(`/goals/${goalId}`);
    return { success: true, tasks: newTasks };
  } catch (error) {
    console.error("Error adding multiple tasks:", error);
    return { success: false, error: "Failed to add tasks." };
  }
}


export async function updateTask(userId: string, goalId: string, updatedTask: Task) {
    if (!userId) throw new Error("User not authenticated");
    const today = new Date().toISOString().split('T')[0];
    const docRef = doc(db, 'users', userId, 'dailyData', today);

    try {
        const { goals } = await getDailyGoalsAndTasks(userId);
        const updatedGoals = goals.map(goal => {
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
        const { goals } = await getDailyGoalsAndTasks(userId);
        const updatedGoals = goals.map(goal => {
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


// --- Concern Analysis Actions ---

export async function getConcernAnalysisEntries(userId: string): Promise<ConcernAnalysisEntry[]> {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'users', userId, 'concernAnalysis'));
    const querySnapshot = await getDocs(q);
    const entries: ConcernAnalysisEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // remove non-serializable data
      const { createdAt, ...serializableData } = data;
      entries.push({ id: doc.id, ...serializableData } as ConcernAnalysisEntry);
    });
    return entries;
  } catch (error) {
    console.error("Error getting concern analysis entries:", error);
    return [];
  }
}

export async function addConcernAnalysisEntry(userId: string, entryData: Omit<ConcernAnalysisEntry, 'id'>) {
  if (!userId) throw new Error("User not authenticated");
  const fullEntryData = {
    ...entryData,
    dailyAffirmationCount: 0,
    lastAffirmedDate: '',
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'concernAnalysis'), fullEntryData);
    revalidatePath('/concern-analysis');
    revalidatePath('/affirmations');
    
    // Return a serializable entry object without the timestamp
    const {createdAt, ...serializableEntry} = fullEntryData;
    return { success: true, entry: { id: docRef.id, ...serializableEntry } };
  } catch (error) {
    console.error("Error adding concern analysis entry:", error);
    return { success: false, error: "Failed to add entry." };
  }
}

export async function updateConcernAnalysisEntry(userId: string, entry: ConcernAnalysisEntry) {
  if (!userId) throw new Error("User not authenticated");
  try {
    const docRef = doc(db, 'users', userId, 'concernAnalysis', entry.id);
    const { id, ...dataToUpdate } = entry;
    await updateDoc(docRef, dataToUpdate);
    revalidatePath('/concern-analysis');
    revalidatePath('/affirmations');
    return { success: true };
  } catch (error) {
    console.error("Error updating concern analysis entry:", error);
    return { success: false, error: "Failed to update entry." };
  }
}

export async function deleteConcernAnalysisEntry(userId: string, entryId: string) {
  if (!userId) throw new Error("User not authenticated");
  try {
    await deleteDoc(doc(db, 'users', userId, 'concernAnalysis', entryId));
    revalidatePath('/concern-analysis');
    revalidatePath('/affirmations');
    return { success: true };
  } catch (error) {
    console.error("Error deleting concern analysis entry:", error);
    return { success: false, error: "Failed to delete entry." };
  }
}

export async function recordAffirmationRepetition(userId: string, entryId: string) {
    if (!userId) throw new Error("User not authenticated");
    const today = new Date().toISOString().split('T')[0];
    const docRef = doc(db, 'users', userId, 'concernAnalysis', entryId);

    try {
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error("Entry not found.");
        }

        const entry = docSnap.data() as ConcernAnalysisEntry;
        
        let newCount;
        if (entry.lastAffirmedDate === today) {
            newCount = (entry.dailyAffirmationCount || 0) + 1;
        } else {
            newCount = 1; // Reset for the new day
        }

        await updateDoc(docRef, {
            dailyAffirmationCount: newCount,
            lastAffirmedDate: today
        });
        
        revalidatePath('/affirmations');
        return { success: true, count: newCount, lastAffirmedDate: today };

    } catch (error) {
        console.error("Error recording affirmation repetition:", error);
        return { success: false, error: "Failed to record affirmation." };
    }
}

// --- Journal Actions ---

export async function getJournalEntry(userId: string, date: string): Promise<JournalEntry | null> {
  if (!userId) return null;
  try {
    const docRef = doc(db, 'users', userId, 'journal', date);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const { createdAt, ...rest } = data;
      return { id: docSnap.id, ...rest } as JournalEntry;
    }
    return null;
  } catch (error) {
    console.error("Error getting journal entry:", error);
    return null;
  }
}

export async function saveJournalEntry(userId: string, entry: { date: string, content: string }) {
  if (!userId) throw new Error("User not authenticated");
  try {
    const docRef = doc(db, 'users', userId, 'journal', entry.date);
    await setDoc(docRef, {
      content: entry.content,
      updatedAt: serverTimestamp()
    }, { merge: true });
    revalidatePath('/journal');
    return { success: true };
  } catch (error) {
    console.error("Error saving journal entry:", error);
    return { success: false, error: "Failed to save entry." };
  }
}

export async function addJournalItemsToLists(
  userId: string, 
  items: string[], 
  type: 'concerns' | 'gratitude' | 'goals'
) {
  if (!userId) throw new Error("User not authenticated");
  
  if (type === 'goals') {
    const { goals } = await getDailyGoalsAndTasks(userId);
    const existingGoalTexts = goals.map(g => g.text);
    const newGoalTexts = items.filter(item => !existingGoalTexts.includes(item));
    
    if (newGoalTexts.length > 0) {
      const batch = writeBatch(db);
      const today = new Date().toISOString().split('T')[0];
      const docRef = doc(db, 'users', userId, 'dailyData', today);
      const newGoals = newGoalTexts.map(text => ({ id: crypto.randomUUID(), text, tasks: [] }));
      batch.update(docRef, { goals: [...goals, ...newGoals] });
      await batch.commit();
      revalidatePath('/');
    }
    return { success: true };
  } else {
    const existingItems = await getListForToday(userId, type);
    const newItems = items.filter(item => {
      if (type === 'concerns') {
        return !(existingItems as Concern[]).some(w => w.text === item);
      }
      return !(existingItems as string[]).includes(item);
    });

    if (newItems.length === 0) return { success: true };

    let itemsToSave: any[];
     if (type === 'concerns') {
      const newConcerns: Concern[] = newItems.map(text => ({ id: crypto.randomUUID(), text }));
      itemsToSave = [...(existingItems as Concern[]), ...newConcerns];
    } else {
      itemsToSave = [...(existingItems as string[]), ...newItems];
    }
    return saveListForToday(userId, type, itemsToSave);
  }
}


// --- Daily Review Actions ---

export async function getDailyReview(userId: string, date: string): Promise<DailyReview | null> {
  if (!userId) return null;
  const docRef = doc(db, 'users', userId, 'dailyData', date);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      summary: data.summary || '',
      wins: data.wins || [],
      goalProgress: data.goalProgress || '',
      improvements: data.improvements || '',
    };
  }
  return null;
}

export async function saveDailyReview(userId: string, date: string, review: DailyReview) {
  if (!userId) throw new Error("User not authenticated");
  const docRef = doc(db, 'users', userId, 'dailyData', date);

  try {
    await setDoc(docRef, {
      ...review,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    revalidatePath('/daily-review');
    return { success: true };
  } catch (error) {
    console.error("Error saving daily review:", error);
    return { success: false, error: "Failed to save review." };
  }
}

// --- Meditation Actions ---

export async function getCustomMeditationScripts(userId: string): Promise<SavedMeditationScript[]> {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'users', userId, 'meditationScripts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const { createdAt, ...rest } = data;
        return {
            id: doc.id,
            ...rest
        } as SavedMeditationScript;
    });
  } catch (error) {
    console.error("Error getting custom meditation scripts:", error);
    return [];
  }
}

export async function saveCustomMeditationScript(userId: string, script: Omit<SavedMeditationScript, 'id'>) {
    if (!userId) throw new Error("User not authenticated");
    const scriptData = {
        ...script,
        createdAt: serverTimestamp()
    };
    try {
        const docRef = await addDoc(collection(db, 'users', userId, 'meditationScripts'), scriptData);
        revalidatePath('/meditation');
        const { createdAt, ...serializableScript } = scriptData;
        return { success: true, script: { id: docRef.id, ...serializableScript } };
    } catch (error) {
        console.error("Error saving custom meditation script:", error);
        return { success: false, error: "Failed to save script." };
    }
}
