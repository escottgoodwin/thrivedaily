
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useLanguage } from '@/components/i18n/language-provider';
import { useToast } from '@/hooks/use-toast';
import { addRevisionEntry, getRevisionEntries, getRevisionSuggestionAction } from '@/app/actions';
import type { RevisionEntry } from '@/app/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { History, MessageCircle, Sparkles, Plus, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { enUS, es, fr } from 'date-fns/locale';
import { RevisionChat } from '@/components/revision/revision-chat';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function RevisionPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [entries, setEntries] = useState<RevisionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [situation, setSituation] = useState('');
  const [revision, setRevision] = useState('');
  const [amends, setAmends] = useState<string[]>([]);
  const [newAmend, setNewAmend] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingSuggestion, setIsGettingSuggestion] = useState(false);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentChatEntry, setCurrentChatEntry] = useState<RevisionEntry | null>(null);

  const localeMap = {
    en: enUS,
    es: es,
    fr: fr,
  };

  const loadEntries = useCallback(async () => {
    if (user) {
      setLoading(true);
      const fetchedEntries = await getRevisionEntries(user.uid);
      setEntries(fetchedEntries);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadEntries();
    }
  }, [authLoading, loadEntries]);

  const handleSave = async () => {
    if (!user || !situation.trim() || !revision.trim()) {
      toast({ title: t('toasts.error'), description: 'Please fill out both the situation and your revision.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const result = await addRevisionEntry(user.uid, { situation, revision, amends });
    setIsSaving(false);

    if (result.success && result.entry) {
      toast({ title: t('toasts.success'), description: 'Your revision has been saved.' });
      setEntries(prev => [result.entry!, ...prev]);
      setSituation('');
      setRevision('');
      setAmends([]);
    } else {
      toast({ title: t('toasts.error'), description: result.error, variant: 'destructive' });
    }
  };
  
  const handleGetSuggestion = async () => {
    if (!user || !situation.trim()) {
      toast({ title: t('toasts.error'), description: 'Please describe the situation first.', variant: 'destructive' });
      return;
    }
    setIsGettingSuggestion(true);
    const result = await getRevisionSuggestionAction({ userId: user.uid, situation, language });
    if(result.suggestion) {
        setRevision(result.suggestion);
    } else {
        toast({ title: t('toasts.error'), description: 'Could not get a suggestion at this time.', variant: 'destructive' });
    }
    setIsGettingSuggestion(false);
  };
  
  const handleOpenChat = (entry: RevisionEntry | { situation: string, revision: string }) => {
      if ('id' in entry) {
          setCurrentChatEntry(entry);
      } else {
          // Create a temporary entry for chat
          setCurrentChatEntry({id: 'new', createdAt: new Date().toISOString(), ...entry});
      }
      setIsChatOpen(true);
  }

  const handleAddAmend = () => {
    if (newAmend.trim()) {
      setAmends([...amends, newAmend.trim()]);
      setNewAmend('');
    }
  };

  const handleRemoveAmend = (indexToRemove: number) => {
    setAmends(amends.filter((_, index) => index !== indexToRemove));
  };


  const renderSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );

  return (
    <>
    <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-[525px] h-[70vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>{t('revisionPage.chat.title')}</DialogTitle>
            </DialogHeader>
            {currentChatEntry && <RevisionChat entry={currentChatEntry} />}
        </DialogContent>
    </Dialog>

    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <History className="text-primary" />
          {t('revisionPage.title')}
        </h1>
        <p className="text-muted-foreground mt-2">{t('revisionPage.description')}</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('revisionPage.newRevisionTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="situation" className="font-medium">{t('revisionPage.situationLabel')}</label>
            <Textarea
              id="situation"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder={t('revisionPage.situationPlaceholder')}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="revision" className="font-medium">{t('revisionPage.revisionLabel')}</label>
            <Textarea
              id="revision"
              value={revision}
              onChange={(e) => setRevision(e.target.value)}
              placeholder={t('revisionPage.revisionPlaceholder')}
              rows={6}
            />
          </div>
           <div className="space-y-2">
            <label htmlFor="amends" className="font-medium">How can you make things right?</label>
             <div className="space-y-2">
                {amends.map((amend, index) => (
                  <div key={index} className="flex items-center gap-2 bg-secondary p-2 rounded-md">
                    <p className="flex-1">{amend}</p>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveAmend(index)} className="h-7 w-7">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            <div className="flex gap-2">
                <Input
                  id="amends"
                  value={newAmend}
                  onChange={(e) => setNewAmend(e.target.value)}
                  placeholder="e.g., 'Apologize to the person I hurt'"
                />
                <Button onClick={handleAddAmend}><Plus className="mr-2"/>Add</Button>
              </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className='flex gap-2'>
                <Button variant="outline" onClick={handleGetSuggestion} disabled={isGettingSuggestion || !situation.trim()}>
                    <Sparkles className="mr-2"/>
                    {isGettingSuggestion ? t('revisionPage.gettingSuggestion') : t('revisionPage.getSuggestion')}
                </Button>
                 <Button variant="outline" onClick={() => handleOpenChat({situation, revision})} disabled={!situation.trim()}>
                    <MessageCircle className="mr-2"/>
                    {t('revisionPage.chatWithAI')}
                </Button>
            </div>
          <Button onClick={handleSave} disabled={isSaving || !situation.trim() || !revision.trim()}>
            {isSaving ? t('revisionPage.saving') : t('revisionPage.saveButton')}
          </Button>
        </CardFooter>
      </Card>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">{t('revisionPage.pastRevisionsTitle')}</h2>
        {loading || authLoading ? renderSkeleton() : (
            entries.length > 0 ? (
                 <div className="space-y-4">
                    {entries.map(entry => (
                        <Card key={entry.id}>
                            <CardHeader>
                                <CardDescription>
                                    {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true, locale: localeMap[language] })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-muted-foreground">{t('revisionPage.situationLabel')}</h4>
                                    <p>{entry.situation}</p>
                                </div>
                                 <div>
                                    <h4 className="font-semibold text-muted-foreground">{t('revisionPage.revisionLabel')}</h4>
                                    <p className="whitespace-pre-wrap">{entry.revision}</p>
                                </div>
                                {entry.amends && entry.amends.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-muted-foreground">Steps to make it right:</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                      {entry.amends.map((item, index) => (
                                        <li key={index}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                            </CardContent>
                             <CardFooter>
                                <Button variant="ghost" onClick={() => handleOpenChat(entry)}>
                                    <MessageCircle className="mr-2"/>
                                    {t('revisionPage.chatWithAI')}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                 </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">{t('revisionPage.noRevisions')}</h3>
                    <p className="text-muted-foreground mt-2">{t('revisionPage.noRevisionsDesc')}</p>
                </div>
            )
        )}
      </div>

    </div>
    </>
  );
}
