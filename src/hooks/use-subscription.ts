"use client";

import { useSubscription as useSubscriptionFromProvider } from '@/components/subscriptions/subscription-provider';

export const useSubscription = () => {
    return useSubscriptionFromProvider();
}
