/* eslint-disable react-refresh/only-export-components */
import { render } from "@react-email/render";
import { Section, Text, Button } from "@react-email/components";
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
