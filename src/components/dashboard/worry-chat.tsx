
"use client";

import { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '@/app/types';
import { chatAboutWorryAction, getWorrySuggestionAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Send, BrainCircuit, User } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';


interface WorryChatProps {
  worry: string;
}

export function WorryChat({ worry }: WorryChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getInitialSuggestion = async () => {
      setIsLoading(true);
      try {
        const result = await getWorrySuggestionAction(worry);
        if (result.suggestion) {
          setMessages([{ role: 'model', content: result.suggestion }]);
        } else {
          throw new Error('Failed to get initial suggestion.');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Could not get an initial suggestion. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (worry) {
      getInitialSuggestion();
    }
  }, [worry, toast]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
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
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatAboutWorryAction({
        worry,
        history: newMessages,
      });

      if (result.response) {
        setMessages([...newMessages, { role: 'model', content: result.response }]);
      } else {
        throw new Error('Received an empty response from the assistant.');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive',
      });
      // Optionally remove the user's message if the call fails
      setMessages(messages);
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
          placeholder="Type your message..."
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
