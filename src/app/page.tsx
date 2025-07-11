
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyList } from '@/components/dashboard/daily-list';
import { DailyQuote } from '@/components/dashboard/daily-quote';
import { Cloudy, Gift, ListTodo, Target } from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { getDailyLists, saveDailyLists } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import type { Goal } from './actions';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [worries, setWorries] = useState<string[]>([]);
  const [gratitude, setGratitude] = useState<string[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    if (user) {
      setDataLoading(true);
      const data = await getDailyLists(user.uid);
      setWorries(data.worries || []);
      setGratitude(data.gratitude || []);
      setGoals(data.goals || []);
      setTasks(data.tasks || []);
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleSetList = (listName: 'worries' | 'gratitude' | 'goals' | 'tasks') => async (newItems: string[]) => {
      
      if(user) {
        const currentLists = await getDailyLists(user.uid);
        
        const payload = {
          worries: listName === 'worries' ? newItems : currentLists.worries,
          gratitude: listName === 'gratitude' ? newItems : currentLists.gratitude,
          goals: listName === 'goals' ? newItems : currentLists.goals.map(g => g.text),
          tasks: listName === 'tasks' ? newItems : currentLists.tasks,
        };

        const { error } = await saveDailyLists(user.uid, payload);
        if (error) {
            toast({ title: "Error", description: "Could not save your changes.", variant: "destructive" });
        }
        await loadData(); // Reload all data to ensure consistency
      }
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
          <CardTitle>My Day</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="worries" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
              <TabsTrigger value="worries"><Cloudy className="mr-2" />Worries</TabsTrigger>
              <TabsTrigger value="gratitude"><Gift className="mr-2" />Gratitude</TabsTrigger>
              <TabsTrigger value="goals"><Target className="mr-2" />Goals</TabsTrigger>
              <TabsTrigger value="tasks"><ListTodo className="mr-2" />Tasks</TabsTrigger>
            </TabsList>
            <TabsContent value="worries">
              <DailyList
                title="What's on your mind?"
                items={worries}
                setItems={handleSetList('worries')}
                placeholder="e.g., upcoming presentation"
                icon={<Cloudy className="text-primary" />}
              />
            </TabsContent>
            <TabsContent value="gratitude">
              <DailyList
                title="What are you grateful for today?"
                items={gratitude}
                setItems={handleSetList('gratitude')}
                placeholder="e.g., a sunny morning"
                icon={<Gift className="text-primary" />}
              />
            </TabsContent>
            <TabsContent value="goals">
              <DailyList
                title="What are your long-term goals?"
                items={goals.map(g => g.text)}
                setItems={handleSetList('goals')}
                placeholder="e.g., learn a new skill"
                icon={<Target className="text-primary" />}
              />
            </TabsContent>
            <TabsContent value="tasks">
              <DailyList
                title="What needs to get done?"
                items={tasks}
                setItems={handleSetList('tasks')}
                placeholder="e.g., finish report"
                icon={<ListTodo className="text-primary" />}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
