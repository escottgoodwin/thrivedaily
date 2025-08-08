
"use client";

import { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '@/app/types';
import { chatAboutJournalEntryAction, getJournalChatHistory, saveJournalChatMessage } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Send, BrainCircuit, User } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useLanguage } from '../i18n/language-provider';
import { useAuth } from '../auth/auth-provider';

interface JournalChatProps {
  journalDate: string;
  journalContent: string;
}

export function JournalChat({ journalDate, journalContent }: JournalChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistoryAndStart = async () => {
      if (!user || !journalDate) return;
      setIsLoading(true);
      try {
        const history = await getJournalChatHistory(user.uid, journalDate);
        setMessages(history);

        if (history.length === 0) {
          const initialMessage: ChatMessage = { role: 'model', content: t('journalPage.chat.initialMessage') };
          setMessages([initialMessage]);
          await saveJournalChatMessage(user.uid, journalDate, initialMessage);
        }
      } catch (error) {
        toast({
          title: t('toasts.error'),
          description: t('toasts.chatResponseError'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadHistoryAndStart();
  }, [journalDate, user, toast, t, language]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        setTimeout(() => {
            const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    const userInput = input.trim();
    const userMessage: ChatMessage = { role: 'user', content: userInput };
    
    // Optimistically update UI
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      await saveJournalChatMessage(user.uid, journalDate, userMessage);
      
      const aiResponse = await chatAboutJournalEntryAction({
        journalContent,
        history: [...messages, userMessage],
        language
      });

      if (aiResponse.response) {
        const modelMessage: ChatMessage = { role: 'model', content: aiResponse.response };
        await saveJournalChatMessage(user.uid, journalDate, modelMessage);
        setMessages(prev => [...prev, modelMessage]);
      } else {
        throw new Error('Received an empty response from the assistant.');
      }
    } catch (error) {
      toast({
        title: t('toasts.error'),
        description: t('toasts.chatResponseError'),
        variant: 'destructive',
      });
      setMessages(messages); // Rollback on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'model' && (
                 <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback><BrainCircuit size={18}/></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xs rounded-lg p-3 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary'
                )}
              >
                {message.content}
              </div>
               {message.role === 'user' && (
                 <Avatar className="h-8 w-8 bg-muted text-muted-foreground">
                    <AvatarFallback><User size={18} /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
               <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback><BrainCircuit size={18}/></AvatarFallback>
                </Avatar>
              <div className="max-w-xs rounded-lg p-3 text-sm bg-secondary space-y-2">
                 <Skeleton className="h-3 w-24" />
                 <Skeleton className="h-3 w-32" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="flex gap-2 border-t pt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('journalPage.chat.placeholder')}
          disabled={isLoading}
          autoComplete="off"
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <Send />
        </Button>
      </form>
    </div>
  );
}
