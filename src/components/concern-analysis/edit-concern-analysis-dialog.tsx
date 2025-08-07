
"use client";

import { useState, useEffect } from 'react';
import type { ConcernAnalysisEntry } from '@/app/types';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '@/components/i18n/language-provider';
import { useToast } from '@/hooks/use-toast';
import { updateConcernAnalysisEntry } from '@/app/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';

interface EditConcernAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entry: ConcernAnalysisEntry;
  onSave: (updatedEntry: ConcernAnalysisEntry) => void;
}

export function EditConcernAnalysisDialog({ isOpen, onClose, entry, onSave }: EditConcernAnalysisDialogProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [currentEntry, setCurrentEntry] = useState<ConcernAnalysisEntry>(entry);
  const [newEvidence, setNewEvidence] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCurrentEntry(entry);
  }, [entry]);

  const handleEvidenceChange = (index: number, value: string) => {
    const updatedEvidence = [...currentEntry.evidence];
    updatedEvidence[index] = value;
    setCurrentEntry({ ...currentEntry, evidence: updatedEvidence });
  }

  const handleAddEvidence = () => {
    if (newEvidence.trim()) {
      const updatedEvidence = [...(currentEntry.evidence || []), newEvidence.trim()];
      setCurrentEntry({ ...currentEntry, evidence: updatedEvidence });
      setNewEvidence('');
    }
  }

  const handleRemoveEvidence = (index: number) => {
    const updatedEvidence = [...currentEntry.evidence];
    updatedEvidence.splice(index, 1);
    setCurrentEntry({ ...currentEntry, evidence: updatedEvidence });
  }

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    const result = await updateConcernAnalysisEntry(user.uid, currentEntry);
    setIsSaving(false);

    if (result.success) {
      toast({ title: t('toasts.success'), description: t('concernAnalysisPage.editSuccess') });
      onSave(currentEntry);
      onClose();
    } else {
      toast({ title: t('toasts.error'), description: result.error, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('concernAnalysisPage.editDialog.title')}</DialogTitle>
          <DialogDescription>{t('concernAnalysisPage.editDialog.description')}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 space-y-4 py-4 pr-4">
          <div className="space-y-2">
            <Label htmlFor="limitingBelief">{t('concernAnalysisPage.limitingBeliefLabel')}</Label>
            <Textarea id="limitingBelief" value={currentEntry.limitingBelief} onChange={(e) => setCurrentEntry({ ...currentEntry, limitingBelief: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="falseReward">{t('concernAnalysisPage.falseRewardLabel')}</Label>
            <Textarea id="falseReward" value={currentEntry.falseReward} onChange={(e) => setCurrentEntry({ ...currentEntry, falseReward: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newDecision">{t('concernAnalysisPage.newDecisionLabel')}</Label>
            <Textarea id="newDecision" value={currentEntry.newDecision} onChange={(e) => setCurrentEntry({ ...currentEntry, newDecision: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>{t('concernAnalysisPage.evidenceLabel')}</Label>
            <div className="space-y-2">
              {(currentEntry.evidence || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={item} onChange={(e) => handleEvidenceChange(index, e.target.value)} />
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveEvidence(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Input
                value={newEvidence}
                onChange={(e) => setNewEvidence(e.target.value)}
                placeholder={t('concernAnalysisPage.dailyAnalysis.evidencePlaceholder')}
              />
              <Button type="button" onClick={handleAddEvidence}><Plus className="mr-2" />{t('concernAnalysisPage.dailyAnalysis.addEvidenceButton')}</Button>
            </div>
          </div>
        </ScrollArea>
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
