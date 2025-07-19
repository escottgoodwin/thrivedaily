
"use client";

import type { RecentWin } from '@/app/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/components/i18n/language-provider';
import { format, parseISO, isToday, isYesterday, formatRelative } from 'date-fns';
import { enUS, es, fr } from 'date-fns/locale';
import { Trophy } from 'lucide-react';

interface RecentWinsProps {
  wins: RecentWin[];
}

export function RecentWins({ wins }: RecentWinsProps) {
  const { t, language } = useLanguage();

  const localeMap = {
    en: enUS,
    es: es,
    fr: fr,
  };
  
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    const relative = formatRelative(date, new Date(), { locale: localeMap[language] });
    // Capitalize the first letter of the relative date
    return relative.charAt(0).toUpperCase() + relative.slice(1);
  };

  if (wins.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Trophy className="text-primary"/>
            {t('dashboard.recentWins.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 w-full pr-4">
          <ul className="space-y-3">
            {wins.map((win) => (
              <li key={win.id} className="p-3 bg-secondary/50 rounded-lg">
                <p className="font-semibold">{win.win}</p>
                <p className="text-sm text-muted-foreground">
                  {t('dashboard.recentWins.goalPrefix')} "{win.goalText}"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(win.date)}
                </p>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
