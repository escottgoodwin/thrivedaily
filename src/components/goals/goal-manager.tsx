
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/auth-provider';
import { getDailyLists, addGoal, type Goal } from '@/app/actions';
import { GoalCard } from './goal-card';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

export function GoalManager() {
  const { user, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [newGoalText, setNewGoalText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const loadGoals = useCallback(async () => {
    if (user) {
      setDataLoading(true);
      const data = await getDailyLists(user.uid);
      setGoals(data.goals || []);
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadGoals();
    }
  }, [authLoading, loadGoals]);
  
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newGoalText.trim()) return;
    
    setIsAdding(true);
    const { success, error } = await addGoal(user.uid, newGoalText.trim());
    
    if (success) {
      setNewGoalText('');
      toast({ title: "Success", description: "New goal added." });
    } else {
      toast({ title: "Error", description: error, variant: "destructive" });
    }
    setIsAdding(false);
  };

  if (authLoading || dataLoading) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
        </div>
    )
  }

  return (
    <div className="space-y-8">
       <form onSubmit={handleAddGoal} className="flex gap-2 max-w-lg">
          <Input
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            placeholder="Enter a new goal..."
            disabled={isAdding}
          />
          <Button type="submit" disabled={isAdding || !newGoalText.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            {isAdding ? "Adding..." : "Add Goal"}
          </Button>
        </form>

      {goals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No goals yet!</h3>
            <p className="text-muted-foreground mt-2">Add your first goal above to get started.</p>
        </div>
      )}
    </div>
  );
}
