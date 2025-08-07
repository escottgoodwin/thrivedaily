
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import type { ConcernAnalysisEntry } from '@/app/types';
import { getConcernAnalysisEntries, updateConcernAnalysisEntry, deleteConcernAnalysisEntry } from '@/app/actions';
import { useLanguage } from '@/components/i18n/language-provider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, Edit, Scale, SmilePlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EditConcernAnalysisDialog } from '@/components/concern-analysis/edit-concern-analysis-dialog';

export default function ConcernAnalysisPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [entries, setEntries] = useState<ConcernAnalysisEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<ConcernAnalysisEntry | null>(null);

  const loadEntries = useCallback(async () => {
    if (user) {
      setLoading(true);
      const fetchedEntries = await getConcernAnalysisEntries(user.uid);
      setEntries(fetchedEntries);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadEntries();
    }
  }, [authLoading, loadEntries]);

  const handleUpdateEntry = (updatedEntry: ConcernAnalysisEntry) => {
    setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    setEditingEntry(null);
  };
  
  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;
    const { success, error } = await deleteConcernAnalysisEntry(user.uid, entryId);
     if (success) {
      toast({ title: t('toasts.success'), description: t('concernAnalysisPage.deleteSuccess') });
      loadEntries();
    } else {
       toast({ title: t('toasts.error'), description: error, variant: "destructive" });
    }
  };

  const handleAddToAffirmations = async (entry: ConcernAnalysisEntry) => {
    if (!user) return;
    const updatedEntry = { ...entry, isAffirmation: true };
    const { success, error } = await updateConcernAnalysisEntry(user.uid, updatedEntry);
    if (success) {
      toast({ title: t('toasts.success'), description: t('concernAnalysisPage.affirmationAdded') });
      handleUpdateEntry(updatedEntry);
    } else {
       toast({ title: t('toasts.error'), description: error, variant: "destructive" });
    }
  };
  
  const renderSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );

  return (
    <>
      {editingEntry && (
        <EditConcernAnalysisDialog
          isOpen={!!editingEntry}
          onClose={() => setEditingEntry(null)}
          entry={editingEntry}
          onSave={handleUpdateEntry}
        />
      )}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-3xl">
                <Scale />
                {t('concernAnalysisPage.title')}
              </CardTitle>
              <CardDescription>{t('concernAnalysisPage.description')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading || authLoading ? renderSkeleton() : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[20%]">{t('concernAnalysisPage.limitingBeliefLabel')}</TableHead>
                    <TableHead className="w-[20%]">{t('concernAnalysisPage.falseRewardLabel')}</TableHead>
                    <TableHead className="w-[20%]">{t('concernAnalysisPage.newDecisionLabel')}</TableHead>
                    <TableHead className="w-[25%]">{t('concernAnalysisPage.evidenceLabel')}</TableHead>
                    <TableHead className="text-right w-[15%]">{t('concernAnalysisPage.actionsLabel')}</TableHead>
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
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => setEditingEntry(entry)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                           {!entry.isAffirmation && (
                            <Button variant="ghost" size="icon" onClick={() => handleAddToAffirmations(entry)}>
                              <SmilePlus className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                              {t('concernAnalysisPage.noEntries')}
                          </TableCell>
                      </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
