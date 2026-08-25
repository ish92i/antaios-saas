import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
    setTimeout(() => videoRef.current?.play(), 50);
  };

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
                {t("landing.hero.badge", "Deadline — Dec 30, 2026 for large/medium · Jun 30, 2027 for SMEs")}
              </Badge>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="mx-auto max-w-xl text-center text-4xl font-bold tracking-tighter text-foreground md:text-5xl lg:max-w-3xl lg:text-6xl leading-[1.05]">
                {t(
                  "landing.hero.title",
                  "Your Suppliers Don't Have EUDR Data Yet. Antaios Gets It for You.",
                )}
              </h1>
            </FadeIn>

            <FadeIn delay={0.15}>
              <p className="mx-auto max-w-2xl text-center text-base leading-relaxed text-muted-foreground md:text-lg">
                {t(
                  "landing.hero.subtitle",
                  "Upload existing docs — Antaios extracts data, identifies gaps, asks your suppliers for what's missing, and generates your DDS.",
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

            <FadeIn delay={0.22} className="flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                {t("landing.hero.pill1", "Supplier portal — no account needed")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                {t("landing.hero.pill2", "PDF, Excel, images, GeoJSON → auto-extracted")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                {t("landing.hero.pill3", "Unlimited shipments, plots & suppliers")}
              </span>
            </FadeIn>
          </div>

          <FadeIn delay={0.25} y={24}>
            <div className="mx-auto max-w-5xl">
              <div className="relative overflow-hidden rounded-xl border shadow-2xl">
                <AnimatePresence>
                  {!isPlaying && (
                    <motion.button
                      type="button"
                      aria-label="Play video"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={handlePlay}
                      className="group absolute inset-0 z-10 cursor-pointer border-0 bg-transparent p-0"
                    >
                      <img
                        src="/images/hero-poster.jpg"
                        alt="Antaios demo video"
                        width={1920}
                        height={1080}
                        className="aspect-video w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex size-20 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm transition-all duration-200 group-hover:scale-110 group-hover:bg-black/50 sm:size-24">
                          <div className="flex size-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform duration-200 group-hover:scale-105 sm:size-16">
                            <Play className="ml-1 size-6 text-black sm:size-7" />
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  )}
                </AnimatePresence>
                <video
                  ref={videoRef}
                  src="/antaios-final-with-vo-v5.mp4"
                  poster="/images/hero-poster.jpg"
                  controls={isPlaying}
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full object-cover"
                >
                  <track kind="captions" />
                </video>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

export default Hero;
