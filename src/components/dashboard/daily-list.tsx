"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Sparkles } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getWorrySuggestionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

type DailyListProps = {
  title: string;
  items: string[];
  setItems: (items: string[]) => void | Promise<void>;
  placeholder: string;
  icon: React.ReactNode;
  listType?: 'worries' | 'gratitude' | 'goals' | 'tasks';
};

export function DailyList({ title, items, setItems, placeholder, icon, listType }: DailyListProps) {
  const [newItem, setNewItem] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [currentWorry, setCurrentWorry] = useState('');
  const { toast } = useToast();

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      const newItems = [...items, newItem.trim()];
      setItems(newItems);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };
  
  const handleGetSuggestion = async (worry: string) => {
    setCurrentWorry(worry);
    setIsSuggestionOpen(true);
    setIsLoadingSuggestion(true);
    setSuggestion('');
    try {
      const result = await getWorrySuggestionAction(worry);
      if (result.suggestion) {
        setSuggestion(result.suggestion);
      } else {
         throw new Error('Failed to get suggestion');
      }
    } catch(error) {
       toast({
        title: 'Error',
        description: 'Could not get a suggestion. Please try again.',
        variant: 'destructive',
      });
       setIsSuggestionOpen(false);
    } finally {
        setIsLoadingSuggestion(false);
    }
  }

  return (
    <>
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={placeholder}
            />
            <Button type="submit">Add</Button>
          </form>
          <ScrollArea className="h-48 w-full pr-4">
            {items.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Your list is empty.</p>
            ) : (
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-secondary p-2 rounded-md animate-in fade-in-20"
                  >
                    <span className="flex-1 mr-2">{item}</span>
                    <div className="flex items-center gap-1">
                      {listType === 'worries' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleGetSuggestion(item)}
                          className="h-7 w-7"
                          aria-label={`Get suggestion for ${item}`}
                        >
                          <Sparkles className="h-4 w-4 text-primary" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        className="h-7 w-7"
                        aria-label={`Remove ${item}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      
      <AlertDialog open={isSuggestionOpen} onOpenChange={setIsSuggestionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suggestion for: "{currentWorry}"</AlertDialogTitle>
            <AlertDialogDescription>
              Here's a piece of advice to help you with this worry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {isLoadingSuggestion ? (
             <div className="space-y-2">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <p>{suggestion}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsSuggestionOpen(false)}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
