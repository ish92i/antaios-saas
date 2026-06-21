import { DodoPayments } from "@dodopayments/convex";
import { components } from "./_generated/api";
import { DODO_PAYMENTS_API_KEY, DODO_PAYMENTS_ENVIRONMENT, DIRECT_PLAN_ID } from "@cvx/env";

export const dodo = new DodoPayments(components.dodopayments, {
  identify: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return { dodoCustomerId: identity.subject };
  },
  apiKey: DODO_PAYMENTS_API_KEY!,
  environment: DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode",
});

export const { checkout, customerPortal } = dodo.api();

export const planNameFromProductId = (productId: string): string => {
  if (productId === DIRECT_PLAN_ID) return "Direct";
  return "Inconnu";
};
