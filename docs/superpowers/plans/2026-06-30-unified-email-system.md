# Unified Email System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a single unified email system with dynamic sender address, React Email templates, and Antaios branding.

**Architecture:** One `sendEmail()` function via direct fetch to Resend API, using `RESEND_API_KEY` + dynamic `noreply@${RESEND_EMAIL}`. Three React Email templates (subscription success, subscription error, supplier notification) sharing a branded layout component.

**Tech Stack:** React Email (`@react-email/components`, `@react-email/render`), Resend API, TailwindCSS, Convex

## Global Constraints

- Brand name is "Antaios" everywhere
- Logo is `public/images/logo.png` (icon only)
- Primary color: `#4323E6` (rough equivalent of `oklch(0.488 0.243 264.376)`)
- Font: Inter (loaded via `@fontsource-variable/inter` in app, loaded via Google Fonts link in emails)
- `RESEND_EMAIL` env var contains just the domain (e.g., `antaios.fr`)
- `from` address constructed as `noreply@${RESEND_EMAIL}`
- All emails go through one `sendEmail()` function
- Keep React Email Tailwind styling pattern from the Collage examples

---

### Task 1: Shared Email Infrastructure (env, errors, sendEmail)

**Files:**
- Modify: `convex/env.ts`
- Modify: `convex/email/index.ts`
- Modify: `errors.ts`

**Interfaces:**
- Consumes: `process.env.RESEND_API_KEY`, `process.env.RESEND_EMAIL`
- Produces: `sendEmail({ to, subject, html, text? })` — sends via Resend API

- [ ] **Step 1: Update `convex/env.ts`**

```typescript
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const RESEND_EMAIL = process.env.RESEND_EMAIL;
export const SITE_URL = process.env.SITE_URL;
export const APP_URL = process.env.APP_URL;
export const DODO_PAYMENTS_API_KEY = process.env.DODO_PAYMENTS_API_KEY;
export const DODO_PAYMENTS_ENVIRONMENT = process.env.DODO_PAYMENTS_ENVIRONMENT;
export const DODO_PAYMENTS_WEBHOOK_SECRET = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
export const DIRECT_PLAN_ID = process.env.DIRECT_PLAN_ID;
export const LITELLM_BASE_URL = process.env.LITELLM_BASE_URL;
export const LITELLM_API_KEY = process.env.LITELLM_API_KEY;
export const GFW_API_KEY = process.env.GFW_API_KEY;
export const GT_API_KEY = process.env.GT_API_KEY;
```

Remove: `AUTH_RESEND_KEY`, `AUTH_EMAIL`

- [ ] **Step 2: Update `errors.ts`**

Change `AUTH_EMAIL_NOT_SENT` to `EMAIL_NOT_SENT`:

```typescript
export const ERRORS = {
  AUTH_EMAIL_NOT_SENT: "Unable to send email.",
```
→
```typescript
export const ERRORS = {
  EMAIL_NOT_SENT: "Unable to send email.",
```

- [ ] **Step 3: Rewrite `convex/email/index.ts`**

```typescript
import { RESEND_API_KEY, RESEND_EMAIL } from "@cvx/env";
import { ERRORS } from "~/errors";
import { z } from "zod";

const ResendSuccessSchema = z.object({
  id: z.string(),
});
const ResendErrorSchema = z.union([
  z.object({
    name: z.string(),
    message: z.string(),
    statusCode: z.number(),
  }),
  z.object({
    name: z.literal("UnknownError"),
    message: z.literal("Unknown Error"),
    statusCode: z.literal(500),
    cause: z.any(),
  }),
]);

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(options: SendEmailOptions) {
  if (!RESEND_API_KEY) {
    throw new Error(`Resend - ${ERRORS.ENVS_NOT_INITIALIZED}`);
  }

  const domain = RESEND_EMAIL;
  if (!domain) {
    throw new Error(`Resend EMAIL - ${ERRORS.ENVS_NOT_INITIALIZED}`);
  }

  const from = `noreply@${domain}`;
  const email = { from, ...options };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(email),
  });

  const data = await response.json();
  const parsedData = ResendSuccessSchema.safeParse(data);

  if (response.ok && parsedData.success) {
    return { status: "success", data: parsedData } as const;
  } else {
    const parsedErrorResult = ResendErrorSchema.safeParse(data);
    if (parsedErrorResult.success) {
      console.error(parsedErrorResult.data);
      throw new Error(ERRORS.EMAIL_NOT_SENT);
    } else {
      console.error(data);
      throw new Error(ERRORS.EMAIL_NOT_SENT);
    }
  }
}
```

- [ ] **Step 4: Check imports in `convex/http.ts`**

`convex/http.ts` line 5 imports from `@cvx/email/templates/subscriptionEmail` — this will change to `@cvx/email/templates/subscription` in Task 3. No change here yet.

### Task 2: Theme & Shared Layout Component

**Files:**
- Create: `convex/email/templates/antaios-theme.ts`
- Create: `convex/email/templates/components/AntaiosLayout.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `antaiosTailwindConfig` (Tailwind theme with brand tokens), `AntaiosLayout` (shared wrapper component)

- [ ] **Step 1: Create `convex/email/templates/antaios-theme.ts`**

```typescript
import type { TailwindConfig } from "@react-email/tailwind";

export const antaiosTailwindConfig = {
  theme: {
    extend: {
      colors: {
        brand: "#4323E6",
        "brand-light": "#6B4BFF",
        "bg": "#ffffff",
        "bg-2": "#f8f9fb",
        "canvas": "#f3f4f6",
        "fg": "#0f172a",
        "fg-2": "#475569",
        "fg-3": "#94a3b8",
        "fg-inverted": "#ffffff",
        "stroke": "#e2e8f0",
      },
      fontFamily: {
        inter: "'Inter', sans-serif",
        sans: "'Inter', sans-serif",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
    },
  },
} satisfies Omit<TailwindConfig, "content">;
```

- [ ] **Step 2: Create `convex/email/templates/components/AntaiosLayout.tsx`**

```tsx
import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { antaiosTailwindConfig } from "../antaios-theme";

const baseUrl = process.env.SITE_URL ?? "https://app.antaios.fr";

interface AntaiosLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export function AntaiosLayout({ previewText, children }: AntaiosLayoutProps) {
  return (
    <Tailwind config={antaiosTailwindConfig}>
      <Html>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
        </Head>
        <Body className="bg-canvas font-14 font-inter text-fg m-0 p-0">
          <Preview>{previewText}</Preview>
          <Container className="mx-auto max-w-[640px] px-4 pt-16 pb-6">
            <Section className="rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <Section className="bg-bg border-stroke rounded-[8px] border">
                <Section className="mobile:px-6! px-10 pt-10 pb-14">
                  {children}
                </Section>

                <Section className="border-stroke border-t px-10 py-16">
                  <Text className="font-13 font-inter text-fg-3 m-0 max-w-[320px]">
                    Antaios helps you manage EUDR compliance — from supplier
                    data collection to regulatory filing.
                  </Text>

                  <Row align="left">
                    <Column className="w-full pt-8 align-top">
                      <Text className="font-11 font-inter text-fg-2 m-0">
                        <Link href="https://app.antaios.fr" className="text-fg-2">
                          app.antaios.fr
                        </Link>
                      </Text>
                    </Column>
                  </Row>
                </Section>
              </Section>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
```

### Task 3: Subscription Email Templates

**Files:**
- Create: `convex/email/templates/subscription.tsx`
- Delete: `convex/email/templates/subscriptionEmail.tsx`

**Interfaces:**
- Consumes: `AntaiosLayout` from Task 2, `sendEmail` from Task 1
- Produces: `sendSubscriptionSuccessEmail({ email, subscriptionId })`, `sendSubscriptionErrorEmail({ email, subscriptionId })`

- [ ] **Step 1: Create `convex/email/templates/subscription.tsx`**

```tsx
import { render } from "@react-email/render";
import { Section, Text, Link, Button } from "@react-email/components";
import { sendEmail } from "@cvx/email";
import { AntaiosLayout } from "./components/AntaiosLayout";

type SubscriptionEmailOptions = {
  email: string;
  subscriptionId: string;
};

export function SubscriptionSuccessEmail({ email }: SubscriptionEmailOptions) {
  return (
    <AntaiosLayout previewText="Subscription confirmed — welcome to Antaios">
      <Section align="left" className="w-full max-w-[480px] text-left">
        <Text className="text-32 text-fg m-0 font-sans font-semibold">
          Subscription confirmed
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-5">
          Hello {email}!
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-3">
          Your subscription to Antaios has been successfully activated.
          You now have full access to EUDR compliance tools —
          from supplier data collection to regulatory filing.
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-3">
          Get started by setting up your workspace and inviting your team.
        </Text>
      </Section>

      <Section align="left" className="mt-8">
        <Button
          href="https://app.antaios.fr"
          className="bg-brand text-14 font-inter text-fg-inverted inline-block rounded-md border-none px-5 py-3 text-center"
        >
          Open Antaios
        </Button>
      </Section>

      <Section align="left" className="mt-10">
        <Text className="text-14 font-inter text-fg-2 m-0">
          Questions? Reply to this email — we&apos;re happy to help.
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-3">
          — The Antaios team
        </Text>
      </Section>
    </AntaiosLayout>
  );
}

export function SubscriptionErrorEmail({ email }: SubscriptionEmailOptions) {
  return (
    <AntaiosLayout previewText="Subscription issue — Antaios">
      <Section align="left" className="w-full max-w-[480px] text-left">
        <Text className="text-32 text-fg m-0 font-sans font-semibold">
          Subscription issue
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-5">
          Hello {email}.
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-3">
          We were unable to process your subscription to Antaios.
          Don&apos;t worry — you haven&apos;t been charged.
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-3">
          Please try again or contact us for assistance.
        </Text>
      </Section>

      <Section align="left" className="mt-10">
        <Text className="text-14 font-inter text-fg-2 m-0">
          — The Antaios team
        </Text>
      </Section>
    </AntaiosLayout>
  );
}

export async function renderSubscriptionSuccessEmail(args: SubscriptionEmailOptions) {
  return await render(<SubscriptionSuccessEmail {...args} />);
}

export async function renderSubscriptionErrorEmail(args: SubscriptionEmailOptions) {
  return await render(<SubscriptionErrorEmail {...args} />);
}

export async function sendSubscriptionSuccessEmail({
  email,
  subscriptionId,
}: SubscriptionEmailOptions) {
  const html = await renderSubscriptionSuccessEmail({ email, subscriptionId });
  await sendEmail({
    to: email,
    subject: "Welcome to Antaios — Subscription Confirmed",
    html,
  });
}

export async function sendSubscriptionErrorEmail({
  email,
  subscriptionId,
}: SubscriptionEmailOptions) {
  const html = await renderSubscriptionErrorEmail({ email, subscriptionId });
  await sendEmail({
    to: email,
    subject: "Subscription Issue — Antaios",
    html,
  });
}
```

- [ ] **Step 2: Update `convex/http.ts` import**

Change line 5:
```typescript
import { sendSubscriptionSuccessEmail } from "@cvx/email/templates/subscriptionEmail";
```
to:
```typescript
import { sendSubscriptionSuccessEmail } from "@cvx/email/templates/subscription";
```

- [ ] **Step 3: Delete old file**

`git rm convex/email/templates/subscriptionEmail.tsx`

### Task 4: Supplier Email Template & Action Update

**Files:**
- Create: `convex/email/templates/supplier.tsx`
- Modify: `convex/supplier_email.ts`

**Interfaces:**
- Consumes: `AntaiosLayout` from Task 2, `sendEmail` from Task 1
- Produces: `renderSupplierEmail({ supplierLink })` — returns HTML string
- Updates: `sendSupplierEmail` action to use new template

- [ ] **Step 1: Create `convex/email/templates/supplier.tsx`**

```tsx
import { render } from "@react-email/render";
import { Section, Text, Link, Button } from "@react-email/components";
import { AntaiosLayout } from "./components/AntaiosLayout";

type SupplierEmailOptions = {
  supplierLink: string;
};

export function SupplierNotificationEmail({ supplierLink }: SupplierEmailOptions) {
  return (
    <AntaiosLayout previewText="Informations complémentaires requises">
      <Section align="left" className="w-full max-w-[480px] text-left">
        <Text className="text-24 text-fg m-0 font-sans font-semibold">
          Informations complémentaires requises
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-5">
          Bonjour,
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-3">
          Un opérateur vous demande de fournir des informations
          complémentaires pour compléter un dossier de conformité EUDR.
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-3">
          Veuillez cliquer sur le bouton ci-dessous pour fournir les
          informations demandées :
        </Text>
      </Section>

      <Section align="left" className="mt-8">
        <Button
          href={supplierLink}
          className="bg-brand text-14 font-inter text-fg-inverted inline-block rounded-md border-none px-5 py-3 text-center"
        >
          Fournir les informations
        </Button>
      </Section>

      <Section align="left" className="mt-10">
        <Text className="text-14 font-inter text-fg-2 m-0">
          Ou copiez ce lien dans votre navigateur :
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-2 break-all">
          <Link href={supplierLink} className="text-brand">
            {supplierLink}
          </Link>
        </Text>
      </Section>

      <Section align="left" className="mt-8">
        <Text className="text-14 font-inter text-fg-2 m-0">
          Merci de votre collaboration.
        </Text>
        <Text className="text-14 font-inter text-fg-2 m-0 mt-3">
          L&apos;équipe Antaios
        </Text>
      </Section>
    </AntaiosLayout>
  );
}

export async function renderSupplierEmail(args: SupplierEmailOptions) {
  return await render(<SupplierNotificationEmail {...args} />);
}
```

- [ ] **Step 2: Update `convex/supplier_email.ts`**

```typescript
import { action } from "@cvx/_generated/server"
import { v } from "convex/values"
import { internal } from "@cvx/_generated/api"
import { translateText } from "@cvx/lib/translate"
import { sendEmail } from "@cvx/email"
import { renderSupplierEmail } from "@cvx/email/templates/supplier"

export const sendSupplierEmail = action({
  args: {
    shipmentId: v.id("shipments"),
    supplierLanguage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const shipment = await ctx.runQuery(internal.shipments.getShipmentById, {
      shipmentId: args.shipmentId,
    })
    if (!shipment) throw new Error("Shipment not found")
    if (!shipment.supplierEmail) throw new Error("No supplier email")
    if (!shipment.supplierToken) throw new Error("No supplier token")

    const targetLang = args.supplierLanguage ?? shipment.supplierLanguage ?? "fr"
    const supplierLink = `https://app.antaios.fr/supplier/${shipment.supplierToken}`

    const html = await renderSupplierEmail({ supplierLink })
    const translatedHtml = await translateText(html, targetLang, "fr", "html")
    const subject = await translateText(
      "Informations complémentaires requises pour votre envoi",
      targetLang,
    )

    await sendEmail({
      to: shipment.supplierEmail,
      subject,
      html: translatedHtml,
    })

    await ctx.runMutation(internal.audit.insertAuditLog, {
      shipmentId: args.shipmentId,
      orgId: shipment.orgId,
      actor: "system",
      eventType: "supplier_email_sent",
      payload: { email: shipment.supplierEmail, token: shipment.supplierToken, language: targetLang },
    })
  },
})
```

### Task 5: Cleanup & Verification

**Files:**
- Modify: `docs/superpowers/plans/2026-06-30-unified-email-system.md` (this file — mark tasks done)
- Maybe: `docs/README.md` — update Resend setup instructions

- [ ] **Step 1: Remove `@convex-dev/resend` from `convex/convex.config.ts` if no longer used**

Check if anything else uses `@convex-dev/resend`. If the supplier email was the only consumer, remove it.

- [ ] **Step 2: Update `docs/README.md`**

Update the "Email" section to document `RESEND_API_KEY` and `RESEND_EMAIL` instead of `AUTH_RESEND_KEY`.

- [ ] **Step 3: Verify all imports compile**

Run `npx convex dev` or the project's typecheck to confirm no broken imports.
