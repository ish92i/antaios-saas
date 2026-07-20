import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth, useClerk } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { RouterProvider } from "@tanstack/react-router";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip"
import "@/lib/i18n";
import { useInitializeLocale } from "@/hooks/use-initialize-locale";
import { getClerkLocale, getInitialClerkLocale } from "@/lib/clerk-locale";
import { useTranslation } from "react-i18next";
import { router } from "@/router";
import { initAnonymizedAnalytics } from "@/lib/analytics";

// Initialize analytics on module load (before consent)
initAnonymizedAnalytics();

const VITE_CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string | undefined;
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
  | string
  | undefined;

function isMissingOrPlaceholder(value: string | undefined) {
  return !value || value.includes("...");
}

const configErrors = [
  isMissingOrPlaceholder(VITE_CONVEX_URL) &&
    "Set VITE_CONVEX_URL in .env.local to your Convex deployment URL.",
  isMissingOrPlaceholder(CLERK_PUBLISHABLE_KEY) &&
    "Set VITE_CLERK_PUBLISHABLE_KEY in .env.local to your real Clerk publishable key.",
].filter(Boolean) as string[];

const convex =
  configErrors.length === 0
    ? new ConvexReactClient(VITE_CONVEX_URL as string)
    : null;

const convexQueryClient = convex ? new ConvexQueryClient(convex) : null;
const queryClient = convexQueryClient
  ? new QueryClient({
      defaultOptions: {
        queries: {
          queryKeyHashFn: convexQueryClient.hashFn(),
          queryFn: convexQueryClient.queryFn(),
        },
      },
    })
  : null;

if (convexQueryClient && queryClient) {
  convexQueryClient.connect(queryClient);
}

type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

type AppErrorBoundaryState = {
  error: Error | null;
};

class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <SetupError
          title="The app could not start"
          errors={[
            this.state.error.message ||
              "A provider failed while starting the app.",
          ]}
        />
      );
    }

    return this.props.children;
  }
}

function SetupError({
  title = "Missing app configuration",
  errors,
}: {
  title?: string;
  errors: string[];
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="w-full max-w-xl rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-card-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page is no longer blank because the startup error is being shown
          here.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-card-foreground">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  if (!convex || !queryClient) {
    return (
      <SetupError
        errors={[
          "Convex and React Query clients were not created because configuration is incomplete.",
        ]}
      />
    );
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY as string}
      localization={getInitialClerkLocale() as any}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>{children}</TooltipProvider>
        </QueryClientProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

function ClerkLocaleSync() {
  const clerk = useClerk()
  const { i18n } = useTranslation()

  React.useEffect(() => {
    const locale = getClerkLocale(i18n.language)
    ;(clerk as any).__unstable__updateProps?.({ options: { localization: locale } })
  }, [i18n.language, clerk])

  return null
}

function InnerApp() {
  useInitializeLocale()

  if (!queryClient) {
    return (
      <SetupError
        errors={[
          "React Query is unavailable because configuration is incomplete.",
        ]}
      />
    );
  }

  return (
    <>
      <ClerkLocaleSync />
      <RouterProvider router={router} context={{ queryClient }} />
    </>
  );
}

const helmetContext = {};

export default function App() {
  if (configErrors.length > 0) {
    return (
      <HelmetProvider context={helmetContext}>
        <SetupError errors={configErrors} />
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider context={helmetContext}>
      <AppErrorBoundary>
        <Providers>
          <InnerApp />
        </Providers>
      </AppErrorBoundary>
    </HelmetProvider>
  );
}
