
"use client";

import { useState } from 'react';
import type { Goal } from '@/app/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/components/i18n/language-provider';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';
import { Target } from 'lucide-react';

interface GoalReviewCardProps {
  goal: Goal;
  onUpdate: (goal: Goal) => void;
}

export function GoalReviewCard({ goal, onUpdate }: GoalReviewCardProps) {
  const { t } = useLanguage();
  const [embodiment, setEmbodiment] = useState(goal.embodiment || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    onUpdate({ ...goal, embodiment });
    setIsSaving(false);
  };
  
  const allCharacteristics = [
    ...(goal.characteristicsGeneral || []),
    ...(goal.characteristicsEmotions || []),
    ...(goal.characteristicsHabits || []),
    ...(goal.characteristicsAbilities || []),
    ...(goal.characteristicsStandards || [])
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Target/> {goal.text}</CardTitle>
        <CardDescription>{t('dailyReviewPage.goalReview.cardDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <h4 className="font-semibold text-sm mb-2">{t('dailyReviewPage.goalReview.characteristicsTitle')}</h4>
            {allCharacteristics.length > 0 ? (
                <ul className="text-sm list-disc pl-5 text-muted-foreground space-y-1">
                    {allCharacteristics.map((char, index) => <li key={index}>{char}</li>)}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">{t('dailyReviewPage.goalReview.noCharacteristics')}</p>
            )}
        </div>
        <div>
          <label htmlFor={`embodiment-${goal.id}`} className="font-semibold text-sm mb-2 block">
            {t('dailyReviewPage.goalReview.embodimentLabel')}
          </label>
          <Textarea
            id={`embodiment-${goal.id}`}
            value={embodiment}
            onChange={(e) => setEmbodiment(e.target.value)}
            placeholder={t('dailyReviewPage.goalReview.embodimentPlaceholder')}
            rows={4}
            onBlur={handleSave}
          />
        </div>
      </CardContent>
    </Card>
  );
}
