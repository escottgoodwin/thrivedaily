
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getFieldSuggestionAction } from '@/app/actions';
import { useLanguage } from '@/components/i18n/language-provider';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '../auth/auth-provider';

interface SuggestionPopoverProps {
  fieldName: string;
  context: Record<string, string>;
  disabled?: boolean;
}

export function SuggestionPopover({ fieldName, context, disabled }: SuggestionPopoverProps) {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { language, t } = useLanguage();
  const { toast } = useToast();

  const handleFetchSuggestions = async () => {
    if (isLoading || !user) return;
    setIsLoading(true);
    setSuggestions([]);
    
    const result = await getFieldSuggestionAction({
      userId: user.uid,
      fieldName,
      context,
      language
    });
    
    if (result.suggestions && result.suggestions.length > 0) {
      setSuggestions(result.suggestions);
    } else {
      toast({
        title: t('toasts.error'),
        description: t('decisionMatrixPage.suggestion.fetchError'),
        variant: 'destructive'
      });
      setIsOpen(false); // Close popover if there's an error
    }
    setIsLoading(false);
  };

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      handleFetchSuggestions();
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          disabled={disabled || !user}
        >
          <Sparkles className="h-4 w-4 text-primary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">{t('decisionMatrixPage.suggestion.title')}</h4>
          <p className="text-sm text-muted-foreground">
            {t('decisionMatrixPage.suggestion.description')}
          </p>
          <ScrollArea className="h-48">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <ul className="list-disc pl-5 space-y-2 text-sm">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
