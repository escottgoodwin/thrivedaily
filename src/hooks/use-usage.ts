
"use client";

import { useContext } from 'react';
import type { Usage, UsageType } from '@/app/types';

interface UsageContextType {
  usage: Usage | null;
  loading: boolean;
  canUse: (type: UsageType) => boolean;
  updateUsage: (newUsage: Usage) => void;
}

// This will be provided by the actual provider component.
declare const UsageContext: React.Context<UsageContextType | undefined>;


export const useUsage = () => {
    // This hook is a placeholder. The actual implementation will be in
    // `src/components/subscriptions/usage-provider.tsx` to avoid circular dependencies
    // with components that might use this hook.
    // For now, we will return mock values.
    return { 
        usage: null, 
        loading: true,
        canUse: () => true,
        updateUsage: () => {}
    };
}
