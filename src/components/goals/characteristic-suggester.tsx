
"use client";

import { useState, useEffect } from 'react';
import type { Goal } from '@/app/types';
import { getCharacteristicSuggestionsAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '../i18n/language-provider';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

interface CharacteristicSuggesterProps {
  goal: Goal;
  onAdd: (suggestions: string[]) => void;
}

export function CharacteristicSuggester({ goal, onAdd }: CharacteristicSuggesterProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { t, language } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      const result = await getCharacteristicSuggestionsAction({
        goal: goal.text,
        description: goal.description,
        language
      });
      if (result.characteristics && result.characteristics.length > 0) {
        setSuggestions(result.characteristics);
      } else {
        toast({
            title: t('toasts.error'),
            description: t('goalsPage.characteristicsSuggester.fetchError'),
            variant: 'destructive',
        });
      }
      setIsLoading(false);
    };
    fetchSuggestions();
  }, [goal, language, t, toast]);
  
  const handleToggle = (suggestion: string) => {
    setSelected(prev => ({
        ...prev,
        [suggestion]: !prev[suggestion]
    }));
  }

  const handleAddSelected = () => {
    const selectedItems = Object.keys(selected).filter(key => selected[key]);
    if (selectedItems.length > 0) {
        onAdd(selectedItems);
    }
  }

  const renderSkeleton = () => (
    <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
            </div>
        ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('goalsPage.characteristicsSuggester.description')}</p>
      <ScrollArea className="h-64 border rounded-md p-4">
        {isLoading ? renderSkeleton() : (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`suggestion-${index}`}
                  checked={selected[suggestion] || false}
                  onCheckedChange={() => handleToggle(suggestion)}
                />
                <label
                  htmlFor={`suggestion-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {suggestion}
                </label>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <Button onClick={handleAddSelected} className="w-full">
        {t('goalsPage.characteristicsSuggester.addButton')}
      </Button>
    </div>
  );
}
