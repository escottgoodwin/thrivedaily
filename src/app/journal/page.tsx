
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { getJournalEntry, saveJournalEntry, analyzeJournalEntryAction } from '@/app/actions';
import { useLanguage } from '@/components/i18n/language-provider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { BookText, Sparkles, Cloudy, Gift, Target } from 'lucide-react';
import type { JournalEntry } from '../types';
import { AnalysisResultDialog } from '@/components/journal/analysis-result-dialog';

type AnalysisType = 'worries' | 'gratitude' | 'goals';

export default function JournalPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entry, setEntry] = useState<Partial<JournalEntry>>({});
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [analysisType, setAnalysisType] = useState<AnalysisType | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);


  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const loadEntry = useCallback(async () => {
    if (user) {
      setLoading(true);
      const fetchedEntry = await getJournalEntry(user.uid, dateString);
      setEntry(fetchedEntry || {});
      setContent(fetchedEntry?.content || '');
      setLoading(false);
    }
  }, [user, dateString]);

  useEffect(() => {
    if (!authLoading) {
      loadEntry();
    }
  }, [authLoading, loadEntry]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    const result = await saveJournalEntry(user.uid, { date: dateString, content });
    if (result.success) {
      toast({ title: t('toasts.success'), description: t('journalPage.saveSuccess') });
    } else {
      toast({ title: t('toasts.error'), description: result.error, variant: 'destructive' });
    }
    setIsSaving(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if(date) {
        setSelectedDate(date);
    }
  };

  const handleAnalyze = async (type: AnalysisType) => {
    if (!content.trim()) {
        toast({ title: t('journalPage.analysis.emptyTitle'), description: t('journalPage.analysis.emptyDesc'), variant: 'destructive' });
        return;
    }
    setIsAnalyzing(true);
    setAnalysisType(type);
    const result = await analyzeJournalEntryAction({ content, analysisType: type, language });
    setAnalysisResult(result.items);
    setIsAnalyzing(false);
  }

  const closeDialog = () => {
      setAnalysisType(null);
      setAnalysisResult([]);
  }
  
  return (
    <>
      <AnalysisResultDialog 
        isOpen={!!analysisType}
        onClose={closeDialog}
        analysisType={analysisType}
        items={analysisResult}
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookText className="text-primary"/>
              {t('journalPage.title')}
          </h1>
          <p className="text-muted-foreground mt-2">{t('journalPage.description')}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 shadow-lg">
            <CardContent className="p-2">
              <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="w-full"
              />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 shadow-lg flex flex-col">
            <CardHeader>
              <CardTitle>{t('journalPage.entryFor')} {format(selectedDate, 'PPP')}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {loading ? (
                  <Skeleton className="h-64 w-full" />
              ) : (
                  <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={t('journalPage.placeholder')}
                      className="h-full flex-1 resize-none"
                  />
              )}
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4">
              <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving || loading}>
                      {isSaving ? t('journalPage.saving') : t('journalPage.saveButton')}
                  </Button>
              </div>
              <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />{t('journalPage.analysis.title')}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{t('journalPage.analysis.description')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Button variant="outline" onClick={() => handleAnalyze('worries')} disabled={isAnalyzing}>
                          <Cloudy className="mr-2" />{t('journalPage.analysis.analyzeWorries')}
                      </Button>
                       <Button variant="outline" onClick={() => handleAnalyze('gratitude')} disabled={isAnalyzing}>
                          <Gift className="mr-2" />{t('journalPage.analysis.analyzeGratitude')}
                      </Button>
                       <Button variant="outline" onClick={() => handleAnalyze('goals')} disabled={isAnalyzing}>
                          <Target className="mr-2" />{t('journalPage.analysis.analyzeGoals')}
                      </Button>
                  </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
