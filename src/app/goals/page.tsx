
"use client";

import { GoalManager } from '@/components/goals/goal-manager';
import { useLanguage } from '@/components/i18n/language-provider';

export default function GoalsPage() {
  const { t } = useLanguage();
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('goalsPage.title')}</h1>
      <p className="text-muted-foreground mb-8">
        {t('goalsPage.description')}
      </p>
      <GoalManager />
    </div>
  );
}
