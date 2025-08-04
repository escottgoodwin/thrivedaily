
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyList } from '@/components/dashboard/daily-list';
import { DailyQuote } from '@/components/dashboard/daily-quote';
import { Cloudy, Gift, ListTodo, Target } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { getListForToday, saveListForToday, getDailyGoalsAndTasks, saveDailyGoalsAndTasks, getRecentWins, updateDailyTask } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Goal, Concern, RecentWin, DailyTask } from './types';
import { useLanguage } from '@/components/i18n/language-provider';
import { RecentWins } from '@/components/dashboard/recent-wins';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [gratitude, setGratitude] = useState<string[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [recentWins, setRecentWins] = useState<RecentWin[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('concerns');
  const { toast } = useToast();
  const { t } = useLanguage();

  const loadData = useCallback(async () => {
    if (user) {
      setDataLoading(true);
      const [concernsData, gratitudeData, goalsAndTasksData, winsData] = await Promise.all([
        getListForToday(user.uid, 'concerns'),
        getListForToday(user.uid, 'gratitude'),
        getDailyGoalsAndTasks(user.uid),
        getRecentWins(user.uid),
      ]);
      setConcerns(concernsData);
      setGratitude(gratitudeData);
      setGoals(goalsAndTasksData.goals || []);
      setTasks(goalsAndTasksData.tasks || []);
      setRecentWins(winsData);
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);
  
  const handleSetList = (listName: 'concerns' | 'gratitude' | 'goals' | 'tasks') => async (newItems: any[]) => {
      
      if(!user) return;

      let result;
      if (listName === 'concerns') {
        result = await saveListForToday(user.uid, 'concerns', newItems as Concern[]);
      } else if (listName === 'gratitude') {
        result = await saveListForToday(user.uid, 'gratitude', newItems as string[]);
      } else {
         const goalStrings = listName === 'goals' ? newItems.map(g => g.text) : goals.map(g => g.text);
         const taskObjects = listName === 'tasks' ? newItems : tasks;
         result = await saveDailyGoalsAndTasks(user.uid, {
            goals: goalStrings,
            tasks: taskObjects
        });
      }
      
      if (result.error) {
          toast({ title: t('toasts.error'), description: t('toasts.saveError'), variant: "destructive" });
      }
      await loadData(); // Reload all data to ensure consistency
  };

  const handleTaskToggle = async (task: DailyTask) => {
    if (!user) return;

    const updatedTask = { ...task, completed: !task.completed };
    
    // Optimistic update
    setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));

    const result = await updateDailyTask(user.uid, updatedTask);
    if (!result.success) {
      // Revert on failure
      setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? task : t));
      toast({ title: t('toasts.error'), description: result.error, variant: "destructive" });
    }
  };

  if (authLoading || dataLoading) {
    return (
       <div className="flex flex-col gap-8">
        <Skeleton className="h-[218px] w-full rounded-lg" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Card className="shadow-lg">
          <CardHeader>
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
               <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <DailyQuote
        concerns={concerns}
        gratitude={gratitude}
        goals={goals}
        tasks={tasks}
      />

      <RecentWins wins={recentWins} />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('dashboard.myDayTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
              <TabsTrigger value="concerns"><Cloudy className="mr-2" />{t('dashboard.concernsTab')}</TabsTrigger>
              <TabsTrigger value="gratitude"><Gift className="mr-2" />{t('dashboard.gratitudeTab')}</TabsTrigger>
              <TabsTrigger value="goals"><Target className="mr-2" />{t('dashboard.goalsTab')}</TabsTrigger>
              <TabsTrigger value="tasks"><ListTodo className="mr-2" />{t('dashboard.tasksTab')}</TabsTrigger>
            </TabsList>
            <TabsContent value="concerns">
              <DailyList
                title={t('dashboard.concern.title')}
                items={concerns}
                setItems={handleSetList('concerns')}
                placeholder={t('dashboard.concern.placeholder')}
                icon={<Cloudy className="text-primary" />}
                listType="concerns"
              />
            </TabsContent>
            <TabsContent value="gratitude">
              <DailyList
                title={t('dashboard.gratitude.title')}
                items={gratitude}
                setItems={handleSetList('gratitude')}
                placeholder={t('dashboard.gratitude.placeholder')}
                icon={<Gift className="text-primary" />}
                listType="gratitude"
              />
            </TabsContent>
            <TabsContent value="goals">
              <DailyList
                title={t('dashboard.goal.title')}
                items={goals.map(g => g.text)}
                setItems={handleSetList('goals')}
                placeholder={t('dashboard.goal.placeholder')}
                icon={<Target className="text-primary" />}
                listType="goals"
              />
            </TabsContent>
            <TabsContent value="tasks">
              <DailyList
                title={t('dashboard.task.title')}
                items={tasks}
                setItems={handleSetList('tasks')}
                placeholder={t('dashboard.task.placeholder')}
                icon={<ListTodo className="text-primary" />}
                listType="tasks"
                onTaskToggle={handleTaskToggle}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
