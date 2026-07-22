import { useTranslation } from "react-i18next";
import { useReducedMotion, motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import siteConfig from "~/site.config";

function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
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

const productLinks = [
  { to: "/free-tool", key: "features", label: "Fonctionnalités" },
  { to: "/free-tool", key: "diagnostic", label: "Diagnostic gratuit" },
];

const resourceLinks = [
  { to: "/resources", key: "blog", label: "Blog" },
  { to: "/resources/eudr-overview", key: "guide", label: "Guide EUDR" },
  { to: "/resources/eudr-checklist", key: "checklist", label: "Check-list" },
  { to: "/resources", key: "faq", label: "FAQ" },
];

const legalLinks = [
  { to: "/legal/notices", key: "notices", label: "Mentions légales" },
  {
    to: "/legal/privacy",
    key: "privacy",
    label: "Politique de confidentialité",
  },
  { to: "/legal/terms-of-sale", key: "termsOfSale", label: "CGV" },
  { to: "/legal/dpa", key: "dpa", label: "DPA" },
];

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t px-6 py-12 text-sm text-muted-foreground">
      <div className="mx-auto max-w-7xl">
        <FadeIn>
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Logo width={32} height={32} />
                <span className="font-semibold text-foreground">
                  {siteConfig.siteTitle}
                </span>
              </div>
              <p className="mt-3 leading-relaxed">
                {t(
                  "landing.footer.description",
                  "Conformité EUDR pour les importateurs. Plateforme de due diligence conforme au règlement européen 2023/1115.",
                )}
              </p>
              <p className="mt-6 text-xs">
                &copy; {new Date().getFullYear()} {siteConfig.siteTitle}
              </p>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-foreground">
                {t("landing.footer.product", "Produit")}
              </h3>
              <ul className="space-y-2">
                {productLinks.map((link) => (
                  <li key={link.key}>
                    <Link
                      to={link.to}
                      className="transition-colors hover:text-foreground"
                    >
                      {t(`landing.footer.links.${link.key}`, link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-foreground">
                {t("landing.footer.resources", "Ressources")}
              </h3>
              <ul className="space-y-2">
                {resourceLinks.map((link) => (
                  <li key={link.key}>
                    <Link
                      to={link.to}
                      className="transition-colors hover:text-foreground"
                    >
                      {t(`landing.footer.links.${link.key}`, link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-foreground">
                {t("landing.footer.legal", "Légal")}
              </h3>
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.key}>
                    <Link
                      to={link.to}
                      className="transition-colors hover:text-foreground"
                    >
                      {t(`landing.footer.links.${link.key}`, link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t pt-6 text-xs">
            <p>
              {t(
                "landing.footer.translationNotice",
                "Traitement des traductions via DeepL (sous-traitant)",
              )}
            </p>
            <p className="mt-1">
              {t("landing.footer.contact", "Contact")} :{" "}
              <a
                href={`mailto:${siteConfig.email}`}
                className="transition-colors hover:text-foreground"
              >
                {siteConfig.email}
              </a>
            </p>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}

export default Footer;
