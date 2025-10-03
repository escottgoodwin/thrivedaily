
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getDailyQuoteAction, recordUsage } from '@/app/actions';
import type { DailyTask, Concern } from '@/app/types';
import { Sparkles, Quote, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '../i18n/language-provider';
import { useSubscription } from '@/hooks/use-subscription';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';
import { useAuth } from '../auth/auth-provider';
import { useUsage } from '@/hooks/use-usage';

type DailyQuoteProps = {
  concerns: Concern[];
  gratitude: string;
  tasks: DailyTask[];
};

export function DailyQuote({ concerns, gratitude, tasks }: DailyQuoteProps) {
  const { user } = useAuth();
  const [quote, setQuote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { isSubscribed } = useSubscription();
  const { canUse, updateUsage } = useUsage();

  const isAllowed = canUse('customQuote');

  const handleGenerateQuote = async () => {
    if (!user) return;
    setIsLoading(true);
    setQuote('');
    try {
      //  if (!isSubscribed) {
      //   const recordResult = await recordUsage(user.uid, 'customQuote');
      //   if (recordResult.success) {
      //   updateUsage(recordResult.newUsage);
      //   } else {
      //     throw new Error('Failed to record usage.');
      //   }
      // }
      const result = await getDailyQuoteAction({
        userId: user.uid,
        concerns: concerns,
        gratitude: gratitude,
        tasks: tasks,
        language: language
      });
      console.log(result)
      if (result.quote) {
        setQuote(result.quote);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: t('toasts.error'),
        description: t('toasts.quoteError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const UpgradeButton = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
           <Button disabled className="bg-primary-foreground text-primary hover:bg-white/90">
             <Zap className="mr-2 fill-yellow-400 text-yellow-500" />
             {t('dashboard.getQuoteButton')}
           </Button>
        </TooltipTrigger>
        <TooltipContent>
            <Link href="/upgrade">
              <p>{!isAllowed ? t('usageLimits.weeklyLimitReached') : t('tooltips.upgrade')}</p>
            </Link>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )


  return (
    <Card className="bg-gradient-to-br from-primary via-accent to-secondary shadow-xl">
      <CardHeader>
        <CardTitle className="text-primary-foreground flex items-center gap-2">
          <Sparkles />
          {t('dashboard.dailyQuoteTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center gap-4">
        {isLoading ? (
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-5/6 mx-auto bg-white/20" />
            <Skeleton className="h-4 w-4/6 mx-auto bg-white/20" />
          </div>
        ) : quote ? (
          <blockquote className="text-lg font-medium text-primary-foreground italic flex items-start">
            <Quote className="w-8 h-8 mr-2 shrink-0" />
            <span>{quote}</span>
          </blockquote>
        ) : (
          <p className="text-primary-foreground">{t('dashboard.getQuotePrompt')}</p>
        )}
        
        {isSubscribed || isAllowed ? (
           <Button
              onClick={handleGenerateQuote}
              disabled={isLoading}
              className="bg-primary-foreground text-primary hover:bg-white/90"
            >
              {isLoading ? t('dashboard.generatingQuote') : t('dashboard.getQuoteButton')}
            </Button>
        ) : (
            <UpgradeButton />
        )}
      </CardContent>
    </Card>
  );
}
