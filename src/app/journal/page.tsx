
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { getJournalEntry, saveJournalEntry } from '@/app/actions';
import { useLanguage } from '@/components/i18n/language-provider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { BookText } from 'lucide-react';
import type { JournalEntry } from '../types';

export default function JournalPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entry, setEntry] = useState<Partial<JournalEntry>>({});
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
  
  return (
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
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle>{t('journalPage.entryFor')} {format(selectedDate, 'PPP')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
                <Skeleton className="h-64 w-full" />
            ) : (
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={t('journalPage.placeholder')}
                    rows={15}
                    className="h-full resize-none"
                />
            )}
            <div className="flex justify-end mt-4">
                <Button onClick={handleSave} disabled={isSaving || loading}>
                    {isSaving ? t('journalPage.saving') : t('journalPage.saveButton')}
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
