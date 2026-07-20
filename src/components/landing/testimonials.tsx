import { useReducedMotion, motion } from "motion/react";

const testimonials = [
  {
    name: "Sophie Lambert",
    role: "Responsable conformité, Maison du Café",
    content:
      "On passait des semaines à assembler nos DDS. Avec Antaios, c'est fait en un après-midi. La génération TRACES est un gain de temps fou.",
  },
  {
    name: "Marc Delacroix",
    role: "Importateur bois, Delacroix & Fils",
    content:
      "L'analyse des 5 critères Article 10(2) est automatique. On sait exactement où on en est sur chaque lot, sans tableau Excel.",
  },
  {
    name: "Camille Roussel",
    role: "Directrice RSE, Groupe Horizon",
    content:
      "Le scoring risque par parcelle nous a sauvé d'un contrôle. Sans Antaios, on passait à côté du risque déforestation sur une de nos filières.",
  },
];

export function Testimonials() {
  const reduce = useReducedMotion();

  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Adopté par les importateurs
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Des entreprises qui ne pouvaient plus se passer d&apos;Antaios.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-col rounded-2xl border border-border/50 bg-card p-6 shadow-sm"
            >
              <div className="flex-1">
                <p className="leading-relaxed text-foreground/80">&ldquo;{t.content}&rdquo;</p>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-border/40 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
