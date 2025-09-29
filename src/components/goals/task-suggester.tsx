
"use client";

import { useState, useEffect } from 'react';
import type { Goal } from '@/app/types';
import { getTaskSuggestionsAction, addMultipleTasks } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '../i18n/language-provider';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '../auth/auth-provider';
import { useSubscription } from '@/hooks/use-subscription';
import { Zap } from 'lucide-react';
import Link from 'next/link';

interface TaskSuggesterProps {
  goal: Goal;
  onTasksAdded: () => void;
}

export function TaskSuggester({ goal, onTasksAdded }: TaskSuggesterProps) {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { isSubscribed } = useSubscription();


  useEffect(() => {
    if (!isSubscribed) {
        setIsLoading(false);
        return;
    }
    const fetchSuggestions = async () => {
      setIsLoading(true);
      const result = await getTaskSuggestionsAction({
        goal: goal.text,
        description: goal.description,
        existingTasks: (goal.tasks || []).map(t => t.text),
        language
      });
      if (result.tasks && result.tasks.length > 0) {
        setSuggestions(result.tasks);
      } else {
        toast({
            title: t('toasts.error'),
            description: t('goalsPage.taskSuggester.fetchError'),
            variant: 'destructive',
        });
      }
      setIsLoading(false);
    };
    fetchSuggestions();
  }, [goal, language, t, toast, isSubscribed]);
  
  const handleToggle = (suggestion: string) => {
    setSelected(prev => ({
        ...prev,
        [suggestion]: !prev[suggestion]
    }));
  }

  const handleAddSelected = async () => {
    if (!user) return;
    const selectedItems = Object.keys(selected).filter(key => selected[key]);
    if (selectedItems.length > 0) {
        setIsAdding(true);
        const { success, error } = await addMultipleTasks(user.uid, goal.id, selectedItems);
        if (success) {
            toast({ title: t('toasts.success'), description: t('toasts.tasksAdded') });
            onTasksAdded();
        } else {
            toast({ title: t('toasts.error'), description: error, variant: 'destructive' });
        }
        setIsAdding(false);
    }
  }

  const renderSkeleton = () => (
    <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-48" />
            </div>
        ))}
    </div>
  );

  if (!isSubscribed) {
    return (
        <div className="text-center space-y-4 py-8">
            <Zap className="mx-auto h-12 w-12 text-primary" />
            <p className="text-muted-foreground">{t('tooltips.upgrade')}</p>
            <Button asChild>
                <Link href="/upgrade">{t('sidebar.upgrade')}</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('goalsPage.taskSuggester.description')}</p>
      <ScrollArea className="h-64 border rounded-md p-4">
        {isLoading ? renderSkeleton() : (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`task-suggestion-${index}`}
                  checked={selected[suggestion] || false}
                  onCheckedChange={() => handleToggle(suggestion)}
                />
                <label
                  htmlFor={`task-suggestion-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {suggestion}
                </label>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <Button onClick={handleAddSelected} className="w-full" disabled={isAdding || isLoading}>
        {isAdding ? t('goalsPage.taskSuggester.addingButton') : t('goalsPage.taskSuggester.addButton')}
      </Button>
    </div>
  );
}
