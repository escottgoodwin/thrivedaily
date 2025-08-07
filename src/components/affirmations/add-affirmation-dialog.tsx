
"use client";

import { useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '@/components/i18n/language-provider';
import { useToast } from '@/hooks/use-toast';
import { addConcernAnalysisEntry } from '@/app/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '../ui/label';

interface AddAffirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAffirmationAdded: () => void;
}

export function AddAffirmationDialog({ isOpen, onClose, onAffirmationAdded }: AddAffirmationDialogProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [affirmationText, setAffirmationText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !affirmationText.trim()) {
        toast({ title: t('toasts.error'), description: t('affirmationsPage.addDialog.emptyError'), variant: 'destructive' });
        return;
    }
    
    setIsSaving(true);
    const result = await addConcernAnalysisEntry(user.uid, {
        limitingBelief: '',
        falseReward: '',
        newDecision: affirmationText,
        evidence: [],
        isAffirmation: true,
    });
    setIsSaving(false);

    if (result.success) {
      toast({ title: t('toasts.success'), description: t('affirmationsPage.addDialog.addSuccess') });
      setAffirmationText('');
      onAffirmationAdded();
      onClose();
    } else {
      toast({ title: t('toasts.error'), description: result.error, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('affirmationsPage.addDialog.title')}</DialogTitle>
          <DialogDescription>{t('affirmationsPage.addDialog.description')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
            <Label htmlFor="affirmation-text">{t('affirmationsPage.addDialog.label')}</Label>
            <Textarea 
                id="affirmation-text" 
                value={affirmationText}
                onChange={(e) => setAffirmationText(e.target.value)}
                placeholder={t('affirmationsPage.addDialog.placeholder')}
                rows={4}
            />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={isSaving}>{t('goalsPage.addTask.cancelButton')}</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>{isSaving ? t('goalsPage.goalDetail.savingButton') : t('goalsPage.goalDetail.saveButton')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
