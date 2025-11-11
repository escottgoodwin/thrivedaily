
// This file contains shared type definitions used across the application,
// particularly for data structures passed to and from server actions.
import type { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string; // Optional due date as ISO string
  createdAt?: Timestamp | Date;
}

export interface GoalWin {
    date: string;
    text: string;
}

export interface GoalComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: any;
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
  wins?: GoalWin[];
  embodiment?: string;
  createdAt?: Timestamp | Date;
  comments?: GoalComment[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  createdAt?: any; // Can be a server timestamp or Date
}

export interface ConcernAnalysisEntry {
  id: string;
  limitingBelief: string;
  falseReward: string;
  newDecision: string;
  evidence: string[];
  isAffirmation?: boolean;
  dailyAffirmationCount?: number;
  lastAffirmedDate?: string;
  createdAt?: Timestamp | Date;
}

export interface Concern {
    id: string;
    text: string;
    falseReward?: string;
    newDecision?: string;
    evidence?: string[];
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
    updatedAt?: any;
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

export interface MeditationCue {
  time: number;
  text: string;
}

export interface SavedMeditationScript {
  id: string;
  title: string;
  duration: number;
  cues: MeditationCue[];
  isCustom: true;
}

export type UsageType = 'concernChat' | 'journalAnalysis' | 'customMeditation' | 'customQuote';

export interface Usage {
  concernChat: {
    count: number;
    lastUsed: string; // YYYY-MM-DD
  };
  journalAnalysis: {
    count: number;
    lastUsedWeek: string; // YYYY-WW
  };
  customMeditation: {
    count: number;
    lastUsedWeek: string; // YYYY-WW
  };
  customQuote: {
    count: number;
    lastUsedWeek: string; // YYYY-WW
  };
}


export interface AccountabilityPartner {
    id: string; // Firestore document ID
    userId: string; // The UID of the partner
    email: string;
    status: 'pending' | 'accepted' | 'declined';
    direction: 'sent' | 'received';
}

export interface RevisionEntry {
  id: string;
  situation: string;
  revision: string;
  amends?: string[];
  createdAt: any;
}
