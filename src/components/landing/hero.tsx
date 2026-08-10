import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import { Route as AuthLoginRoute } from "@/routes/_app/login/_layout.index";

function FadeIn({
  children,
  delay = 0,
  className,
  y = 16,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[100dvh] overflow-hidden px-6 pb-20 pt-12 md:pb-32 md:pt-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--primary)/0.06,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[length:24px_24px] [background-image:radial-gradient(circle,var(--border)/0.4_0.5px,transparent_0.5px)]" />
      <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative mx-auto">
        <div className="flex flex-col gap-5">
          <div className="relative isolate flex flex-col items-center gap-5">
            <div
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-1/2 -z-10 mx-auto size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border mask-[linear-gradient(to_top,transparent,transparent,white,white,white,transparent,transparent)] p-16 [-webkit-mask-image:linear-gradient(to_top,transparent,transparent,white,white,white,transparent,transparent)] md:size-[1300px] md:p-32"
            >
              <div className="size-full rounded-full border border-border p-16 md:p-32">
                <div className="size-full rounded-full border border-border" />
              </div>
            </div>

            <FadeIn>
              <Badge
                variant="secondary"
                className="border-amber-500/30 bg-amber-50 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-amber-700 dark:border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-300"
              >
                <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                {t("landing.hero.badge", "Deadline — Dec 30, 2026")}
              </Badge>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="mx-auto max-w-xl text-center text-4xl font-bold tracking-tighter text-foreground md:text-5xl lg:max-w-3xl lg:text-6xl leading-[1.05]">
                {t(
                  "landing.hero.title",
                  "EUDR Compliance Without the Spreadsheet Nightmare.",
                )}
              </h1>
            </FadeIn>

            <FadeIn delay={0.15}>
              <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-muted-foreground md:text-lg">
                {t(
                  "landing.hero.subtitle",
                  "Upload your documents. Antaios extracts the data, covers all 5 due-diligence criteria, and generates your DDS — in minutes.",
                )}
              </p>
            </FadeIn>

            <FadeIn delay={0.2} className="flex flex-col items-center gap-3 pt-3 pb-10">
              <Link to="/free-tool">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full gap-2 rounded-full px-8 py-4 text-base sm:w-auto"
                >
                  {t("landing.hero.cta", "Check Your EUDR Compliance — Free")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link
                to={AuthLoginRoute.fullPath}
                className="px-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("landing.hero.login", "Create your account →")}
              </Link>
            </FadeIn>
          </div>

          <FadeIn delay={0.25} y={24}>
            <HeroVideoDialog
              className="mx-auto max-w-5xl"
              animationStyle="from-center"
              videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ"
              thumbnailSrc="https://picsum.photos/seed/eudr-hero/1280/720"
              thumbnailAlt="Antaios EUDR Compliance Demo"
            />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

export default Hero;
