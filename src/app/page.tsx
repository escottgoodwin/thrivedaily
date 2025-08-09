
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyList } from '@/components/dashboard/daily-list';
import { DailyQuote } from '@/components/dashboard/daily-quote';
import { Cloudy, Gift, ListTodo } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { getListForToday, saveListForToday, saveDailyTasks, getDailyTasks, getRecentWins, updateDailyTask } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Goal, Concern, RecentWin, DailyTask } from './types';
import { useLanguage } from '@/components/i18n/language-provider';
import { RecentWins } from '@/components/dashboard/recent-wins';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [gratitude, setGratitude] = useState<string[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [recentWins, setRecentWins] = useState<RecentWin[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('concerns');
  const { toast } = useToast();
  const { t } = useLanguage();

  const loadData = useCallback(async () => {
    if (user) {
      setDataLoading(true);
      const [concernsData, gratitudeData, tasksData, winsData] = await Promise.all([
        getListForToday(user.uid, 'concerns'),
        getListForToday(user.uid, 'gratitude'),
        getDailyTasks(user.uid),
        getRecentWins(user.uid),
      ]);
      setConcerns(concernsData);
      setGratitude(gratitudeData);
      setTasks(tasksData);
      setRecentWins(winsData);
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);
  
  const handleSetList = (listName: 'concerns' | 'gratitude' | 'tasks') => async (newItems: any[]) => {
      
      if(!user) return;

      let result;
      if (listName === 'concerns') {
        setConcerns(newItems as Concern[]);
        result = await saveListForToday(user.uid, 'concerns', newItems as Concern[]);
      } else if (listName === 'gratitude') {
        setGratitude(newItems as string[]);
        result = await saveListForToday(user.uid, 'gratitude', newItems as string[]);
      } else { // tasks
         setTasks(newItems as DailyTask[]);
         result = await saveDailyTasks(user.uid, newItems as DailyTask[]);
      }
      
      if (result.error) {
          toast({ title: t('toasts.error'), description: t('toasts.saveError'), variant: "destructive" });
      }
      // No full reload to allow optimistic updates to feel instant
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
        gratitude={gratitude.join(', ')}
        tasks={tasks}
      />

      <RecentWins wins={recentWins} />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('dashboard.myDayTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto">
              <TabsTrigger value="concerns"><Cloudy className="mr-2" />{t('dashboard.concernsTab')}</TabsTrigger>
              <TabsTrigger value="gratitude"><Gift className="mr-2" />{t('dashboard.gratitudeTab')}</TabsTrigger>
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
