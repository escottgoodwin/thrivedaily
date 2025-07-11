
"use client";

import { useState } from 'react';
import type { Goal, Task } from '@/app/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { AddTaskForm } from './add-task-form';
import { useAuth } from '../auth/auth-provider';
import { updateTask, deleteTask, deleteGoal } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useLanguage } from '../i18n/language-provider';


interface GoalCardProps {
  goal: Goal;
  onGoalDeleted: () => void;
}

export function GoalCard({ goal, onGoalDeleted }: GoalCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAddTask, setShowAddTask] = useState(false);
  const { t } = useLanguage();

  const handleTaskToggle = async (task: Task) => {
    if (!user) return;
    const updated = { ...task, completed: !task.completed };
    await updateTask(user.uid, goal.id, updated);
  };
  
  const handleTaskDelete = async (taskId: string) => {
    if (!user) return;
    const { success, error } = await deleteTask(user.uid, goal.id, taskId);
     if (error) {
      toast({ title: t('toasts.error'), description: error, variant: "destructive" });
    }
  }

  const handleGoalDelete = async () => {
    if(!user) return;
    const { success, error } = await deleteGoal(user.uid, goal.id);
    if(success) {
      onGoalDeleted();
    } else {
       toast({ title: t('toasts.error'), description: error, variant: "destructive" });
    }
  }

  const completedTasks = goal.tasks.filter(t => t.completed).length;
  const progress = goal.tasks.length > 0 ? (completedTasks / goal.tasks.length) * 100 : 0;

  return (
    <Card className="shadow-md flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{goal.text}</CardTitle>
              <CardDescription>
                {t('goalsPage.tasksCompleted').replace('{completed}', completedTasks.toString()).replace('{total}', goal.tasks.length.toString())}
              </CardDescription>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleGoalDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>{t('goalsPage.deleteGoal')}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%`}}
            />
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-3">
          {goal.tasks && goal.tasks.length > 0 ? (
            goal.tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                <div className="flex items-center gap-3">
                    <Checkbox
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={() => handleTaskToggle(task)}
                    />
                    <label
                        htmlFor={`task-${task.id}`}
                        className={cn("text-sm font-medium leading-none", task.completed && "line-through text-muted-foreground")}
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
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleTaskDelete(task.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">{t('goalsPage.noTasks')}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        {showAddTask ? (
          <AddTaskForm goalId={goal.id} onTaskAdded={() => setShowAddTask(false)} onCancel={() => setShowAddTask(false)} />
        ) : (
          <Button variant="outline" className="w-full" onClick={() => setShowAddTask(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t('goalsPage.addTaskButton')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
