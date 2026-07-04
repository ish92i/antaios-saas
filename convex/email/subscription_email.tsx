"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { render } from "@react-email/render";
import { sendEmail } from "./index";
import { SubscriptionSuccessEmail, SubscriptionErrorEmail } from "./templates/subscription";

export const sendSubscriptionSuccess = internalAction({
  args: {
    email: v.string(),
    subscriptionId: v.string(),
  },
  handler: async (_, args) => {
    const html = await render(<SubscriptionSuccessEmail email={args.email} subscriptionId={args.subscriptionId} />);
    await sendEmail({
      to: args.email,
      subject: "Welcome to Antaios — Subscription Confirmed",
      html,
    });
  },
});

export const sendSubscriptionError = internalAction({
  args: {
    email: v.string(),
    subscriptionId: v.string(),
  },
  handler: async (_, args) => {
    const html = await render(<SubscriptionErrorEmail email={args.email} subscriptionId={args.subscriptionId} />);
    await sendEmail({
      to: args.email,
      subject: "Subscription Issue — Antaios",
      html,
    });
  },
});
