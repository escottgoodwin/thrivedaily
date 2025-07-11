
"use client";

import { GuidedMeditation } from '@/components/meditation/guided-meditation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { useLanguage } from '@/components/i18n/language-provider';

export default function MeditationPage() {
  const { t } = useLanguage();
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen />
          {t('meditationPage.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <GuidedMeditation />
      </CardContent>
    </Card>
  );
}
