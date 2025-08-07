
"use client";

import React, { useState } from 'react';
import type { Concern, DailyTask } from '@/app/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Sparkles, Scale } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConcernChat } from './concern-chat';
import { ConcernAnalysisDialog } from './concern-analysis-dialog';
import { useLanguage } from '../i18n/language-provider';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';

type ItemType = Concern | DailyTask | string;

type DailyListProps = {
  title: string;
  items: ItemType[];
  setItems: (items: any[]) => void | Promise<void>;
  placeholder: string;
  icon: React.ReactNode;
  listType?: 'concerns' | 'gratitude' | 'tasks';
  onTaskToggle?: (task: DailyTask) => void;
};

export function DailyList({ title, items, setItems, placeholder, icon, listType, onTaskToggle }: DailyListProps) {
  const [newItem, setNewItem] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [currentConcern, setCurrentConcern] = useState<Concern | null>(null);
  const { t } = useLanguage();

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      let newItems;
      if (listType === 'concerns') {
        newItems = [...items, { id: crypto.randomUUID(), text: newItem.trim() }];
      } else if (listType === 'tasks') {
        newItems = [...items, { id: crypto.randomUUID(), text: newItem.trim(), completed: false }];
      }
      else {
        newItems = [...items, newItem.trim()];
      }
      setItems(newItems);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };
  
  const handleOpenChat = (concern: Concern) => {
    setCurrentConcern(concern);
    setIsChatOpen(true);
  }
  
  const handleOpenAnalysis = (concern: Concern) => {
    setCurrentConcern(concern);
    setIsAnalysisOpen(true);
  }
  
  const handleAnalysisSave = (updatedConcern: Concern) => {
     const newItems = items.map(item => {
      if(typeof item === 'object' && 'id' in item && item.id === updatedConcern.id) {
        return updatedConcern;
      }
      return item;
    });
    setItems(newItems);
    setIsAnalysisOpen(false);
  }

  const getItemText = (item: any): string => {
    if (typeof item === 'object' && item !== null && 'text' in item) {
      return item.text;
    }
    return item as string;
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
            <Button type="submit">{t('dashboard.addButton')}</Button>
          </form>
          <ScrollArea className="h-48 w-full pr-4">
           <TooltipProvider>
            {items.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">{t('dashboard.listEmpty')}</p>
            ) : (
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li
                    key={typeof item === 'object' && item.id ? item.id : index}
                    className="flex items-center justify-between bg-secondary p-2 rounded-md animate-in fade-in-20"
                  >
                    <div className="flex items-center gap-3 flex-1 mr-2">
                      {listType === 'tasks' && onTaskToggle && (
                        <Checkbox
                          id={`task-${(item as DailyTask).id}`}
                          checked={(item as DailyTask).completed}
                          onCheckedChange={() => onTaskToggle(item as DailyTask)}
                        />
                      )}
                      <label 
                        htmlFor={listType === 'tasks' ? `task-${(item as DailyTask).id}`: undefined}
                        className={cn("flex-1", (item as DailyTask)?.completed && "line-through text-muted-foreground")}>
                        {getItemText(item)}
                      </label>
                    </div>

                    <div className="flex items-center gap-1">
                      {listType === 'concerns' && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenAnalysis(item as Concern)}>
                                <Scale className="h-4 w-4 text-primary" />
                               </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('dashboard.concern.concernAnalysisAction')}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenChat(item as Concern)}
                                className="h-7 w-7"
                                aria-label={`Get suggestion for ${getItemText(item)}`}
                              >
                                <Sparkles className="h-4 w-4 text-primary" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('dashboard.concern.discussAction')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        className="h-7 w-7"
                        aria-label={`Remove ${getItemText(item)}`}
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
      
      {currentConcern && (
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogContent className="sm:max-w-[525px] h-[70vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{t('dashboard.chat.title').replace('{concern}', currentConcern.text)}</DialogTitle>
            </DialogHeader>
            <ConcernChat concern={currentConcern} />
          </DialogContent>
        </Dialog>
      )}

      {currentConcern && (
        <ConcernAnalysisDialog
          isOpen={isAnalysisOpen}
          onClose={() => setIsAnalysisOpen(false)}
          concern={currentConcern}
          onSave={handleAnalysisSave}
        />
      )}
    </>
  );
}
