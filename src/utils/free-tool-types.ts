export type Commodity =
  | 'coffee'
  | 'cocoa'
  | 'timber'
  | 'rubber'
  | 'soy'
  | 'palm_oil'
  | 'cattle';
export type CompanySize = 'large_medium' | 'small_micro';

export interface FreeToolAnswers {
  commodities: Commodity[];
  companySize: CompanySize;
  plotLevelKnown: boolean;
  documentedProcess: boolean;
  thirdPartyTraceability: boolean;
  attestationsOnFile: boolean;
  legalityAssessed: boolean;
  shipmentLevelTracking: boolean;
}

export interface CriteriaResult {
  traceability: boolean;
  geolocation: boolean;
  dueDiligenceDocs: boolean;
  supplierAttestations: boolean;
  legalityAssessment: boolean;
}

export type RiskTier = 'high' | 'medium' | 'low';

export interface TierResult {
  tier: RiskTier;
  deadline: string;
  failingCriteriaCount: number;
  criteria: CriteriaResult;
  nextActions: string[];
  regulatoryCitations: Record<string, string>;
}
