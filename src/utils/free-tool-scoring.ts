import {
  FreeToolAnswers,
  CriteriaResult,
  TierResult,
  RiskTier,
  CompanySize,
} from './free-tool-types';

export function scoreCriteria(answers: FreeToolAnswers): CriteriaResult {
  const geolocation = answers.plotLevelKnown;
  const traceability = answers.plotLevelKnown && answers.shipmentLevelTracking;
  const dueDiligenceDocs = answers.documentedProcess;
  const supplierAttestations = answers.attestationsOnFile;
  const legalityAssessment = answers.legalityAssessed;

  return {
    traceability,
    geolocation,
    dueDiligenceDocs,
    supplierAttestations,
    legalityAssessment,
  };
}

export function computeDeadline(companySize: CompanySize): Date {
  if (companySize === 'large_medium') {
    return new Date('2026-12-30T00:00:00Z');
  }
  return new Date('2027-06-30T00:00:00Z');
}

function monthsBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
}

export function assignTier(
  criteria: CriteriaResult,
  companySize: CompanySize,
  currentDate?: Date,
): TierResult {
  const now = currentDate ?? new Date();
  const deadline = computeDeadline(companySize);
  const monthsToDeadline = monthsBetween(now, deadline);

  const failingCriteriaCount = Object.values(criteria).filter(
    (passed) => !passed,
  ).length;

  let tier: RiskTier;

  if (failingCriteriaCount === 0) {
    tier = 'low';
  } else if (failingCriteriaCount === 1) {
    if (companySize === 'large_medium' && monthsToDeadline < 6) {
      tier = 'high';
    } else {
      tier = 'low';
    }
  } else if (failingCriteriaCount === 2) {
    if (companySize === 'large_medium' && monthsToDeadline < 6) {
      tier = 'high';
    } else if (
      companySize === 'small_micro' &&
      monthsToDeadline > 9
    ) {
      tier = 'low';
    } else {
      tier = 'medium';
    }
  } else if (failingCriteriaCount === 3) {
    if (companySize === 'large_medium' && monthsToDeadline < 6) {
      tier = 'high';
    } else {
      tier = 'medium';
    }
  } else if (failingCriteriaCount === 4) {
    if (
      companySize === 'small_micro' &&
      monthsToDeadline > 9
    ) {
      tier = 'medium';
    } else {
      tier = 'high';
    }
  } else {
    tier = 'high';
  }

  return {
    tier,
    deadline: deadline.toISOString(),
    failingCriteriaCount,
    criteria,
    nextActions: getNextActions(criteria),
    regulatoryCitations: getRegulatoryCitations(),
  };
}

export function getNextActions(criteria: CriteriaResult): string[] {
  const actions: string[] = [];

  if (!criteria.geolocation) {
    actions.push(
      'Collect plot-level geolocation data for all your supply origins',
    );
  }
  if (!criteria.traceability) {
    actions.push(
      'Implement shipment-level tracking for individual consignments',
    );
  }
  if (!criteria.dueDiligenceDocs) {
    actions.push(
      'Document your due-diligence process per Article 10(2) requirements',
    );
  }
  if (!criteria.supplierAttestations) {
    actions.push(
      'Request deforestation-free declarations from your suppliers',
    );
  }
  if (!criteria.legalityAssessment) {
    actions.push(
      'Conduct legality assessment under country-of-origin laws',
    );
  }

  return actions;
}

export function getRegulatoryCitations(): Record<string, string> {
  return {
    traceability:
      'Article 10(2)(a) — Traceability throughout the supply chain',
    geolocation:
      'Article 9(1)(d) — Plot-level geolocation of all production plots',
    dueDiligenceDocs:
      'Article 10(2)(b) — Documented due-diligence procedures',
    supplierAttestations:
      'Article 10(2)(c) — Supplier attestations and certifications',
    legalityAssessment:
      'Article 10(2)(d) — Legality assessment under country-of-origin laws',
  };
}
