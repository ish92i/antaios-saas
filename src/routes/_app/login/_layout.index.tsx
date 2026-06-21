import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/clerk-react";

export const Route = createFileRoute("/_app/login/_layout/")({
  component: Login,
});

function Login() {
  return (
    <div className="mx-auto flex h-full w-full max-w-96 flex-col items-center justify-center gap-6">
      <div className="mb-2 flex flex-col gap-2">
        <h3 className="text-center text-2xl font-medium text-primary">
          Sign in to Antaios
        </h3>
        <p className="text-center text-base font-normal text-primary/60">
          Welcome back! Please sign in to continue.
        </p>
      </div>
      <SignIn
        routing="hash"
        signUpUrl="/login"
        forceRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none bg-transparent w-full p-0",
            header: "hidden",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton:
              "w-full border border-border bg-transparent text-primary/80 hover:bg-primary/5",
            dividerRow: "my-4",
            dividerText: "text-xs font-medium uppercase text-primary/60",
            formFieldLabel: "text-sm text-primary/60",
            formFieldInput:
              "bg-transparent border-border text-primary placeholder:text-primary/40",
            formButtonPrimary:
              "inline-flex items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 h-10 px-4 py-2 w-full",
            footerActionLink: "text-primary underline",
            footer: "hidden",
          },
        }}
      />
      <p className="px-12 text-center text-sm font-normal leading-normal text-primary/60">
        By clicking continue, you agree to our{" "}
        <a className="underline hover:text-primary">Terms of Service</a> and{" "}
        <a className="underline hover:text-primary">Privacy Policy.</a>
      </p>
    </div>
  );
}
