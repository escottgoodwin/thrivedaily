"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getDailyQuoteAction } from '@/app/actions';
import { Sparkles, Quote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type DailyQuoteProps = {
  worries: string[];
  gratitude: string[];
  goals: string[];
  tasks: string[];
};

export function DailyQuote({ worries, gratitude, goals, tasks }: DailyQuoteProps) {
  const [quote, setQuote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateQuote = async () => {
    setIsLoading(true);
    setQuote('');
    try {
      const result = await getDailyQuoteAction({
        worries: worries.join(', '),
        gratitude: gratitude.join(', '),
        goals: goals.join(', '),
        tasks: tasks.join(', '),
      });
      if (result.quote) {
        setQuote(result.quote);
      } else {
        throw new Error('Failed to generate a quote.');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Could not generate a quote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary via-accent to-secondary shadow-xl">
      <CardHeader>
        <CardTitle className="text-primary-foreground flex items-center gap-2">
          <Sparkles />
          Your Daily Inspiration
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
          <p className="text-primary-foreground">Click the button to get your personalized quote for today.</p>
        )}
        <Button
          onClick={handleGenerateQuote}
          disabled={isLoading}
          className="bg-primary-foreground text-primary hover:bg-white/90"
        >
          {isLoading ? 'Generating...' : "Get Today's Quote"}
        </Button>
      </CardContent>
    </Card>
  );
}
