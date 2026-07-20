import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST =
  import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";

let isInitialized = false;
let isFullMode = false;

export function initAnonymizedAnalytics(): void {
  if (!POSTHOG_KEY) return;
  if (isInitialized) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    loaded: (ph) => {
      ph.opt_out_capturing();
      ph.set_config({ disable_session_recording: true });
    },
    autocapture: false,
    capture_pageview: false,
    persistence: "memory",
  });

  isInitialized = true;
  isFullMode = false;
}

export function upgradeToFullAnalytics(distinctId?: string): void {
  if (!POSTHOG_KEY || !isInitialized) {
    initFullAnalytics(distinctId);
    return;
  }

  posthog.opt_in_capturing();
  posthog.set_config({ disable_session_recording: false });
  posthog.register({ consent_given: true });

  if (distinctId) {
    posthog.identify(distinctId);
  }

  isFullMode = true;
}

function initFullAnalytics(distinctId?: string): void {
  if (!POSTHOG_KEY) return;
  if (isInitialized && isFullMode) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: true,
    capture_pageview: true,
    persistence: "localStorage",
  });

  if (distinctId) {
    posthog.identify(distinctId);
  }

  posthog.register({ consent_given: true });
  isInitialized = true;
  isFullMode = true;
}

export function trackEvent(
  event: string,
  properties?: Record<string, any>
): void {
  if (!isInitialized || !POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

export function capturePageview(): void {
  if (!isInitialized || !POSTHOG_KEY) return;
  if (!isFullMode) {
    posthog.capture("$pageview", { $set: { anonymized: true } });
  }
}

export function resetAnalytics(): void {
  if (!isInitialized) return;
  posthog.reset();
}
