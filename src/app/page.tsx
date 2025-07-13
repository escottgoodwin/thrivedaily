
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyList } from '@/components/dashboard/daily-list';
import { DailyQuote } from '@/components/dashboard/daily-quote';
import { Cloudy, Gift, ListTodo, Target } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { getListForToday, saveListForToday, getDailyGoalsAndTasks, saveDailyGoalsAndTasks } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Goal } from './types';
import { useLanguage } from '@/components/i18n/language-provider';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [worries, setWorries] = useState<string[]>([]);
  const [gratitude, setGratitude] = useState<string[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('worries');
  const { toast } = useToast();
  const { t } = useLanguage();

  const loadData = useCallback(async () => {
    if (user) {
      setDataLoading(true);
      const [worriesData, gratitudeData, goalsAndTasksData] = await Promise.all([
        getListForToday(user.uid, 'worries'),
        getListForToday(user.uid, 'gratitude'),
        getDailyGoalsAndTasks(user.uid),
      ]);
      setWorries(worriesData);
      setGratitude(gratitudeData);
      setGoals(goalsAndTasksData.goals || []);
      setTasks(goalsAndTasksData.tasks || []);
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);
  
  const handleSetList = (listName: 'worries' | 'gratitude' | 'goals' | 'tasks') => async (newItems: string[]) => {
      
      if(!user) return;

      let result;
      if (listName === 'worries' || listName === 'gratitude') {
        result = await saveListForToday(user.uid, listName, newItems);
      } else {
        result = await saveDailyGoalsAndTasks(user.uid, {
            goals: listName === 'goals' ? newItems : goals.map(g => g.text),
            tasks: listName === 'tasks' ? newItems : tasks
        });
      }
      
      if (result.error) {
          toast({ title: t('toasts.error'), description: t('toasts.saveError'), variant: "destructive" });
      }
      await loadData(); // Reload all data to ensure consistency
  };

  if (authLoading || dataLoading) {
    return (
       <div className="flex flex-col gap-8">
        <Skeleton className="h-[218px] w-full rounded-lg" />
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
        worries={worries}
        gratitude={gratitude}
        goals={goals}
        tasks={tasks}
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('dashboard.myDayTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
              <TabsTrigger value="worries"><Cloudy className="mr-2" />{t('dashboard.worriesTab')}</TabsTrigger>
              <TabsTrigger value="gratitude"><Gift className="mr-2" />{t('dashboard.gratitudeTab')}</TabsTrigger>
              <TabsTrigger value="goals"><Target className="mr-2" />{t('dashboard.goalsTab')}</TabsTrigger>
              <TabsTrigger value="tasks"><ListTodo className="mr-2" />{t('dashboard.tasksTab')}</TabsTrigger>
            </TabsList>
            <TabsContent value="worries">
              <DailyList
                title={t('dashboard.worry.title')}
                items={worries}
                setItems={handleSetList('worries')}
                placeholder={t('dashboard.worry.placeholder')}
                icon={<Cloudy className="text-primary" />}
                listType="worries"
              />
            </TabsContent>
            <TabsContent value="gratitude">
              <DailyList
                title={t('dashboard.gratitude.title')}
                items={gratitude}
                setItems={handleSetList('gratitude')}
                placeholder={t('dashboard.gratitude.placeholder')}
                icon={<Gift className="text-primary" />}
              />
            </TabsContent>
            <TabsContent value="goals">
              <DailyList
                title={t('dashboard.goal.title')}
                items={goals.map(g => g.text)}
                setItems={handleSetList('goals')}
                placeholder={t('dashboard.goal.placeholder')}
                icon={<Target className="text-primary" />}
              />
            </TabsContent>
            <TabsContent value="tasks">
              <DailyList
                title={t('dashboard.task.title')}
                items={tasks}
                setItems={handleSetList('tasks')}
                placeholder={t('dashboard.task.placeholder')}
                icon={<ListTodo className="text-primary" />}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
