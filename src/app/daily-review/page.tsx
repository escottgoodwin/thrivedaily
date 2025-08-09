
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { getGoals, getDailyTasks, getDailyReview, saveDailyReview, updateGoal } from '@/app/actions';
import { useLanguage } from '@/components/i18n/language-provider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar as CalendarIcon, ClipboardCheck, ListTodo } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import type { Goal, DailyTask, DailyReview } from '../types';
import { GoalReviewCard } from '@/components/daily-review/goal-review-card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function DailyReviewPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [review, setReview] = useState<DailyReview>({ summary: '', wins: [], goalProgress: '', improvements: '' });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newWin, setNewWin] = useState('');

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const loadData = useCallback(async () => {
    if (user) {
      setLoading(true);
      const [goalsData, tasksData, reviewData] = await Promise.all([
        getGoals(user.uid),
        getDailyTasks(user.uid, dateString),
        getDailyReview(user.uid, dateString)
      ]);
      setGoals(goalsData);
      setTasks(tasksData);
      if (reviewData) {
        setReview(reviewData);
      } else {
        setReview({ summary: '', wins: [], goalProgress: '', improvements: '' });
      }
      setLoading(false);
    }
  }, [user, dateString]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const result = await saveDailyReview(user.uid, dateString, review);
    if (result.success) {
      toast({ title: t('toasts.success'), description: t('dailyReviewPage.saveSuccess') });
    } else {
      toast({ title: t('toasts.error'), description: result.error, variant: 'destructive' });
    }
    setIsSaving(false);
  };
  
  const handleGoalUpdate = async (updatedGoal: Goal) => {
    if (!user) return;
    const result = await updateGoal(user.uid, updatedGoal);
     if (result.success) {
      setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    } else {
      toast({ title: t('toasts.error'), description: result.error, variant: 'destructive' });
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if(date) {
        setSelectedDate(date);
    }
  };
  
  const handleAddWin = () => {
    if (newWin.trim()) {
      setReview(prev => ({ ...prev, wins: [...prev.wins, newWin.trim()] }));
      setNewWin('');
    }
  };

  const handleRemoveWin = (index: number) => {
    const updatedWins = [...review.wins];
    updatedWins.splice(index, 1);
    setReview(prev => ({ ...prev, wins: updatedWins }));
  };
  
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="h-80 w-full" />
        <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
              <ClipboardCheck className="text-primary"/>
              {t('dailyReviewPage.title')}
          </h1>
          <p className="text-muted-foreground mt-2">{t('dailyReviewPage.description')}</p>
        </div>
         <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full md:w-[280px] justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : <span>{t('goalsPage.addTask.pickDueDate')}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
               <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
              />
            </PopoverContent>
          </Popover>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListTodo/> {t('dailyReviewPage.tasks.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                {tasks.length > 0 ? (
                    <ul className="space-y-2">
                        {tasks.map(task => (
                             <li key={task.id} className={cn("flex items-center gap-2 text-sm", task.completed && "text-muted-foreground line-through")}>
                                <Checkbox id={`task-${task.id}`} checked={task.completed} disabled />
                                <label htmlFor={`task-${task.id}`}>{task.text}</label>
                             </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center">{t('dailyReviewPage.tasks.noTasks')}</p>
                )}
            </CardContent>
          </Card>
        </aside>
        <main className="lg:col-span-2 space-y-6">
           {loading ? renderSkeleton() : (
            <>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>{t('dailyReviewPage.summary.title')}</CardTitle>
                  <CardDescription>{t('dailyReviewPage.summary.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    value={review.summary} 
                    onChange={e => setReview(prev => ({...prev, summary: e.target.value}))}
                    placeholder={t('dailyReviewPage.summary.placeholder')}
                    rows={4}
                  />
                </CardContent>
              </Card>
               <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>{t('dailyReviewPage.wins.title')}</CardTitle>
                  <CardDescription>{t('dailyReviewPage.wins.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                   <div className="space-y-2">
                    {(review.wins || []).map((win, index) => (
                      <div key={index} className="flex items-center gap-2 bg-secondary p-2 rounded-md">
                        <p className="flex-1 text-sm">{win}</p>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveWin(index)} className="h-7 w-7">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newWin}
                      onChange={(e) => setNewWin(e.target.value)}
                      placeholder={t('dailyReviewPage.wins.placeholder')}
                    />
                    <Button onClick={handleAddWin}>{t('dashboard.addButton')}</Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>{t('dailyReviewPage.progress.title')}</CardTitle>
                   <CardDescription>{t('dailyReviewPage.progress.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={review.goalProgress} 
                    onChange={e => setReview(prev => ({...prev, goalProgress: e.target.value}))}
                    placeholder={t('dailyReviewPage.progress.placeholder')}
                    rows={4}
                  />
                </CardContent>
              </Card>
              
               <div className="space-y-4">
                  {goals.map(goal => (
                    <GoalReviewCard key={goal.id} goal={goal} onUpdate={handleGoalUpdate} />
                  ))}
               </div>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>{t('dailyReviewPage.improvements.title')}</CardTitle>
                   <CardDescription>{t('dailyReviewPage.improvements.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                     value={review.improvements} 
                     onChange={e => setReview(prev => ({...prev, improvements: e.target.value}))}
                     placeholder={t('dailyReviewPage.improvements.placeholder')}
                     rows={4}
                  />
                </CardContent>
              </Card>
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? t('dailyReviewPage.saving') : t('dailyReviewPage.saveButton')}
                </Button>
              </div>
            </>
           )}
        </main>
      </div>
    </div>
  );
}
