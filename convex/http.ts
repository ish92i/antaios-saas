import { createDodoWebhookHandler } from "@dodopayments/convex";
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { planNameFromProductId } from "./dodo";

const http = httpRouter();

http.route({
  path: "/webhooks/dodoWebhook",
  method: "POST",
  handler: createDodoWebhookHandler({
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
  }),
})

export default http
