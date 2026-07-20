import { cn } from "@/lib/utils";

export function BlurredOrb({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute h-72 w-72 rounded-full bg-gradient-to-b from-primary/10 to-primary/5 blur-3xl",
        className,
      )}
      style={style}
    />
  );
}
