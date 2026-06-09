import { api } from './instance';

export type SubscriptionPlan = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface ActivateSubscriptionResponse {
  subscriptionTier: 'free' | 'premium';
  subscriptionExpiresAt: string;
}

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  weekly: '7 дней',
  monthly: '30 дней',
  quarterly: '90 дней',
  yearly: '365 дней',
};

export class subscriptionService {
  static async activate(plan: SubscriptionPlan): Promise<ActivateSubscriptionResponse> {
    const response = await api.post<{
      ok: boolean;
      data: { subscription_tier: 'free' | 'premium'; subscription_expires_at: string };
    }>('/subscriptions', { plan });
    return {
      subscriptionTier: response.data.data.subscription_tier,
      subscriptionExpiresAt: response.data.data.subscription_expires_at,
    };
  }
}
