import { useCallback } from "react";
import { trackEvent } from "@/lib/analytics";

export function useAnalytics() {
  const trackFreeToolStarted = useCallback(() => {
    trackEvent("free_tool_started");
  }, []);

  const trackFreeToolQuestionAnswered = useCallback(
    (questionNumber: number) => {
      trackEvent("free_tool_question_answered", {
        question_number: questionNumber,
      });
    },
    []
  );

  const trackFreeToolCompleted = useCallback(
    (riskTier: string, failingCriteriaCount: number) => {
      trackEvent("free_tool_completed", {
        risk_tier: riskTier,
        failing_criteria_count: failingCriteriaCount,
      });
    },
    []
  );

  const trackFreeToolAbandoned = useCallback((lastQuestion: number) => {
    trackEvent("free_tool_abandoned", { last_question: lastQuestion });
  }, []);

  const trackFreeToolCtaClicked = useCallback(
    (riskTier: string, destination: string) => {
      trackEvent("free_tool_cta_clicked", {
        risk_tier: riskTier,
        destination: destination,
      });
    },
    []
  );

  const trackLandingCtaClicked = useCallback(
    (position: string, destination: string) => {
      trackEvent("landing_cta_clicked", {
        cta_position: position,
        destination: destination,
      });
    },
    []
  );

  const trackLandingFaqExpanded = useCallback((questionId: string) => {
    trackEvent("landing_faq_expanded", { question_id: questionId });
  }, []);

  return {
    trackFreeToolStarted,
    trackFreeToolQuestionAnswered,
    trackFreeToolCompleted,
    trackFreeToolAbandoned,
    trackFreeToolCtaClicked,
    trackLandingCtaClicked,
    trackLandingFaqExpanded,
  };
}
