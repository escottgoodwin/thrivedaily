
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '@/components/i18n/language-provider';
import { getGoals, getRevisionEntries } from '@/app/actions';
import type { Goal, RevisionEntry } from '@/app/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Target, History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VisualizationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [revisions, setRevisions] = useState<RevisionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (user) {
      setLoading(true);
      const [goalsData, revisionsData] = await Promise.all([
        getGoals(user.uid),
        getRevisionEntries(user.uid),
      ]);
      setGoals(goalsData.filter(g => g.description));
      setRevisions(revisionsData);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);
  
  const renderGoalSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderRevisionSkeletons = () => (
     <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
             <Skeleton className="h-5 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Eye className="text-primary" />
          {t('visualizationsPage.title')}
        </h1>
        <p className="text-muted-foreground mt-2">{t('visualizationsPage.description')}</p>
      </div>

       <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="goals">
            <Target className="mr-2"/>
            {t('visualizationsPage.goalsTitle')}
            </TabsTrigger>
          <TabsTrigger value="revisions">
            <History className="mr-2"/>
            {t('visualizationsPage.revisionsTitle')}
            </TabsTrigger>
        </TabsList>
        <TabsContent value="goals" className="mt-6">
            {loading || authLoading ? renderGoalSkeletons() : (
                goals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {goals.map((goal) => (
                        <Card key={goal.id} className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold">{t('visualizationsPage.goalPrefix')} {goal.text}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground italic">"{goal.description}"</p>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-16 border-2 border-dashed">
                        <CardHeader>
                            <CardTitle>{t('visualizationsPage.noGoals')}</CardTitle>
                        </CardHeader>
                    </Card>
                )
            )}
        </TabsContent>
        <TabsContent value="revisions" className="mt-6">
             {loading || authLoading ? renderRevisionSkeletons() : (
                revisions.length > 0 ? (
                    <div className="space-y-4">
                        {revisions.map((entry) => (
                        <Card key={entry.id} className="shadow-lg">
                            <CardHeader>
                               <CardTitle className="text-md font-semibold text-muted-foreground">{t('visualizationsPage.situationPrefix')}</CardTitle>
                                <CardDescription>{entry.situation}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="font-semibold">{entry.revision}</p>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                ) : (
                     <Card className="text-center py-16 border-2 border-dashed">
                        <CardHeader>
                            <CardTitle>{t('visualizationsPage.noRevisions')}</CardTitle>
                        </CardHeader>
                    </Card>
                )
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

