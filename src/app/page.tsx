"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyList } from '@/components/dashboard/daily-list';
import { DailyQuote } from '@/components/dashboard/daily-quote';
import { Cloudy, Gift, ListTodo, Target } from 'lucide-react';

export default function DashboardPage() {
  const [worries, setWorries] = useState<string[]>([]);
  const [gratitude, setGratitude] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);

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
                setItems={setWorries}
                placeholder="e.g., upcoming presentation"
                icon={<Cloudy className="text-primary" />}
              />
            </TabsContent>
            <TabsContent value="gratitude">
              <DailyList
                title="What are you grateful for today?"
                items={gratitude}
                setItems={setGratitude}
                placeholder="e.g., a sunny morning"
                icon={<Gift className="text-primary" />}
              />
            </TabsContent>
            <TabsContent value="goals">
              <DailyList
                title="What are your long-term goals?"
                items={goals}
                setItems={setGoals}
                placeholder="e.g., learn a new skill"
                icon={<Target className="text-primary" />}
              />
            </TabsContent>
            <TabsContent value="tasks">
              <DailyList
                title="What needs to get done?"
                items={tasks}
                setItems={setTasks}
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
