
"use client";

import { useState, useEffect, useRef } from 'react';
import type { ChatMessage, Goal } from '@/app/types';
import { chatAboutGoalAction, getGoalChatHistory, saveGoalChatMessage } from '@/app/actions';
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

interface GoalChatProps {
  goal: Goal;
}

export function GoalChat({ goal }: GoalChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistoryAndStart = async () => {
      if (!user || !goal) return;
      setIsLoading(true);
      try {
        const history = await getGoalChatHistory(user.uid, goal.id);
        
        if (history.length === 0) {
          const initialMessage: ChatMessage = { role: 'model', content: t('goalsPage.chat.initialMessage') };
          await saveGoalChatMessage(user.uid, goal.id, initialMessage);
          setMessages([initialMessage]);
        } else {
            setMessages(history);
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
  }, [goal, user, toast, t, language]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        setTimeout(() => {
            const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    }
  }, [messages, isResponding]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isResponding || !user) return;

    const userInput = input.trim();
    const userMessage: ChatMessage = { role: 'user', content: userInput };
    
    // Optimistically update UI
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsResponding(true);

    try {
      // Save user message
      await saveGoalChatMessage(user.uid, goal.id, userMessage);
      
      const aiResponse = await chatAboutGoalAction({
        goal: goal.text,
        history: newMessages,
        language
      });

      if (aiResponse.response) {
        const modelMessage: ChatMessage = { role: 'model', content: aiResponse.response };
        // Save AI response
        await saveGoalChatMessage(user.uid, goal.id, modelMessage);
        // Update UI with AI response
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
      // Rollback optimistic update on error
      setMessages(messages);
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
               <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback><BrainCircuit size={18}/></AvatarFallback>
                </Avatar>
              <div className="max-w-xs rounded-lg p-3 text-sm bg-secondary space-y-2">
                 <Skeleton className="h-3 w-48" />
                 <Skeleton className="h-3 w-56" />
              </div>
            </div>
          )}
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
           {isResponding && (
            <div className="flex items-start gap-3 justify-start animate-pulse">
               <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback><BrainCircuit size={18}/></AvatarFallback>
                </Avatar>
              <div className="max-w-xs rounded-lg p-3 text-sm bg-secondary space-y-2">
                 <Skeleton className="h-3 w-12" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="flex gap-2 border-t pt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('goalsPage.chat.placeholder')}
          disabled={isLoading || isResponding}
          autoComplete="off"
        />
        <Button type="submit" disabled={isLoading || isResponding || !input.trim()}>
          <Send />
        </Button>
      </form>
    </div>
  );
}

    