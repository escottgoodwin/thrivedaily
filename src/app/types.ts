
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
  characteristics?: string[];
  wins?: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  createdAt?: any; // Can be a server timestamp or Date
}

export interface DecisionMatrixEntry {
  id: string;
  limitingBelief: string;
  newDecision: string;
  evidence: string[];
}

export interface Worry {
    id: string;
    text: string;
}
