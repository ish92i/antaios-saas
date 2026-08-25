import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./index.css";
import App from "@/app";

const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || "development",
    enabled: !!import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};

if (typeof requestIdleCallback === "function") {
  requestIdleCallback(initSentry);
} else {
  setTimeout(initSentry, 0);
}

// Render the app
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
