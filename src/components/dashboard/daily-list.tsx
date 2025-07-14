
"use client";

import React, { useState } from 'react';
import type { Worry } from '@/app/types';
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
import { WorryChat } from './worry-chat';
import { useLanguage } from '../i18n/language-provider';

type DailyListProps = {
  title: string;
  items: any[];
  setItems: (items: any[]) => void | Promise<void>;
  placeholder: string;
  icon: React.ReactNode;
  listType?: 'worries' | 'gratitude' | 'goals' | 'tasks';
};

export function DailyList({ title, items, setItems, placeholder, icon, listType }: DailyListProps) {
  const [newItem, setNewItem] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentWorry, setCurrentWorry] = useState<Worry | null>(null);
  const { t } = useLanguage();

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      let newItems;
      if (listType === 'worries') {
        newItems = [...items, { id: crypto.randomUUID(), text: newItem.trim() }];
      } else {
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
  
  const handleOpenChat = (worry: Worry) => {
    setCurrentWorry(worry);
    setIsChatOpen(true);
  }

  const getItemText = (item: any): string => {
    if (listType === 'worries') {
      return item.text;
    }
    return item;
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
                    key={listType === 'worries' ? item.id : index}
                    className="flex items-center justify-between bg-secondary p-2 rounded-md animate-in fade-in-20"
                  >
                    <span className="flex-1 mr-2">{getItemText(item)}</span>
                    <div className="flex items-center gap-1">
                      {listType === 'worries' && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                               <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                                <Link href={`/decision-matrix?limitingBelief=${encodeURIComponent(getItemText(item))}`}>
                                    <Scale className="h-4 w-4 text-primary" />
                                </Link>
                               </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('dashboard.worry.decisionMatrixAction')}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenChat(item)}
                                className="h-7 w-7"
                                aria-label={`Get suggestion for ${getItemText(item)}`}
                              >
                                <Sparkles className="h-4 w-4 text-primary" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('dashboard.worry.discussAction')}</p>
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
      
      {currentWorry && (
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogContent className="sm:max-w-[525px] h-[70vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{t('dashboard.chat.title').replace('{worry}', currentWorry.text)}</DialogTitle>
            </DialogHeader>
            <WorryChat worry={currentWorry} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
