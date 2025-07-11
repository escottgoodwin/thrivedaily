
"use client";

import { useState } from 'react';
import { useAuth } from '../auth/auth-provider';
import { addTask } from '@/app/actions';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AddTaskFormProps {
  goalId: string;
  onTaskAdded: () => void;
  onCancel: () => void;
}

export function AddTaskForm({ goalId, onTaskAdded, onCancel }: AddTaskFormProps) {
  const [taskText, setTaskText] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !taskText.trim()) return;

    setIsLoading(true);
    const { success, error } = await addTask(user.uid, goalId, taskText, dueDate?.toISOString());
    setIsLoading(false);

    if (success) {
      setTaskText('');
      setDueDate(undefined);
      onTaskAdded();
      toast({ title: 'Success', description: 'New task added to your goal.' });
    } else {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <Input
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        placeholder="e.g., Complete first draft"
        disabled={isLoading}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !dueDate && 'text-muted-foreground'
            )}
            disabled={isLoading}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dueDate ? format(dueDate, 'PPP') : <span>Pick a due date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dueDate}
            onSelect={setDueDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading || !taskText.trim()}>
          {isLoading ? 'Adding...' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
}
