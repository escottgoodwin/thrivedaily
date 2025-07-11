import { GoalManager } from '@/components/goals/goal-manager';

export default function GoalsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Goals & Milestones</h1>
      <p className="text-muted-foreground mb-8">
        Break down your long-term ambitions into smaller, manageable tasks. 
        Add goals, then create tasks for each one to track your progress.
      </p>
      <GoalManager />
    </div>
  );
}
