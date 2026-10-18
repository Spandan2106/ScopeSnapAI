export interface RequirementItem {
  id: string;
  category: string;
  title: string;
  description: string;
  isConfirmed: boolean;
  priority: 'Must-Have' | 'Should-Have' | 'Nice-to-Have';
  deliverable: string;
}

export interface AssumptionItem {
  id: string;
  item: string;
  impact: string;
}

export interface ExclusionItem {
  id: string;
  item: string;
  reason: string;
}

export interface ScopeCreepItem {
  id: string;
  risk: string;
  mitigation: string;
}

export interface ClarifyingQuestionItem {
  id: string;
  category: string;
  question: string;
  whyItMatters: string;
  severity: 'Critical' | 'Important' | 'Nice to Know';
}

export interface MilestoneItem {
  id: string;
  phaseNumber: number;
  title: string;
  estimatedDuration: string;
  deliverables: string[];
  clientDependencies: string;
}

export interface PricingItem {
  id: string;
  item: string;
  description: string;
  cost: string;
  isEstimated: boolean;
}

export interface PaymentScheduleItem {
  stage: string;
  percentage: string;
  trigger: string;
}

export interface PricingDetails {
  budgetProvided: boolean;
  pricingModel: string;
  currency: string;
  items: PricingItem[];
  subtotal: string;
  paymentSchedule: PaymentScheduleItem[];
  taxNotes: string;
  disclaimer: string;
}

export interface ScopeProposal {
  projectTitle: string;
  clientName: string;
  freelancerName: string;
  agencyName: string;
  currency: string;
  tone: string;
  confidenceScore: 'High' | 'Medium' | 'Low (Needs Clarification)' | string;
  executiveSummary: string;
  coreObjective: string;
  targetAudience: string;
  requirements: RequirementItem[];
  assumptions: AssumptionItem[];
  explicitExclusions: ExclusionItem[];
  scopeCreepFlags: ScopeCreepItem[];
  clarifyingQuestions: ClarifyingQuestionItem[];
  milestones: MilestoneItem[];
  totalEstimatedTimeline: string;
  pricing: PricingDetails;
  clientFacingProposalMarkdown: string;
  followUpMessageEmail: {
    subject: string;
    body: string;
  };
  followUpMessageWhatsApp: string;
}

export interface ProjectBriefInput {
  brief: string;
  freelancerName: string;
  businessName: string;
  clientName: string;
  currency: string;
  tone: string;
  estimatedBudget: string;
  targetTimeline: string;
  imageBase64?: string;
  imageMimeType?: string;
  imageFileName?: string;
}

export interface SampleBrief {
  id: string;
  title: string;
  clientName: string;
  category: string;
  brief: string;
  freelancerName: string;
  businessName: string;
  currency: string;
  tone: string;
  estimatedBudget: string;
  targetTimeline: string;
}
