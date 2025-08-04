
// This file contains shared type definitions used across the application,
// particularly for data structures passed to and from server actions.

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string; // Optional due date as ISO string
}

export interface Goal {
  id:string;
  text: string;
  tasks: Task[];
  description?: string;
  examples?: string[];
  imageUrls?: string[];
  characteristicsGeneral?: string[];
  characteristicsEmotions?: string[];
  characteristicsHabits?: string[];
  characteristicsAbilities?: string[];
  characteristicsStandards?: string[];
  wins?: string[];
  embodiment?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  createdAt?: any; // Can be a server timestamp or Date
}

export interface DecisionMatrixEntry {
  id: string;
  limitingBelief: string;
  falseReward: string;
  newDecision: string;
  evidence: string[];
  dailyAffirmationCount?: number;
  lastAffirmedDate?: string;
}

export interface Concern {
    id: string;
    text: string;
}

export interface RecentWin {
    id: string;
    win: string;
    goalText: string;
    date: string;
}

export interface JournalEntry {
    id: string;
    date: string;
    content: string;
}

export interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface DailyReview {
    summary: string;
    wins: string[];
    goalProgress: string;
    improvements: string;
}
