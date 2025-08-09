
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
import { collection, doc, getDoc, setDoc, serverTimestamp, updateDoc, getDocs, addDoc, deleteDoc, query, orderBy, Timestamp, writeBatch, documentId, where } from 'firebase/firestore';
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
  const allGoals = await getGoals(auth.currentUser?.uid || '');
  const filledInput: DailyQuoteInput = {
    concerns: input.concerns.map(w => w.text).join(', ') || "nothing in particular",
    gratitude: input.gratitude || "the day ahead",
    goals: allGoals.map(g => g.text).join(', ') || "to have a good day",
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


// --- Daily Lists stored in dailyData documents ---
export async function getListForToday<T extends 'concerns' | 'gratitude'>(userId: string, listType: T): Promise<T extends 'concerns' ? Concern[] : string[]> {
  if (!userId) return [] as any;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const docRef = doc(db, 'users', userId, 'dailyData', today);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    // For concerns, ensure each item has an ID.
    if (listType === 'concerns') {
      const items = data.concerns || [];
      return items.map((item: any) => 
        typeof item === 'string' ? { id: crypto.randomUUID(), text: item } : item
      ) as any;
    }
    return (data.gratitude || []) as any;
  }
  return [] as any;
}


export async function saveListForToday(userId: string, listType: 'concerns' | 'gratitude', items: Concern[] | string[]) {
  if (!userId) throw new Error("User not authenticated");
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const docRef = doc(db, 'users', userId, 'dailyData', today);
  
  const fieldToUpdate = listType === 'concerns' ? 'concerns' : 'gratitude';
  
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

    await setDoc(docRef, { [fieldToUpdate]: itemsToSave, updatedAt: serverTimestamp() }, { merge: true });

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


// --- Daily Tasks ---

export async function getDailyTasks(userId: string, date?: string): Promise<DailyTask[]> {
  if (!userId) return [];
  const dateString = date || new Date().toISOString().split('T')[0];
  const docRef = doc(db, 'users', userId, 'dailyData', dateString);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return (data.tasks || []).map((t: any) => 
      typeof t === 'string' 
        ? { id: crypto.randomUUID(), text: t, completed: false } 
        : t
    );
  }
  return [];
}


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

export async function updateDailyTask(userId: string, updatedTask: DailyTask) {
  if (!userId) throw new Error("User not authenticated");
  const today = new Date().toISOString().split('T')[0];
  const docRef = doc(db, 'users', userId, 'dailyData', today);

  try {
    const tasks = await getDailyTasks(userId);
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
  const goals = await getGoals(userId);
  const allWins: RecentWin[] = [];

  goals.forEach(goal => {
    if (goal.wins && Array.isArray(goal.wins)) {
        goal.wins.forEach(win => {
            allWins.push({
                id: `${goal.id}-${win.date}-${win.text.substring(0,10)}`,
                win: win.text,
                goalText: goal.text,
                date: win.date
            });
        });
    }
  });

  // Sort by date descending and take the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return allWins
    .filter(win => new Date(win.date) >= sevenDaysAgo)
    .sort((a, b) => b.date.localeCompare(a.date));
}

// --- Goals & Tasks Actions (Permanent) ---

export async function getGoals(userId: string): Promise<Goal[]> {
  if (!userId) return [];
  const goalsCol = collection(db, 'users', userId, 'goals');
  const q = query(goalsCol, orderBy('createdAt', 'asc'));
  const querySnapshot = await getDocs(q);
  
  const goals: Goal[] = [];
  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    const { createdAt, ...rest } = data;
    
    // Fetch tasks subcollection for each goal
    const tasksCol = collection(db, 'users', userId, 'goals', doc.id, 'tasks');
    const tasksQuery = query(tasksCol, orderBy('createdAt', 'asc'));
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasks = tasksSnapshot.docs.map(taskDoc => ({
        id: taskDoc.id,
        ...taskDoc.data()
    })) as Task[];

    goals.push({ id: doc.id, ...rest, tasks } as Goal);
  }
  return goals;
}

export async function getGoal(userId: string, goalId: string): Promise<Goal | null> {
    if (!userId) return null;
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    const goalSnap = await getDoc(goalRef);

    if (!goalSnap.exists()) return null;

    const data = goalSnap.data();
    const { createdAt, ...rest } = data;
    
    // Fetch tasks subcollection
    const tasksCol = collection(db, 'users', userId, 'goals', goalId, 'tasks');
    const tasksQuery = query(tasksCol, orderBy('createdAt', 'asc'));
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasks = tasksSnapshot.docs.map(taskDoc => ({
        id: taskDoc.id,
        ...taskDoc.data()
    })) as Task[];

    return { id: goalSnap.id, ...rest, tasks } as Goal;
}

export async function addGoal(userId: string, goalText: string) {
  if (!userId) throw new Error("User not authenticated");
  
  const newGoalData = {
    text: goalText,
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'goals'), newGoalData);
    revalidatePath('/goals');
    revalidatePath('/');
    return { success: true, goal: { id: docRef.id, text: goalText, tasks: [], createdAt: new Date() } };
  } catch (error) {
    console.error("Error adding goal:", error);
    return { success: false, error: "Failed to add goal." };
  }
}

export async function updateGoal(userId: string, updatedGoal: Goal) {
    if (!userId) throw new Error("User not authenticated");
    const goalRef = doc(db, 'users', userId, 'goals', updatedGoal.id);
    
    try {
        const { id, tasks, ...dataToUpdate } = updatedGoal; // tasks are managed separately
        await updateDoc(goalRef, dataToUpdate);
        revalidatePath(`/goals/${updatedGoal.id}`);
        revalidatePath('/goals');
        revalidatePath('/daily-review');
        return { success: true };
    } catch (error) {
        console.error("Error updating goal:", error);
        return { success: false, error: "Failed to update goal." };
    }
}

export async function deleteGoal(userId: string, goalId: string) {
  if (!userId) throw new Error("User not authenticated");
  try {
    // Note: This doesn't delete subcollections. For a production app,
    // a Cloud Function would be needed to clean up tasks, chats, etc.
    await deleteDoc(doc(db, 'users', userId, 'goals', goalId));
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
  
  const newTaskData: Omit<Task, 'id'> = {
    text: taskText,
    completed: false,
    createdAt: serverTimestamp(),
    ...(dueDate && { dueDate }),
  };

  try {
    const tasksCol = collection(db, 'users', userId, 'goals', goalId, 'tasks');
    const docRef = await addDoc(tasksCol, newTaskData);
    
    revalidatePath('/goals');
    revalidatePath(`/goals/${goalId}`);

    const task: Task = { id: docRef.id, text: taskText, completed: false, ...(dueDate && { dueDate }) };
    return { success: true, task };
  } catch (error) {
    console.error("Error adding task:", error);
    return { success: false, error: "Failed to add task." };
  }
}

export async function addMultipleTasks(userId: string, goalId: string, taskTexts: string[]) {
  if (!userId) throw new Error("User not authenticated");

  try {
    const tasksCol = collection(db, 'users', userId, 'goals', goalId, 'tasks');
    const batch = writeBatch(db);
    const newTasks: Task[] = [];

    for (const text of taskTexts) {
        const docRef = doc(tasksCol); // Create a new doc reference in the subcollection
        batch.set(docRef, {
            text: text,
            completed: false,
            createdAt: serverTimestamp(),
        });
        newTasks.push({ id: docRef.id, text, completed: false });
    }
    
    await batch.commit();

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
    const taskRef = doc(db, 'users', userId, 'goals', goalId, 'tasks', updatedTask.id);

    try {
        const { id, createdAt, ...dataToUpdate } = updatedTask;
        await updateDoc(taskRef, dataToUpdate);

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
    
    try {
        await deleteDoc(doc(db, 'users', userId, 'goals', goalId, 'tasks', taskId));
        
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
    const q = query(collection(db, 'users', userId, 'concernAnalysis'), orderBy('createdAt', 'desc'));
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

export async function addConcernAnalysisEntry(userId: string, entryData: Omit<ConcernAnalysisEntry, 'id' | 'createdAt'>) {
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
    const existingGoals = await getGoals(userId);
    const existingGoalTexts = existingGoals.map(g => g.text);
    const newGoalTexts = items.filter(item => !existingGoalTexts.includes(item));
    
    if (newGoalTexts.length > 0) {
      const batch = writeBatch(db);
      const goalsCol = collection(db, 'users', userId, 'goals');
      for (const text of newGoalTexts) {
        const newGoalRef = doc(goalsCol);
        batch.set(newGoalRef, { text, createdAt: serverTimestamp() });
      }
      await batch.commit();
      revalidatePath('/goals');
      revalidatePath('/');
    }
    return { success: true };
  } else { // concerns or gratitude
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
