
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
  const [isSaving, setIsSaving] = useState(false);
  const [shouldCreateAffirmation, setShouldCreateAffirmation] = useState(false);

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

  const handleUpdateDailyConcern = () => {
    onSave(currentAnalysis as Concern);
    toast({ title: t('toasts.success'), description: t('concernAnalysisPage.dailyAnalysis.saveSuccess') });
    onClose();
  };

  const handleSaveToCollection = async () => {
    if (!user) return;
    
    const entryData: Omit<ConcernAnalysisEntry, 'id'> = {
      limitingBelief: currentAnalysis.text || '',
      falseReward: currentAnalysis.falseReward || '',
      newDecision: currentAnalysis.newDecision || '',
      evidence: (currentAnalysis.evidence || []).filter(e => e.trim() !== ''),
      isAffirmation: shouldCreateAffirmation,
    };
    
    if (!entryData.falseReward || !entryData.newDecision) {
      toast({ title: t('toasts.error'), description: "False Reward and New Decision are required to save.", variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const result = await addConcernAnalysisEntry(user.uid, entryData);
    setIsSaving(false);

    if (result.success) {
      toast({ title: t('toasts.success'), description: t('concernAnalysisPage.dailyAnalysis.persistSuccess') });
      onSave(currentAnalysis as Concern); // Still update the daily concern
      onClose();
    } else {
      toast({ title: t('toasts.error'), description: result.error, variant: 'destructive' });
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
            <Textarea id="falseReward" value={currentAnalysis.falseReward || ''} onChange={(e) => setCurrentAnalysis({ ...currentAnalysis, falseReward: e.target.value })} placeholder={t('concernAnalysisPage.dailyAnalysis.falseRewardPlaceholder')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newDecision">{t('concernAnalysisPage.newDecisionLabel')}</Label>
            <Textarea id="newDecision" value={currentAnalysis.newDecision || ''} onChange={(e) => setCurrentAnalysis({ ...currentAnalysis, newDecision: e.target.value })} placeholder={t('concernAnalysisPage.dailyAnalysis.newDecisionPlaceholder')} />
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
                placeholder={t('concernAnalysisPage.dailyAnalysis.evidencePlaceholder')}
              />
              <Button type="button" onClick={handleAddEvidence}><Plus className="mr-2" />{t('concernAnalysisPage.dailyAnalysis.addEvidenceButton')}</Button>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox id="create-affirmation" checked={shouldCreateAffirmation} onCheckedChange={(checked) => setShouldCreateAffirmation(!!checked)} />
            <Label htmlFor="create-affirmation">{t('concernAnalysisPage.dailyAnalysis.createAffirmation')}</Label>
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">{t('goalsPage.addTask.cancelButton')}</Button>
          </DialogClose>
          <Button variant="outline" onClick={handleUpdateDailyConcern} disabled={isSaving}>{t('concernAnalysisPage.dailyAnalysis.saveButton')}</Button>
          <Button onClick={handleSaveToCollection} disabled={isSaving}>{isSaving ? t('concernAnalysisPage.dailyAnalysis.savingButton') : t('concernAnalysisPage.dailyAnalysis.saveAndPersistButton')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
