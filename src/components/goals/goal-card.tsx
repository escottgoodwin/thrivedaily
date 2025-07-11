
"use client";

import type { Goal } from '@/app/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash2 } from 'lucide-react';
import { useAuth } from '../auth/auth-provider';
import { deleteGoal } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useLanguage } from '../i18n/language-provider';


interface GoalCardProps {
  goal: Goal;
  onGoalDeleted: (goalId: string) => void;
}

export function GoalCard({ goal, onGoalDeleted }: GoalCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleGoalDelete = async () => {
    if(!user) return;
    const { success, error } = await deleteGoal(user.uid, goal.id);
    if(success) {
      onGoalDeleted(goal.id);
    } else {
       toast({ title: t('toasts.error'), description: error, variant: "destructive" });
    }
  }

  const completedTasks = (goal.tasks || []).filter(t => t.completed).length;
  const totalTasks = (goal.tasks || []).length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card className="shadow-md flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div className='flex-1 pr-2'>
              <Link href={`/goals/${goal.id}`} className="hover:underline">
                <CardTitle className="text-xl">{goal.text}</CardTitle>
              </Link>
              <CardDescription>
                {t('goalsPage.tasksCompleted').replace('{completed}', completedTasks.toString()).replace('{total}', totalTasks.toString())}
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
        <p className='text-sm text-muted-foreground line-clamp-3'>
            {goal.description || t('goalsPage.noDescription')}
        </p>
      </CardContent>
      <CardFooter>
         <Button asChild variant="secondary" className="w-full">
            <Link href={`/goals/${goal.id}`}>
              {t('goalsPage.viewDetails')}
            </Link>
         </Button>
      </CardFooter>
    </Card>
  );
}
