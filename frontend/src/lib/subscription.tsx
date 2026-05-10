'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './auth';
import { api } from './api';

export type SubscriptionInfo = {
  isActive: boolean;
  status: string;        // 'ACTIVE' | 'TRIALING' | 'CANCELED' | 'INACTIVE' | …
  plan: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  configured: boolean;   // server-side Stripe config
};

type SubscriptionCtx = SubscriptionInfo & {
  loading: boolean;
  refresh: () => Promise<void>;
};

const initial: SubscriptionInfo = {
  isActive: false,
  status: 'INACTIVE',
  plan: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  configured: false,
};

const Ctx = createContext<SubscriptionCtx | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionInfo>(initial);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setState(initial);
      setLoading(false);
      return;
    }
    try {
      const data = await api.get<SubscriptionInfo>('/billing/me');
      setState(data);
    } catch {
      setState(initial);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <Ctx.Provider value={{ ...state, loading, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSubscription(): SubscriptionCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSubscription must be used inside SubscriptionProvider');
  return ctx;
}
