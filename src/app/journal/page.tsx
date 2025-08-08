
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { getJournalEntry, saveJournalEntry, analyzeJournalEntryAction } from '@/app/actions';
import { useLanguage } from '@/components/i18n/language-provider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { BookText, Sparkles, Cloudy, Gift, Target, MessageCircle } from 'lucide-react';
import type { JournalEntry } from '../types';
import { AnalysisResultDialog } from '@/components/journal/analysis-result-dialog';
import { JournalChat } from '@/components/journal/journal-chat';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type AnalysisType = 'concerns' | 'gratitude' | 'goals';

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
  const [isChatOpen, setIsChatOpen] = useState(false);


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
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-[525px] h-[70vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>{t('journalPage.chat.title')}</DialogTitle>
            </DialogHeader>
            <JournalChat journalDate={dateString} journalContent={content} />
        </DialogContent>
      </Dialog>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <BookText className="text-primary"/>
                {t('journalPage.title')}
            </h1>
            <p className="text-muted-foreground mt-2">{t('journalPage.description')}</p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[280px] justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : <span>{t('goalsPage.addTask.pickDueDate')}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Sparkles className="h-5 w-5 text-primary" />{t('journalPage.analysis.title')}</CardTitle>
                <CardDescription>{t('journalPage.analysis.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    <Button variant="outline" onClick={() => handleAnalyze('concerns')} disabled={isAnalyzing || loading || !content.trim()}>
                        <Cloudy className="mr-2" />{t('journalPage.analysis.analyzeConcerns')}
                    </Button>
                    <Button variant="outline" onClick={() => handleAnalyze('gratitude')} disabled={isAnalyzing || loading || !content.trim()}>
                        <Gift className="mr-2" />{t('journalPage.analysis.analyzeGratitude')}
                    </Button>
                    <Button variant="outline" onClick={() => handleAnalyze('goals')} disabled={isAnalyzing || loading || !content.trim()}>
                        <Target className="mr-2" />{t('journalPage.analysis.analyzeGoals')}
                    </Button>
                    <Button variant="outline" onClick={() => setIsChatOpen(true)} disabled={loading || !content.trim()}>
                        <MessageCircle className="mr-2" />{t('journalPage.chat.button')}
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-lg flex flex-col min-h-[50vh]">
          <CardHeader>
            <CardTitle>{t('journalPage.entryFor')} {format(selectedDate, 'PPP')}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {loading ? (
                <Skeleton className="h-full min-h-[300px] w-full" />
            ) : (
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={t('journalPage.placeholder')}
                    className="h-full flex-1 resize-none min-h-[300px]"
                />
            )}
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving || loading}>
                    {isSaving ? t('journalPage.saving') : t('journalPage.saveButton')}
                </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
