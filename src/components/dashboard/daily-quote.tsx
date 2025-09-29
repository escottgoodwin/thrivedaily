
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getDailyQuoteAction } from '@/app/actions';
import type { DailyTask, Concern } from '@/app/types';
import { Sparkles, Quote, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '../i18n/language-provider';
import { useSubscription } from '@/hooks/use-subscription';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';

type DailyQuoteProps = {
  concerns: Concern[];
  gratitude: string[];
  tasks: DailyTask[];
};

export function DailyQuote({ concerns, gratitude, tasks }: DailyQuoteProps) {
  const [quote, setQuote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { isSubscribed } = useSubscription();

  const handleGenerateQuote = async () => {
    setIsLoading(true);
    setQuote('');
    try {
      const result = await getDailyQuoteAction({
        concerns: concerns,
        gratitude: gratitude.join(', '),
        tasks: tasks,
        language: language
      });
      if (result.quote) {
        setQuote(result.quote);
      } else {
        throw new Error('Failed to generate a quote.');
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
              <p>{t('tooltips.upgrade')}</p>
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
        
        {isSubscribed ? (
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
