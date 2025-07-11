
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
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
