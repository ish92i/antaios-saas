import { cn } from "@/utils/misc";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  [key: string]: unknown | undefined;
}

export function Logo({ width, height, className, ...args }: LogoProps) {
  return (
    <img
      {...args}
      src="/images/logo.png"
      alt="Antaios — EUDR Compliance Platform"
      width={width ?? 40}
      height={height ?? 40}
      className={cn(className)}
    />
  );
}
