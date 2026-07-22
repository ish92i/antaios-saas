import { useRef, useEffect } from "react";
import { useInView, animate, useReducedMotion, motion } from "motion/react";

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    const node = ref.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration: 2.5,
      ease: "easeOut",
      onUpdate(latest) {
        node.textContent = Math.floor(latest).toString() + suffix;
      },
    });

    return () => controls.stop();
  }, [isInView, value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

const stats = [
  { value: 5, suffix: "", label: "Critères Article 10(2)" },
  { value: 100, suffix: "%", label: "Conformité couverte" },
  { value: 2, suffix: " min", label: "Diagnostic gratuit" },
];

export function Stats() {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="px-6 py-16 md:py-20"
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center px-6 py-10 text-center md:py-8"
            >
              <span className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="mt-2 text-sm text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default Stats;
