import { createFileRoute, Link } from "@tanstack/react-router";
import { useReducer, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Progress } from "@/components/free-tool/progress";
import { Question } from "@/components/free-tool/question";
import { Result } from "@/components/free-tool/result";
import {
  scoreCriteria,
  assignTier,
} from "@/utils/free-tool-scoring";
import type { FreeToolAnswers, TierResult } from "@/utils/free-tool-types";

interface State {
  currentQuestion: number;
  answers: FreeToolAnswers;
  result: TierResult | null;
}

const initialAnswers: FreeToolAnswers = {
  commodities: [],
  companySize: "large_medium",
  plotLevelKnown: false,
  documentedProcess: false,
  thirdPartyTraceability: false,
  attestationsOnFile: false,
  legalityAssessed: false,
  shipmentLevelTracking: false,
};

type Action =
  | { type: "ANSWER"; payload: { key: keyof FreeToolAnswers; value: any } }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "COMPLETE"; payload: TierResult }
  | { type: "RESTART" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.payload.key]: action.payload.value },
      };
    case "NEXT":
      return {
        ...state,
        currentQuestion: Math.min(state.currentQuestion + 1, 8),
      };
    case "BACK":
      return {
        ...state,
        currentQuestion: Math.max(state.currentQuestion - 1, 1),
      };
    case "COMPLETE":
      return { ...state, result: action.payload };
    case "RESTART":
      return { currentQuestion: 1, answers: initialAnswers, result: null };
    default:
      return state;
  }
}

export const Route = createFileRoute("/free-tool")({
  component: FreeToolPage,
  beforeLoad: () => ({ title: "EUDR Compliance Diagnostic — Antaios" }),
});

function FreeToolPage() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, {
    currentQuestion: 1,
    answers: initialAnswers,
    result: null,
  });

  const handleAnswer = useCallback(
    (key: keyof FreeToolAnswers, value: any) => {
      dispatch({ type: "ANSWER", payload: { key, value } });
    },
    [],
  );

  const handleNext = useCallback(() => {
    if (state.currentQuestion === 8) {
      const criteria = scoreCriteria(state.answers);
      const tierResult = assignTier(criteria, state.answers.companySize);
      dispatch({ type: "COMPLETE", payload: tierResult });
      try {
        localStorage.setItem("antaios:free-tool-result", JSON.stringify(tierResult));
        localStorage.setItem("antaios:free-tool-tier", tierResult.tier);
      } catch {}
    } else {
      dispatch({ type: "NEXT" });
    }
  }, [state.currentQuestion, state.answers]);

  const handleBack = useCallback(() => {
    dispatch({ type: "BACK" });
  }, []);

  const handleRestart = useCallback(() => {
    dispatch({ type: "RESTART" });
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!state.result && state.currentQuestion > 1) {
        try {
          localStorage.setItem(
            "antaios:free-tool-abandoned",
            String(state.currentQuestion),
          );
        } catch {}
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state.result, state.currentQuestion]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "antaios:free-tool-state",
        JSON.stringify({ question: state.currentQuestion }),
      );
    } catch {}
  }, [state.currentQuestion]);

  if (state.result) {
    return (
      <>
        <Helmet>
          <meta name="description" content="Free EUDR compliance diagnostic for importers. 8 questions covering Article 10(2) due-diligence criteria. Assess your readiness against the EU Deforestation Regulation in 2 minutes — no email required." />
          <meta property="og:description" content="Free EUDR compliance diagnostic for importers. 8 questions covering Article 10(2) due-diligence criteria. Assess your readiness against the EU Deforestation Regulation in 2 minutes — no email required." />
          <meta property="og:url" content="https://antaios.app/free-tool" />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://antaios.app" },
                { "@type": "ListItem", "position": 2, "name": "EUDR Compliance Diagnostic", "item": "https://antaios.app/free-tool" }
              ]
            })}
          </script>
        </Helmet>
        <div className="mx-auto min-h-screen max-w-screen-lg px-6 py-8">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2">
              <Logo />
            </Link>
          </div>
          <Result
            tier={state.result.tier}
            deadline={state.result.deadline}
            failingCriteriaCount={state.result.failingCriteriaCount}
            criteria={state.result.criteria}
            nextActions={state.result.nextActions}
            regulatoryCitations={state.result.regulatoryCitations}
            onRestart={handleRestart}
          />
        </div>
      </>
    );
  }

  const canAdvance = (() => {
    switch (state.currentQuestion) {
      case 1:
        return state.answers.commodities.length > 0;
      case 2:
        return true;
      default:
        return true;
    }
  })();

  const answerKeyMap: Record<number, keyof FreeToolAnswers> = {
    3: "plotLevelKnown",
    4: "documentedProcess",
    5: "thirdPartyTraceability",
    6: "attestationsOnFile",
    7: "legalityAssessed",
  };

  return (
    <>
      <Helmet>
        <meta name="description" content="Free EUDR compliance diagnostic for importers. 8 questions covering Article 10(2) due-diligence criteria. Assess your readiness against the EU Deforestation Regulation in 2 minutes — no email required." />
        <meta property="og:description" content="Free EUDR compliance diagnostic for importers. 8 questions covering Article 10(2) due-diligence criteria. Assess your readiness against the EU Deforestation Regulation in 2 minutes — no email required." />
        <meta property="og:url" content="https://antaios.app/free-tool" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://antaios.app" },
              { "@type": "ListItem", "position": 2, "name": "EUDR Compliance Diagnostic", "item": "https://antaios.app/free-tool" }
            ]
          })}
        </script>
      </Helmet>
      <div className="mx-auto flex min-h-screen max-w-screen-lg flex-col px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("freeTool.title", "EUDR Compliance Diagnostic")}
          </Link>
        </div>

        <div className="mb-6">
          <Progress current={state.currentQuestion} total={8} />
        </div>

        <div className="mx-auto w-full max-w-xl rounded-xl border bg-card p-6 shadow-sm">
          <Question
            questionNumber={state.currentQuestion}
            answers={state.answers}
            onAnswer={(value) => {
              if (state.currentQuestion === 1) {
                handleAnswer("commodities", value);
              } else if (state.currentQuestion === 2) {
                handleAnswer("companySize", value);
              } else if (state.currentQuestion === 8) {
                handleAnswer("shipmentLevelTracking", value);
              } else {
                const key = answerKeyMap[state.currentQuestion];
                if (key) handleAnswer(key, value);
              }
            }}
          />

          <div className="mt-8 flex items-center justify-between">
            {state.currentQuestion > 1 ? (
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                {t("freeTool.back", "Back")}
              </Button>
            ) : (
              <div />
            )}

            <Button onClick={handleNext} disabled={!canAdvance}>
              {state.currentQuestion === 8
                ? t("freeTool.result.title", "See my results")
                : t("freeTool.next", "Next")}
              {state.currentQuestion < 8 && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </div>

        <footer className="mt-auto py-6 text-center text-xs text-muted-foreground">
          Antaios — EUDR Compliance Platform
        </footer>
      </div>
    </>
  );
}
