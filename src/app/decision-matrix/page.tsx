
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import type { DecisionMatrixEntry } from '@/app/types';
import { getDecisionMatrixEntries, addDecisionMatrixEntry, updateDecisionMatrixEntry, deleteDecisionMatrixEntry } from '@/app/actions';
import { useLanguage } from '@/components/i18n/language-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2, Edit, Scale } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DecisionMatrixPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [entries, setEntries] = useState<DecisionMatrixEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<DecisionMatrixEntry>>({});
  const [newEvidence, setNewEvidence] = useState('');

  const loadEntries = useCallback(async () => {
    if (user) {
      setLoading(true);
      const fetchedEntries = await getDecisionMatrixEntries(user.uid);
      setEntries(fetchedEntries);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadEntries();
    }
  }, [authLoading, loadEntries]);

  useEffect(() => {
    const limitingBeliefFromQuery = searchParams.get('limitingBelief');
    if (limitingBeliefFromQuery) {
      handleOpenDialog({
        limitingBelief: limitingBeliefFromQuery,
        evidence: []
      });
    }
  }, [searchParams]);

  const handleOpenDialog = (entry?: Partial<DecisionMatrixEntry>) => {
    setCurrentEntry(entry || { evidence: [], falseReward: '', newDecision: '' });
    setNewEvidence('');
    setIsDialogOpen(true);
  };
  
  const handleEvidenceChange = (index: number, value: string) => {
    if (!currentEntry.evidence) return;
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
    if (!currentEntry.evidence) return;
    const updatedEvidence = [...currentEntry.evidence];
    updatedEvidence.splice(index, 1);
    setCurrentEntry({ ...currentEntry, evidence: updatedEvidence });
  }

  const handleSaveEntry = async () => {
    if (!user) return;
    const { id, ...data } = currentEntry;
    const entryData = {
        limitingBelief: data.limitingBelief || '',
        falseReward: data.falseReward || '',
        newDecision: data.newDecision || '',
        evidence: (data.evidence || []).filter(e => e.trim() !== '')
    };

    let result;
    if (id) {
      result = await updateDecisionMatrixEntry(user.uid, { id, ...entryData });
    } else {
      result = await addDecisionMatrixEntry(user.uid, entryData);
    }

    if (result.success) {
      toast({ title: t('toasts.success'), description: t('decisionMatrixPage.saveSuccess') });
      setIsDialogOpen(false);
      loadEntries();
    } else {
      toast({ title: t('toasts.error'), description: t('toasts.saveError'), variant: 'destructive' });
    }
  };
  
  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;
    const { success, error } = await deleteDecisionMatrixEntry(user.uid, entryId);
     if (success) {
      toast({ title: t('toasts.success'), description: t('decisionMatrixPage.deleteSuccess') });
      loadEntries();
    } else {
       toast({ title: t('toasts.error'), description: error, variant: "destructive" });
    }
  }
  
  const renderSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Scale />
              {t('decisionMatrixPage.title')}
            </CardTitle>
            <CardDescription>{t('decisionMatrixPage.description')}</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2" /> {t('decisionMatrixPage.addButton')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>{currentEntry.id ? t('decisionMatrixPage.editTitle') : t('decisionMatrixPage.addTitle')}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 space-y-4 py-4 overflow-y-auto pr-4">
                <div className="space-y-2">
                  <label htmlFor="limitingBelief" className="text-sm font-medium">{t('decisionMatrixPage.limitingBeliefLabel')}</label>
                  <Textarea id="limitingBelief" value={currentEntry.limitingBelief || ''} onChange={(e) => setCurrentEntry({...currentEntry, limitingBelief: e.target.value})} placeholder={t('decisionMatrixPage.limitingBeliefPlaceholder')} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="falseReward" className="text-sm font-medium">{t('decisionMatrixPage.falseRewardLabel')}</label>
                  <Textarea id="falseReward" value={currentEntry.falseReward || ''} onChange={(e) => setCurrentEntry({...currentEntry, falseReward: e.target.value})} placeholder={t('decisionMatrixPage.falseRewardPlaceholder')} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="newDecision" className="text-sm font-medium">{t('decisionMatrixPage.newDecisionLabel')}</label>
                  <Textarea id="newDecision" value={currentEntry.newDecision || ''} onChange={(e) => setCurrentEntry({...currentEntry, newDecision: e.target.value})} placeholder={t('decisionMatrixPage.newDecisionPlaceholder')} />
                </div>
                 <div className="space-y-2">
                  <label className="text-sm font-medium">{t('decisionMatrixPage.evidenceLabel')}</label>
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
                      placeholder={t('decisionMatrixPage.evidencePlaceholder')}
                    />
                    <Button type="button" onClick={handleAddEvidence}><Plus className="mr-2"/>{t('decisionMatrixPage.addEvidenceButton')}</Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                    <Button variant="ghost">{t('goalsPage.addTask.cancelButton')}</Button>
                </DialogClose>
                <Button onClick={handleSaveEntry}>{t('decisionMatrixPage.saveButton')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading || authLoading ? renderSkeleton() : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">{t('decisionMatrixPage.limitingBeliefLabel')}</TableHead>
                  <TableHead className="w-[25%]">{t('decisionMatrixPage.falseRewardLabel')}</TableHead>
                  <TableHead className="w-[25%]">{t('decisionMatrixPage.newDecisionLabel')}</TableHead>
                  <TableHead className="w-[25%]">{t('decisionMatrixPage.evidenceLabel')}</TableHead>
                  <TableHead className="text-right">{t('decisionMatrixPage.actionsLabel')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length > 0 ? entries.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium align-top">{entry.limitingBelief}</TableCell>
                    <TableCell className="align-top">{entry.falseReward}</TableCell>
                    <TableCell className="align-top">{entry.newDecision}</TableCell>
                    <TableCell className="align-top">
                      <ul className="list-disc pl-5 space-y-1">
                        {entry.evidence.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="text-right align-top">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(entry)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                   <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            {t('decisionMatrixPage.noEntries')}
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
