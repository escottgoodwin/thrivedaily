'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../auth/auth-provider';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type SubscriptionContextType = {
  isSubscribed: boolean;
  loading: boolean;
};

export const SubscriptionContext = createContext<SubscriptionContextType>({
  isSubscribed: false,
  loading: true,
});

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    if (!user) {
      setIsSubscribed(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    const subscriptionsQuery = query(
      collection(db, 'users', user.uid, 'subscriptions'),
      where('status', 'in', ['trialing', 'active'])
    );

    const unsubscribe = onSnapshot(subscriptionsQuery, (snapshot) => {
      // In this implementation, we only care if the user has at least one active subscription.
      setIsSubscribed(!snapshot.empty);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching subscription:", error);
        setIsSubscribed(false);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  return (
    <SubscriptionContext.Provider value={{ isSubscribed, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
