
"use client";

import { useUsage as useUsageFromProvider } from '@/components/subscriptions/usage-provider';

export const useUsage = () => {
    return useUsageFromProvider();
}
