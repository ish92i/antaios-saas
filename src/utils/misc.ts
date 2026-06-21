import { useClerk } from "@clerk/clerk-react";
import { CURRENCIES } from "@cvx/schema";
import { useNavigate, useRouter } from "@tanstack/react-router";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function callAll<Args extends unknown[]>(
  ...fns: (((...args: Args) => unknown) | undefined)[]
) {
  return (...args: Args) => fns.forEach((fn) => fn?.(...args));
}

export function getLocaleCurrency() {
  return navigator.languages.includes("en-US")
    ? CURRENCIES.USD
    : CURRENCIES.EUR;
}

export const useSignOut = () => {
  const router = useRouter();
  const navigate = useNavigate();
  const clerk = useClerk();

  return async () => {
    await clerk.signOut();
    router.invalidate();
    navigate({ to: "/login" });
  };
};
