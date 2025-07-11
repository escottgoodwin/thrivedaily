
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getWorrySuggestionAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WorryChat } from './worry-chat';


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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentWorry, setCurrentWorry] = useState('');

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
  
  const handleOpenChat = (worry: string) => {
    setCurrentWorry(worry);
    setIsChatOpen(true);
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
           <TooltipProvider>
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenChat(item)}
                              className="h-7 w-7"
                              aria-label={`Get suggestion for ${item}`}
                            >
                              <Sparkles className="h-4 w-4 text-primary" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Discuss with AI</p>
                          </TooltipContent>
                        </Tooltip>
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
            </TooltipProvider>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-[525px] h-[70vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Discussing: "{currentWorry}"</DialogTitle>
          </DialogHeader>
          <WorryChat worry={currentWorry} />
        </DialogContent>
      </Dialog>
    </>
  );
}
