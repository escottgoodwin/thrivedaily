
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/auth-provider';
import { getDailyLists, addGoal } from '@/app/actions';
import type { Goal } from '@/app/types';
import { GoalCard } from './goal-card';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { useLanguage } from '../i18n/language-provider';

export function GoalManager() {
  const { user, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [newGoalText, setNewGoalText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

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
    const { success, error, goal } = await addGoal(user.uid, newGoalText.trim());
    
    if (success && goal) {
      setGoals(prevGoals => [...prevGoals, goal]);
      setNewGoalText('');
      toast({ title: t('toasts.success'), description: t('toasts.goalAdded') });
    } else {
      toast({ title: t('toasts.error'), description: error, variant: "destructive" });
    }
    setIsAdding(false);
  };

  const handleGoalDeleted = (goalId: string) => {
    setGoals(prevGoals => prevGoals.filter(g => g.id !== goalId));
  }

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
            placeholder={t('goalsPage.addGoalPlaceholder')}
            disabled={isAdding}
          />
          <Button type="submit" disabled={isAdding || !newGoalText.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            {isAdding ? t('goalsPage.addingGoal') : t('goalsPage.addGoalButton')}
          </Button>
        </form>

      {goals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} onGoalDeleted={handleGoalDeleted} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">{t('goalsPage.noGoalsTitle')}</h3>
            <p className="text-muted-foreground mt-2">{t('goalsPage.noGoalsDescription')}</p>
        </div>
      )}
    </div>
  );
}
