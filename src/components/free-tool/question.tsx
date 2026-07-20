import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface QuestionProps {
  questionNumber: number;
  answers: Record<string, any>;
  onAnswer: (value: any) => void;
}

const commodities = [
  "coffee",
  "cocoa",
  "timber",
  "rubber",
  "soy",
  "palm_oil",
  "cattle",
] as const;

export function Question({ questionNumber, answers, onAnswer }: QuestionProps) {
  const { t } = useTranslation();

  switch (questionNumber) {
    case 1:
      return (
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">
            {t("freeTool.questions.q1.title", "Which commodities do you import?")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("freeTool.questions.q1.subtitle", "Select all that apply")}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {commodities.map((c) => {
              const selected = (answers.commodities || []).includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    const current = answers.commodities || [];
                    const next = selected
                      ? current.filter((x: string) => x !== c)
                      : [...current, c];
                    onAnswer(next);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-4 py-3 text-left text-sm transition-all",
                    selected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background hover:border-primary/50",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30",
                    )}
                  >
                    {selected && <Check className="h-3 w-3" />}
                  </div>
                  <span>{t(`freeTool.questions.q1.options.${c}`, c.charAt(0).toUpperCase() + c.slice(1).replace("_", " "))}</span>
                </button>
              );
            })}
          </div>
        </div>
      );

    case 2:
      return (
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">
            {t(
              "freeTool.questions.q2.title",
              "What is your annual revenue and headcount?",
            )}
          </h2>
          <div className="mt-2 flex flex-col gap-2">
            {(["large_medium", "small_micro"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onAnswer(opt)}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left text-sm transition-all",
                  answers.companySize === opt
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background hover:border-primary/50",
                )}
              >
                {t(
                  `freeTool.questions.q2.options.${opt}`,
                  opt === "large_medium"
                    ? "Large/medium enterprise (>€2M revenue or >10 employees)"
                    : "Small/micro enterprise (≤€2M revenue and ≤10 employees)",
                )}
              </button>
            ))}
          </div>
        </div>
      );

    case 3:
    case 4:
    case 5:
    case 6:
    case 7: {
      const qKey = `q${questionNumber}`;
      const titles: Record<number, string> = {
        3: "Do you know the geographic origin (plot-level) of your supply?",
        4: "Do you already have a documented due-diligence process?",
        5: "Do you rely on a third party (trader, cooperative) for traceability?",
        6: "Do you have supplier attestations or certificates (deforestation-free declarations) on file?",
        7: "Have you assessed legality of production under the country of origin's laws (labor, land use, environmental permits)?",
      };
      const answerKey = {
        3: "plotLevelKnown",
        4: "documentedProcess",
        5: "thirdPartyTraceability",
        6: "attestationsOnFile",
        7: "legalityAssessed",
      }[questionNumber];

      const showLongLabels = questionNumber === 6 || questionNumber === 7;

      return (
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">
            {t(`freeTool.questions.${qKey}.title`, titles[questionNumber])}
          </h2>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => onAnswer(true)}
              className={cn(
                "flex-1 rounded-lg border px-4 py-3 text-center text-sm transition-all",
                answers[answerKey] === true
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background hover:border-primary/50",
              )}
            >
              {showLongLabels
                ? t(
                    `freeTool.questions.${qKey}.yes`,
                    questionNumber === 6
                      ? "Yes — we have deforestation-free declarations"
                      : "Yes — we've assessed labor, land use, and environmental permits",
                  )
                : t("freeTool.questions.q3.yes", "Yes")}
            </button>
            <button
              type="button"
              onClick={() => onAnswer(false)}
              className={cn(
                "flex-1 rounded-lg border px-4 py-3 text-center text-sm transition-all",
                answers[answerKey] === false
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background hover:border-primary/50",
              )}
            >
              {showLongLabels
                ? t(
                    `freeTool.questions.${qKey}.no`,
                    questionNumber === 6
                      ? "No — we don't have these on file"
                      : "No — not yet assessed",
                  )
                : t("freeTool.questions.q3.no", "No")}
            </button>
          </div>
        </div>
      );
    }

    case 8:
      return (
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">
            {t(
              "freeTool.questions.q8.title",
              "Do you currently track shipments individually, or only at batch/aggregate level?",
            )}
          </h2>
          <div className="mt-2 flex flex-col gap-2">
            {(["individual", "batch"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onAnswer(opt === "individual")}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left text-sm transition-all",
                  answers.shipmentLevelTracking === (opt === "individual")
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background hover:border-primary/50",
                )}
              >
                {t(
                  `freeTool.questions.q8.options.${opt}`,
                  opt === "individual"
                    ? "Individual shipment-level tracking"
                    : "Batch or aggregate level only",
                )}
              </button>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
