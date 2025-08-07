
"use client";

import { useState } from 'react';
import type { Concern, ConcernAnalysisEntry } from '@/app/types';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '@/components/i18n/language-provider';
import { useToast } from '@/hooks/use-toast';
import { addConcernAnalysisEntry } from '@/app/actions';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';

interface ConcernAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  concern: Concern;
  onSave: (updatedConcern: Concern) => void;
}

export function ConcernAnalysisDialog({ isOpen, onClose, concern, onSave }: ConcernAnalysisDialogProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [currentAnalysis, setCurrentAnalysis] = useState<Partial<Concern>>(concern);
  const [newEvidence, setNewEvidence] = useState('');
  const [createAffirmation, setCreateAffirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleEvidenceChange = (index: number, value: string) => {
    if (!currentAnalysis.evidence) return;
    const updatedEvidence = [...currentAnalysis.evidence];
    updatedEvidence[index] = value;
    setCurrentAnalysis({ ...currentAnalysis, evidence: updatedEvidence });
  }

  const handleAddEvidence = () => {
    if (newEvidence.trim()) {
      const updatedEvidence = [...(currentAnalysis.evidence || []), newEvidence.trim()];
      setCurrentAnalysis({ ...currentAnalysis, evidence: updatedEvidence });
      setNewEvidence('');
    }
  }

  const handleRemoveEvidence = (index: number) => {
    if (!currentAnalysis.evidence) return;
    const updatedEvidence = [...currentAnalysis.evidence];
    updatedEvidence.splice(index, 1);
    setCurrentAnalysis({ ...currentAnalysis, evidence: updatedEvidence });
  }

  const handleSave = () => {
    onSave(currentAnalysis as Concern);
    toast({ title: t('toasts.success'), description: t('concernAnalysisPage.dailyAnalysis.saveSuccess') });
    onClose();
  };

  const handleSaveAndPersist = async () => {
    if (!user) return;
    
    const entryData: Omit<ConcernAnalysisEntry, 'id'> = {
      limitingBelief: currentAnalysis.text || '',
      falseReward: currentAnalysis.falseReward || '',
      newDecision: currentAnalysis.newDecision || '',
      evidence: (currentAnalysis.evidence || []).filter(e => e.trim() !== '')
    };
    
    if (!entryData.falseReward || !entryData.newDecision) {
      toast({ title: t('toasts.error'), description: "False Reward and New Decision are required to save.", variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    let result;
    if (createAffirmation) {
        result = await addConcernAnalysisEntry(user.uid, entryData);
    } else {
        // Here you might have a different action if you don't want to create an affirmation
        // For now, we use the same action.
        result = await addConcernAnalysisEntry(user.uid, entryData);
    }
    setIsSaving(false);

    if (result.success) {
      toast({ title: t('toasts.success'), description: t('concernAnalysisPage.dailyAnalysis.persistSuccess') });
      onSave(currentAnalysis as Concern);
      onClose();
    } else {
      toast({ title: t('toasts.error'), description: t('toasts.saveError'), variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('concernAnalysisPage.dailyAnalysis.title')}: {concern.text}</DialogTitle>
          <DialogDescription>{t('concernAnalysisPage.dailyAnalysis.description')}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 space-y-4 py-4 pr-4">
          <div className="space-y-2">
            <Label htmlFor="falseReward">{t('concernAnalysisPage.falseRewardLabel')}</Label>
            <Textarea id="falseReward" value={currentAnalysis.falseReward || ''} onChange={(e) => setCurrentAnalysis({ ...currentAnalysis, falseReward: e.target.value })} placeholder={t('concernAnalysisPage.falseRewardPlaceholder')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newDecision">{t('concernAnalysisPage.newDecisionLabel')}</Label>
            <Textarea id="newDecision" value={currentAnalysis.newDecision || ''} onChange={(e) => setCurrentAnalysis({ ...currentAnalysis, newDecision: e.target.value })} placeholder={t('concernAnalysisPage.newDecisionPlaceholder')} />
          </div>

          <div className="space-y-2">
            <Label>{t('concernAnalysisPage.evidenceLabel')}</Label>
            <div className="space-y-2">
              {(currentAnalysis.evidence || []).map((item, index) => (
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
                placeholder={t('concernAnalysisPage.evidencePlaceholder')}
              />
              <Button type="button" onClick={handleAddEvidence}><Plus className="mr-2" />{t('concernAnalysisPage.addEvidenceButton')}</Button>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox id="create-affirmation" checked={createAffirmation} onCheckedChange={(checked) => setCreateAffirmation(!!checked)} />
            <Label htmlFor="create-affirmation">{t('concernAnalysisPage.dailyAnalysis.createAffirmation')}</Label>
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">{t('goalsPage.addTask.cancelButton')}</Button>
          </DialogClose>
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>{t('concernAnalysisPage.dailyAnalysis.saveButton')}</Button>
          <Button onClick={handleSaveAndPersist} disabled={isSaving}>{t('concernAnalysisPage.dailyAnalysis.saveAndPersistButton')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
