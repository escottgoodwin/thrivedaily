
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth/auth-provider';
import type { Usage, UsageType } from '@/app/types';
import { getUsage } from '@/app/actions';
import { getISOWeek } from 'date-fns';

type UsageContextType = {
  usage: Usage | null;
  loading: boolean;
  canUse: (type: UsageType) => boolean;
  updateUsage: (newUsage: Usage) => void;
};

const defaultUsage: Usage = {
    concernChat: { count: 0, lastUsed: '' },
    journalAnalysis: { count: 0, lastUsedWeek: '' },
    customMeditation: { count: 0, lastUsedWeek: '' },
    customQuote: { count: 0, lastUsedWeek: '' },
};

const UsageContext = createContext<UsageContextType>({
  usage: defaultUsage,
  loading: true,
  canUse: () => true,
  updateUsage: () => {},
});

export const UsageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    if (user) {
        setLoading(true);
        const usageData = await getUsage(user.uid);
        setUsage(usageData);
        setLoading(false);
    } else if (!authLoading) {
        setUsage(null);
        setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const updateUsage = (newUsage: Usage) => {
    setUsage(newUsage);
  }

  const canUse = (type: UsageType): boolean => {
    if (!usage) return false;

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const currentWeekString = `${today.getFullYear()}-W${getISOWeek(today)}`;

    switch(type) {
        case 'concernChat':
            const concernUsage = usage.concernChat;
            return concernUsage.lastUsed !== todayString || concernUsage.count < 1;
        case 'journalAnalysis':
            const journalUsage = usage.journalAnalysis;
            return journalUsage.lastUsedWeek !== currentWeekString || journalUsage.count < 1;
        case 'customMeditation':
            const meditationUsage = usage.customMeditation;
            return meditationUsage.lastUsedWeek !== currentWeekString || meditationUsage.count < 1;
        case 'customQuote':
            const quoteUsage = usage.customQuote;
            return quoteUsage.lastUsedWeek !== currentWeekString || quoteUsage.count < 1;
        default:
            return false;
    }
  };


  return (
    <UsageContext.Provider value={{ usage, loading, canUse, updateUsage }}>
      {children}
    </UsageContext.Provider>
  );
};

export const useUsage = () => {
  const context = useContext(UsageContext);
  if (context === undefined) {
    throw new Error('useUsage must be used within a UsageProvider');
  }
  return context;
};
