
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { getGoal, updateGoal } from '@/app/actions';
import type { Goal } from '@/app/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/components/i18n/language-provider';
import Link from 'next/link';
import Image from 'next/image';

export default function GoalDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newExample, setNewExample] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  
  const goalId = Array.isArray(params.goalId) ? params.goalId[0] : params.goalId;

  const loadGoal = useCallback(async () => {
    if (user && goalId) {
      setLoading(true);
      const fetchedGoal = await getGoal(user.uid, goalId);
      if (fetchedGoal) {
        setGoal(fetchedGoal);
      } else {
        toast({ title: t('toasts.error'), description: t('goalsPage.goalDetail.goalNotFound'), variant: 'destructive' });
      }
      setLoading(false);
    }
  }, [user, goalId, t, toast]);

  useEffect(() => {
    if (!authLoading) {
      loadGoal();
    }
  }, [authLoading, loadGoal]);

  const handleSave = async () => {
    if (!user || !goal) return;
    setIsSaving(true);
    const { success, error } = await updateGoal(user.uid, goal);
    if (success) {
      toast({ title: t('toasts.success'), description: t('goalsPage.goalDetail.saveButton') });
    } else {
      toast({ title: t('toasts.error'), description: error, variant: 'destructive' });
    }
    setIsSaving(false);
  };
  
  const handleAddExample = () => {
    if (newExample.trim() && goal) {
      setGoal({
        ...goal,
        examples: [...(goal.examples || []), newExample.trim()],
      });
      setNewExample('');
    }
  };

  const handleRemoveExample = (index: number) => {
    if (goal) {
      const updatedExamples = [...(goal.examples || [])];
      updatedExamples.splice(index, 1);
      setGoal({ ...goal, examples: updatedExamples });
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim() && goal) {
      setGoal({
        ...goal,
        imageUrls: [...(goal.imageUrls || []), newImageUrl.trim()],
      });
      setNewImageUrl('');
    }
  };

  const handleRemoveImageUrl = (index: number) => {
    if (goal) {
      const updatedImageUrls = [...(goal.imageUrls || [])];
      updatedImageUrls.splice(index, 1);
      setGoal({ ...goal, imageUrls: updatedImageUrls });
    }
  };


  if (loading || authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
         <Card>
          <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('goalsPage.goalDetail.goalNotFound')}</h1>
        <Button asChild variant="link" className="mt-4">
          <Link href="/goals">{t('goalsPage.goalDetail.backLink')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="-ml-4">
          <Link href="/goals">
            <ArrowLeft className="mr-2" />
            {t('goalsPage.goalDetail.backLink')}
          </Link>
      </Button>

      <h1 className="text-4xl font-bold">{goal.text}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('goalsPage.goalDetail.descriptionLabel')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={goal.description || ''}
                onChange={(e) => setGoal({ ...goal, description: e.target.value })}
                placeholder={t('goalsPage.goalDetail.descriptionPlaceholder')}
                rows={5}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('goalsPage.goalDetail.examplesLabel')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {(goal.examples || []).map((example, index) => (
                  <div key={index} className="flex items-center gap-2 bg-secondary p-2 rounded-md">
                    <p className="flex-1">{example}</p>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveExample(index)} className="h-7 w-7">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder={t('goalsPage.goalDetail.examplesPlaceholder')}
                />
                <Button onClick={handleAddExample}><Plus className="mr-2"/>{t('goalsPage.goalDetail.addExample')}</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon /> {t('goalsPage.goalDetail.imageUrlsLabel')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {(goal.imageUrls || []).map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <Image src={url} alt={`Goal inspiration ${index + 1}`} layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="inspiration abstract"/>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveImageUrl(index)}
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
               <div className="flex gap-2 items-center pt-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder={t('goalsPage.goalDetail.imageUrlPlaceholder')}
                />
                <Button onClick={handleAddImageUrl} size="icon"><Plus/></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('goalsPage.goalDetail.savingButton') : t('goalsPage.goalDetail.saveButton')}
        </Button>
      </div>

    </div>
  );
}
