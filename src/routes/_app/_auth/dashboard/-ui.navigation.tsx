import { CreditCard, Slash } from "lucide-react";

import { OrganizationSwitcher, UserButton } from "@clerk/clerk-react";
import { Logo } from "@/components/logo";
import { Link } from "@tanstack/react-router";
import { Route as BillingSettingsRoute } from "@/routes/_app/_auth/dashboard/_layout.settings.billing";
import { User } from "~/types";

export function Navigation({ user }: { user: User }) {
  if (!user) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 flex w-full flex-col border-b border-border bg-card px-6">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-3">
        <div className="flex h-10 items-center gap-2">
          <Link
            to="/dashboard"
            className="flex h-10 items-center gap-1"
          >
            <Logo width={36} height={36} />
          </Link>
          <div className="flex items-center gap-2">
            <Slash className="h-6 w-6 -rotate-12 stroke-[1.5px] text-primary/10" />
            <OrganizationSwitcher
            appearance={{
              elements: {
                rootBox: "flex items-center",
                organizationSwitcherTrigger:
                  "gap-1 !pl-1.5 !pr-3 !py-1.5 rounded-md hover:bg-primary/5 text-primary/80 font-medium",
                organizationPreview: "!gap-2",
                organizationPreviewAvatarContainer: "!h-8 !w-8",
                organizationPreviewAvatarBox: "!h-8 !w-8",
                organizationPreviewTextContainer: "",
                organizationPreviewMainIdentifier: "!text-sm hidden sm:!block",
                organizationSwitcherTriggerIcon: "text-primary/60 !h-5 !w-5",
              },
            }}
          />
          </div>
        </div>

        <div className="flex h-10 items-center gap-3">
          <Link
            to={BillingSettingsRoute.fullPath}
            className="flex h-10 w-10 items-center justify-center rounded-md text-primary/60 hover:bg-primary/5 hover:text-primary"
            title="Billing"
          >
            <CreditCard className="h-5 w-5 stroke-[1.5px]" />
          </Link>
          <UserButton
            afterSignOutUrl="/login"
            appearance={{
              elements: {
                userButtonAvatarBox: "!h-11 !w-11",
                userButtonTrigger: "focus:shadow-none",
              },
            }}
          />
        </div>
      </div>
    </nav>
  );
}
