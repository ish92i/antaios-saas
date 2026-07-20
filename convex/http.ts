import { createDodoWebhookHandler } from "@dodopayments/convex";
import { httpRouter, type HttpAction } from "convex/server";
import { internal } from "./_generated/api";
import { planNameFromProductId } from "./dodo";
import { handleClerkWebhook } from "./clerkWebhook";

const CSP_REPORT_URI = process.env.CSP_REPORT_URI || "";

function csp(): string {
  const report = CSP_REPORT_URI ? `; report-uri ${CSP_REPORT_URI}` : "";
  return [
    "default-src 'self'",
    `script-src 'self' https://clerk.accounts.dev https://app.posthog.com 'unsafe-inline'`,
    `style-src 'self' https://clerk.accounts.dev 'unsafe-inline'`,
    `connect-src 'self' https://*.convex.cloud https://*.convex.site https://clerk.accounts.dev https://app.posthog.com wss://*.convex.cloud`,
    `img-src 'self' https://img.clerk.accounts.dev data: blob:`,
    `font-src 'self' data:`,
    `frame-src 'self' https://clerk.accounts.dev`,
    `media-src 'self' blob:`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    report,
  ]
    .filter(Boolean)
    .join("; ");
}

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": csp(),
  "Strict-Transport-Security":
    "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
};

function withSecurityHeaders(handler: HttpAction): HttpAction {
  return async (ctx, request) => {
    const response = await handler(ctx, request);
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      if (!headers.has(key)) {
        headers.set(key, value);
      }
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

const http = httpRouter();

http.route({
  path: "/webhooks/dodoWebhook",
  method: "POST",
  handler: withSecurityHeaders(createDodoWebhookHandler({
    onSubscriptionActive: async (ctx, payload) => {
      if (!payload.data.subscription_id) return
      const metadata = payload.data.metadata ?? {}
      const convexUserId = metadata.convex_user_id
      const convexOrgId = metadata.convex_org_id
      const productId = payload.data.product_id
      const planName = planNameFromProductId(productId)
      if (convexUserId) {
        await ctx.runMutation(internal.payments.storeSubscriptionFromWebhook, {
          convexUserId,
          orgId: convexOrgId,
          dodoSubscriptionId: payload.data.subscription_id,
          dodoProductId: productId,
          planName,
          email: payload.data.customer?.email || "",
        })
        const customerEmail = payload.data.customer?.email
        if (customerEmail) {
          await ctx.runAction(internal.email.subscription_email.sendSubscriptionSuccess, {
            email: customerEmail,
            subscriptionId: payload.data.subscription_id,
          })
        }
      } else {
        await ctx.runMutation(
          internal.payments.updateSubscriptionStatusFromWebhook,
          {
            dodoSubscriptionId: payload.data.subscription_id,
            status: "active",
          }
        )
      }
    },
    onPaymentSucceeded: async (ctx, payload) => {
      if (!payload.data.subscription_id) return
      await ctx.runMutation(
        internal.payments.updateSubscriptionStatusFromWebhook,
        {
          dodoSubscriptionId: payload.data.subscription_id,
          status: "active",
        }
      )
    },
    onSubscriptionPlanChanged: async (ctx, payload) => {
      if (!payload.data.subscription_id) return
      const productId = payload.data.product_id
      const planName = planNameFromProductId(productId)
      await ctx.runMutation(internal.payments.updateSubscriptionPlan, {
        dodoSubscriptionId: payload.data.subscription_id,
        dodoProductId: productId,
        planName,
      })
    },
    onSubscriptionCancelled: async (ctx, payload) => {
      if (payload.data.subscription_id) {
        await ctx.runMutation(
          internal.payments.updateSubscriptionStatusFromWebhook,
          {
            dodoSubscriptionId: payload.data.subscription_id,
            status: "canceled",
          }
        )
      }
    },
    onSubscriptionExpired: async (ctx, payload) => {
      if (payload.data.subscription_id) {
        await ctx.runMutation(
          internal.payments.updateSubscriptionStatusFromWebhook,
          {
            dodoSubscriptionId: payload.data.subscription_id,
            status: "expired",
          }
        )
      }
    },
  })),
})

http.route({
  path: "/webhooks/clerk",
  method: "POST",
  handler: withSecurityHeaders(handleClerkWebhook),
})

export default http
