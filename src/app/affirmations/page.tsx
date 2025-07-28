
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import type { DecisionMatrixEntry } from '@/app/types';
import { getDecisionMatrixEntries, recordAffirmationRepetition } from '@/app/actions';
import { useLanguage } from '@/components/i18n/language-provider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AffirmationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [entries, setEntries] = useState<DecisionMatrixEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    if (user) {
      setLoading(true);
      const fetchedEntries = await getDecisionMatrixEntries(user.uid);
      setEntries(fetchedEntries);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadEntries();
    }
  }, [authLoading, loadEntries]);

  const handleRepeatAffirmation = async (entryId: string) => {
    if (!user) return;
    
    const originalEntries = [...entries];
    const today = new Date().toISOString().split('T')[0];

    // Optimistic update
    setEntries(prev => prev.map(entry => {
        if (entry.id !== entryId) return entry;
        
        const isNewDay = entry.lastAffirmedDate !== today;
        const newCount = isNewDay ? 1 : (entry.dailyAffirmationCount || 0) + 1;
        
        return { 
            ...entry, 
            dailyAffirmationCount: newCount,
            lastAffirmedDate: today
        };
    }));

    const result = await recordAffirmationRepetition(user.uid, entryId);

    if (!result.success) {
      toast({ title: t('toasts.error'), description: result.error, variant: 'destructive' });
      // Revert optimistic update
      setEntries(originalEntries);
    }
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
         <Card key={i} className="shadow-lg">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-1/2" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-full" />
            </CardFooter>
         </Card>
      ))}
    </div>
  );
  
  const affirmations = entries.filter(entry => entry.newDecision?.trim() !== '');
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
            <Smile className="text-primary"/>
            {t('affirmationsPage.title')}
        </h1>
        <p className="text-muted-foreground mt-2">{t('affirmationsPage.description')}</p>
      </div>

       {loading || authLoading ? renderSkeleton() : (
           affirmations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {affirmations.map(entry => {
                const todaysCount = entry.lastAffirmedDate === today ? (entry.dailyAffirmationCount || 0) : 0;
                return (
                    <Card key={entry.id} className="shadow-lg flex flex-col justify-between">
                        <div>
                            <CardHeader>
                                <CardTitle className="text-2xl font-semibold text-primary">
                                    "{entry.newDecision}"
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    {t('affirmationsPage.fromYour')} <span className="font-semibold text-foreground">"{entry.limitingBelief}"</span>
                                </CardDescription>
                            </CardContent>
                        </div>
                        <CardFooter className="flex justify-between items-center gap-4">
                            <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                               <span>{t('affirmationsPage.todaysCountLabel')}</span>
                               <span className="font-bold text-lg text-primary">{todaysCount}</span>
                            </div>
                            <Button 
                                size="icon"
                                variant="outline"
                                onClick={() => handleRepeatAffirmation(entry.id)}
                            >
                                <Plus />
                            </Button>
                        </CardFooter>
                    </Card>
                )
              })}
            </div>
           ) : (
             <Card className="text-center py-16 border-2 border-dashed rounded-lg">
                <CardHeader>
                    <CardTitle>{t('affirmationsPage.noAffirmations')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>{t('affirmationsPage.noAffirmationsDesc')}</CardDescription>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button asChild>
                        <Link href="/decision-matrix">{t('affirmationsPage.goToMatrix')}</Link>
                    </Button>
                </CardFooter>
             </Card>
           )
       )}
    </div>
  );
}
