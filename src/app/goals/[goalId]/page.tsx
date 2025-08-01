
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { getGoal, updateGoal, updateTask, deleteTask } from '@/app/actions';
import type { Goal, Task } from '@/app/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ImageIcon, Plus, Trash2, ListTodo, Calendar as CalendarIcon, Sparkles, UserCheck, Trophy } from 'lucide-react';
import { useLanguage } from '@/components/i18n/language-provider';
import Link from 'next/link';
import Image from 'next/image';
import { AddTaskForm } from '@/components/goals/add-task-form';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { GoalChat } from '@/components/goals/goal-chat';
import { CharacteristicSuggester } from '@/components/goals/characteristic-suggester';
import { TaskSuggester } from '@/components/goals/task-suggester';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function GoalDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newExample, setNewExample] = useState('');
  const [newCharacteristic, setNewCharacteristic] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newWin, setNewWin] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCharSuggesterOpen, setIsCharSuggesterOpen] = useState(false);
  const [isTaskSuggesterOpen, setIsTaskSuggesterOpen] = useState(false);

  const goalId = Array.isArray(params.goalId) ? params.goalId[0] : params.goalId;

  const loadGoal = useCallback(async () => {
    if (user && goalId) {
      setLoading(true);
      const fetchedGoal = await getGoal(user.uid, goalId);
      if (fetchedGoal) {
        setGoal(fetchedGoal);
      } else {
        toast({ title: t('toasts.error'), description: t('goalsPage.goalDetail.goalNotFound'), variant: 'destructive' });
      }
      setLoading(false);
    }
  }, [user, goalId, t, toast]);

  useEffect(() => {
    if (!authLoading) {
      loadGoal();
    }
  }, [authLoading, loadGoal]);

  const handleSave = async () => {
    if (!user || !goal) return;
    setIsSaving(true);
    const { success, error } = await updateGoal(user.uid, goal);
    if (success) {
      toast({ title: t('toasts.success'), description: t('goalsPage.goalDetail.saveSuccess') });
    } else {
      toast({ title: t('toasts.error'), description: error, variant: 'destructive' });
    }
    setIsSaving(false);
  };
  
  const handleAddExample = () => {
    if (newExample.trim() && goal) {
      setGoal({
        ...goal,
        examples: [...(goal.examples || []), newExample.trim()],
      });
      setNewExample('');
    }
  };

  const handleRemoveExample = (index: number) => {
    if (goal) {
      const updatedExamples = [...(goal.examples || [])];
      updatedExamples.splice(index, 1);
      setGoal({ ...goal, examples: updatedExamples });
    }
  };
  
  const handleCharacteristicChange = (index: number, value: string) => {
    if (goal) {
        const updatedCharacteristics = [...(goal.characteristics || [])];
        updatedCharacteristics[index] = value;
        setGoal({ ...goal, characteristics: updatedCharacteristics });
    }
  };

  const handleAddCharacteristic = () => {
    if (newCharacteristic.trim() && goal) {
      setGoal({
        ...goal,
        characteristics: [...(goal.characteristics || []), newCharacteristic.trim()],
      });
      setNewCharacteristic('');
    }
  };

  const handleRemoveCharacteristic = (index: number) => {
    if (goal) {
      const updatedCharacteristics = [...(goal.characteristics || [])];
      updatedCharacteristics.splice(index, 1);
      setGoal({ ...goal, characteristics: updatedCharacteristics });
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim() && goal) {
      try {
        new URL(newImageUrl.trim());
        setGoal({
            ...goal,
            imageUrls: [...(goal.imageUrls || []), newImageUrl.trim()],
        });
        setNewImageUrl('');
      } catch (_) {
          toast({ title: t('toasts.error'), description: t('goalsPage.goalDetail.invalidUrl'), variant: 'destructive' });
      }
    }
  };

  const handleRemoveImageUrl = (index: number) => {
    if (goal) {
      const updatedImageUrls = [...(goal.imageUrls || [])];
      updatedImageUrls.splice(index, 1);
      setGoal({ ...goal, imageUrls: updatedImageUrls });
    }
  };

  const handleAddWin = () => {
    if (newWin.trim() && goal) {
      setGoal({
        ...goal,
        wins: [...(goal.wins || []), newWin.trim()],
      });
      setNewWin('');
    }
  };

  const handleRemoveWin = (index: number) => {
    if (goal) {
      const updatedWins = [...(goal.wins || [])];
      updatedWins.splice(index, 1);
      setGoal({ ...goal, wins: updatedWins });
    }
  };

  const handleTaskAdded = () => {
      setShowAddTask(false);
      loadGoal();
  };

  const handleTaskToggle = async (task: Task) => {
    if (!user || !goal) return;
    const updatedTask = { ...task, completed: !task.completed };

    // Optimistic update
    setGoal(prevGoal => {
        if (!prevGoal) return null;
        return {
          ...prevGoal,
          tasks: prevGoal.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
        }
    });

    await updateTask(user.uid, goal.id, updatedTask);
    // No need to call loadGoal() if optimistic update is sufficient
  };

  const handleTaskTextChange = async (taskId: string, newText: string) => {
    if (!user || !goal) return;
    const taskToUpdate = goal.tasks.find(t => t.id === taskId);
    if (taskToUpdate) {
      const updatedTask = { ...taskToUpdate, text: newText };
      // Optimistic update
      setGoal(prevGoal => {
        if (!prevGoal) return null;
        return {
          ...prevGoal,
          tasks: prevGoal.tasks.map(t => t.id === taskId ? updatedTask : t)
        }
      });
      await updateTask(user.uid, goal.id, updatedTask);
    }
  };
  
  const handleTaskDelete = async (taskId: string) => {
    if (!user || !goal) return;
    const { success, error } = await deleteTask(user.uid, goal.id, taskId);
     if (error) {
      toast({ title: t('toasts.error'), description: error, variant: "destructive" });
    } else {
      loadGoal();
    }
  }

  const handleAddSuggestedCharacteristics = (suggestions: string[]) => {
      if (goal) {
          const newCharacteristics = Array.from(new Set([...(goal.characteristics || []), ...suggestions]));
          setGoal({ ...goal, characteristics: newCharacteristics });
      }
      setIsCharSuggesterOpen(false);
  }

  const handleTasksSuggested = () => {
    setIsTaskSuggesterOpen(false);
    loadGoal();
  }

  if (loading || authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
         <Card>
          <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('goalsPage.goalDetail.goalNotFound')}</h1>
        <Button asChild variant="link" className="mt-4">
          <Link href="/goals">{t('goalsPage.goalDetail.backLink')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="space-y-6">
       <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogContent className="sm:max-w-[525px] h-[70vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{t('goalsPage.chat.title').replace('{goal}', goal.text)}</DialogTitle>
            </DialogHeader>
            <GoalChat goal={goal} />
          </DialogContent>
        </Dialog>

        <Dialog open={isCharSuggesterOpen} onOpenChange={setIsCharSuggesterOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('goalsPage.characteristicsSuggester.title')}</DialogTitle>
            </DialogHeader>
            <CharacteristicSuggester goal={goal} onAdd={handleAddSuggestedCharacteristics} />
          </DialogContent>
        </Dialog>

        <Dialog open={isTaskSuggesterOpen} onOpenChange={setIsTaskSuggesterOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('goalsPage.taskSuggester.title')}</DialogTitle>
            </DialogHeader>
            <TaskSuggester goal={goal} onTasksAdded={handleTasksSuggested} />
          </DialogContent>
        </Dialog>
      
      <div className="flex justify-between items-start">
        <div>
          <Button variant="ghost" asChild className="-ml-4">
              <Link href="/goals">
                <ArrowLeft className="mr-2" />
                {t('goalsPage.goalDetail.backLink')}
              </Link>
          </Button>
          <h1 className="text-4xl font-bold mt-2">{goal.text}</h1>
        </div>
        <Button variant="outline" onClick={() => setIsChatOpen(true)}>
          <Sparkles className="mr-2"/>
          {t('goalsPage.chat.button')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('goalsPage.goalDetail.descriptionLabel')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={goal.description || ''}
                onChange={(e) => setGoal({ ...goal, description: e.target.value })}
                placeholder={t('goalsPage.goalDetail.descriptionPlaceholder')}
                rows={5}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><ListTodo /> {t('goalsPage.tasksTitle')}</CardTitle>
              </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setIsTaskSuggesterOpen(true)}>
                            <Sparkles className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('goalsPage.taskSuggester.tooltip')}</p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {(goal.tasks || []).length > 0 ? (
                  goal.tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50 animate-in fade-in-20 group">
                      <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                              id={`task-${task.id}`}
                              checked={task.completed}
                              onCheckedChange={() => handleTaskToggle(task)}
                          />
                          <label
                            htmlFor={`task-${task.id}`}
                            className={cn(
                              "text-sm font-medium leading-none",
                              task.completed && "line-through text-muted-foreground"
                            )}
                          >
                            {task.text}
                          </label>
                      </div>
                      <div className="flex items-center gap-2">
                          {task.dueDate && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {format(parseISO(task.dueDate), 'MMM d')}
                              </span>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleTaskDelete(task.id)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  !showAddTask && <p className="text-center text-sm text-muted-foreground py-4">{t('goalsPage.noTasks')}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {showAddTask ? (
                <AddTaskForm goalId={goal.id} onTaskAdded={handleTaskAdded} onCancel={() => setShowAddTask(false)} />
              ) : (
                <Button variant="outline" className="w-full" onClick={() => setShowAddTask(true)}>
                  <Plus className="mr-2 h-4 w-4" /> {t('goalsPage.addTaskButton')}
                </Button>
              )}
            </CardFooter>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle>{t('goalsPage.goalDetail.examplesLabel')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {(goal.examples || []).map((example, index) => (
                  <div key={index} className="flex items-center gap-2 bg-secondary p-2 rounded-md">
                    <p className="flex-1">{example}</p>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveExample(index)} className="h-7 w-7">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder={t('goalsPage.goalDetail.examplesPlaceholder')}
                />
                <Button onClick={handleAddExample}><Plus className="mr-2"/>{t('goalsPage.goalDetail.addExample')}</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                  <CardTitle className="flex items-center gap-2"><UserCheck /> {t('goalsPage.goalDetail.characteristicsLabel')}</CardTitle>
                  <CardDescription>{t('goalsPage.goalDetail.characteristicsDescription')}</CardDescription>
              </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setIsCharSuggesterOpen(true)}>
                            <Sparkles className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('goalsPage.characteristicsSuggester.tooltip')}</p>
                    </TooltipContent>
                </Tooltip>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {(goal.characteristics || []).map((characteristic, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input 
                            value={characteristic}
                            onChange={(e) => handleCharacteristicChange(index, e.target.value)}
                            className="bg-secondary border-0"
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveCharacteristic(index)} className="h-9 w-9">
                        <Trash2 className="h-4 w-4" />
                        </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 items-center pt-2">
                <Input
                  value={newCharacteristic}
                  onChange={(e) => setNewCharacteristic(e.target.value)}
                  placeholder={t('goalsPage.goalDetail.characteristicsPlaceholder')}
                />
                <Button onClick={handleAddCharacteristic} size="icon"><Plus/></Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy /> {t('goalsPage.goalDetail.winsLabel')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {(goal.wins || []).map((win, index) => (
                  <div key={index} className="flex items-center gap-2 bg-secondary p-2 rounded-md">
                    <p className="flex-1">{win}</p>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveWin(index)} className="h-7 w-7">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newWin}
                  onChange={(e) => setNewWin(e.target.value)}
                  placeholder={t('goalsPage.goalDetail.winsPlaceholder')}
                />
                <Button onClick={handleAddWin}><Plus className="mr-2"/>{t('goalsPage.goalDetail.addWin')}</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon /> {t('goalsPage.goalDetail.imageUrlsLabel')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {(goal.imageUrls || []).map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <Image src={url} alt={`Goal inspiration ${index + 1}`} layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="inspiration abstract"/>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveImageUrl(index)}
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
               <div className="flex gap-2 items-center pt-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder={t('goalsPage.goalDetail.imageUrlPlaceholder')}
                />
                <Button onClick={handleAddImageUrl} size="icon"><Plus/></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('goalsPage.goalDetail.savingButton') : t('goalsPage.goalDetail.saveButton')}
        </Button>
      </div>

    </div>
    </TooltipProvider>
  );
}

    