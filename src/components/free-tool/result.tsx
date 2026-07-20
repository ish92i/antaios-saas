import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, XCircle, ArrowRight, RefreshCw } from "lucide-react";
import type { RiskTier, CriteriaResult } from "@/utils/free-tool-types";

interface ResultProps {
  tier: RiskTier;
  deadline: string;
  failingCriteriaCount: number;
  criteria: CriteriaResult;
  nextActions: string[];
  regulatoryCitations: Record<string, string>;
  onRestart: () => void;
}

const tierConfig: Record<RiskTier, { color: string; bg: string; label: string }> = {
  high: {
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "High Risk",
  },
  medium: {
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "Medium Risk",
  },
  low: {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "Low Risk",
  },
};

const ctaConfig: Record<
  RiskTier,
  { label: string; to: string }
> = {
  high: {
    label: "Start with Antaios — €500/month",
    to: "/login",
  },
  medium: {
    label: "See how Antaios solves this",
    to: "/",
  },
  low: {
    label: "Stay informed",
    to: "/resources",
  },
};

const criterionKeys: (keyof CriteriaResult)[] = [
  "traceability",
  "geolocation",
  "dueDiligenceDocs",
  "supplierAttestations",
  "legalityAssessment",
];

export function Result({
  tier,
  deadline,
  failingCriteriaCount,
  criteria,
  nextActions,
  regulatoryCitations,
  onRestart,
}: ResultProps) {
  const { t } = useTranslation();
  const cfg = tierConfig[tier];
  const cta = ctaConfig[tier];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {t("freeTool.result.title", "Your Compliance Snapshot")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t(
            "freeTool.result.regulation",
            "Assessed against Article 10(2), EU Regulation 2023/1115",
          )}
        </p>
      </div>

      {/* Deadline + Tier */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg font-medium">
          {t("freeTool.result.deadline", "Applicable deadline: {{date}}", {
            date: new Date(deadline).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          })}
        </p>
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
            cfg.bg,
            cfg.color,
          )}
        >
          {tier === "high" && <AlertTriangle className="h-4 w-4" />}
          {tier === "low" && <CheckCircle className="h-4 w-4" />}
          {t("freeTool.result.tier." + tier, cfg.label)}
        </div>
        <p className="text-sm text-muted-foreground">
          {t(
            `freeTool.result.tier.${tier}_desc` as any,
            {
              high: `You have ${failingCriteriaCount} critical gaps to address before your deadline`,
              medium: `You have ${failingCriteriaCount} areas to address for full compliance`,
              low: `You're in good shape — ${failingCriteriaCount} items to review`,
            }[tier],
            { count: failingCriteriaCount },
          )}
        </p>
      </div>

      {/* Criteria Breakdown */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold">Criteria breakdown</h3>
        {criterionKeys.map((key) => {
          const passed = criteria[key];
          return (
            <div
              key={key}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4",
                passed ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50",
              )}
            >
              {passed ? (
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              )}
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{t(`freeTool.result.criteria.${key}`, key)}</span>
                {!passed && regulatoryCitations[key] && (
                  <span className="text-xs text-muted-foreground">
                    {t("freeTool.result.criteria.subclause", "Required under {{citation}}", {
                      citation: regulatoryCitations[key],
                    })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Actions */}
      {nextActions.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold">
            {t("freeTool.result.actions", "Recommended next actions")}
          </h3>
          <ol className="flex flex-col gap-2">
            {nextActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {i + 1}
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 border-t pt-6">
        <Link to={cta.to}>
          <Button size="lg" className="px-8">
            {t(`freeTool.cta.${tier}`, cta.label)} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>

        <p className="text-xs text-muted-foreground">
          {t("freeTool.result.support", "Questions about your result? Email us at support@antaios.app")}
        </p>

        <button
          type="button"
          onClick={onRestart}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          {t("freeTool.result.retake", "Retake the test")}
        </button>
      </div>
    </div>
  );
}
