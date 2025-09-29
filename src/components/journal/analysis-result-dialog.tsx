
"use client";

import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { addJournalItemsToLists } from '@/app/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/i18n/language-provider';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/hooks/use-subscription';
import { Zap } from 'lucide-react';
import Link from 'next/link';

type AnalysisType = 'concerns' | 'gratitude' | 'goals';

interface AnalysisResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  analysisType: AnalysisType | null;
  items: string[];
}

export function AnalysisResultDialog({ isOpen, onClose, analysisType, items }: AnalysisResultDialogProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const { isSubscribed } = useSubscription();
  
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [isAdding, setIsAdding] = useState(false);

  const handleToggle = (item: string) => {
    setSelectedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };
  
  const handleAddToLists = async () => {
    if (!user || !analysisType) return;
    
    const itemsToAdd = Object.keys(selectedItems).filter(key => selectedItems[key]);
    if (itemsToAdd.length === 0) {
      toast({ title: t('journalPage.analysis.noItemsSelected'), variant: 'destructive' });
      return;
    }
    
    setIsAdding(true);
    const result = await addJournalItemsToLists(user.uid, itemsToAdd, analysisType);
    setIsAdding(false);

    if (result.success) {
      toast({ title: t('toasts.success'), description: t('journalPage.analysis.addSuccess') });
      onClose();
      router.push('/'); // Navigate to dashboard to see the new items
    } else {
      toast({ title: t('toasts.error'), description: result.error, variant: 'destructive' });
    }
  };

  const getTitle = () => {
    if (!analysisType) return '';
    const key = `journalPage.analysis.dialogTitle_${analysisType}`;
    return t(key);
  };
  
  const content = () => {
    if (!isSubscribed) {
        return (
            <div className="text-center space-y-4 py-8">
                <Zap className="mx-auto h-12 w-12 text-primary" />
                <p className="text-muted-foreground">{t('tooltips.upgrade')}</p>
                <Button asChild>
                    <Link href="/upgrade">{t('sidebar.upgrade')}</Link>
                </Button>
            </div>
        )
    }
    return (
        <>
            <ScrollArea className="h-64 border rounded-md p-4 my-4">
            {items.length > 0 ? (
                <div className="space-y-3">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                        id={`item-${index}`}
                        checked={selectedItems[item] || false}
                        onCheckedChange={() => handleToggle(item)}
                    />
                    <label htmlFor={`item-${index}`} className="text-sm font-medium leading-none">
                        {item}
                    </label>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-center text-sm text-muted-foreground py-4">
                {t('journalPage.analysis.noItemsFound')}
                </p>
            )}
            </ScrollArea>
            <DialogFooter>
            <DialogClose asChild>
                <Button variant="ghost">{t('goalsPage.addTask.cancelButton')}</Button>
            </DialogClose>
            <Button onClick={handleAddToLists} disabled={isAdding || items.length === 0}>
                {isAdding ? t('journalPage.analysis.addingButton') : t('journalPage.analysis.addButton')}
            </Button>
            </DialogFooter>
        </>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
           <DialogDescription>{t('journalPage.analysis.dialogDescription')}</DialogDescription>
        </DialogHeader>
        {content()}
      </DialogContent>
    </Dialog>
  );
}
