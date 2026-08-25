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
      src="/images/logo.webp"
      srcSet="/images/logo-80.webp 1x, /images/logo-160.webp 2x"
      alt="Antaios — EUDR Compliance Platform"
      width={width ?? 40}
      height={height ?? 40}
      loading="lazy"
      className={cn(className)}
    />
  );
}
