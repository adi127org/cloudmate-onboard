export type CloudProvider = "AWS" | "Azure" | "GCP" | "On-Prem";
export type SolutionType = "generative-ai" | "non-generative-ai";

export type PipelineStage =
  | "discovery"
  | "recommendation"
  | "architecture"
  | "approval"
  | "provisioning"
  | "live";

export const PIPELINE_STAGES: { key: PipelineStage; label: string }[] = [
  { key: "discovery", label: "Discovery" },
  { key: "recommendation", label: "Recommendation" },
  { key: "architecture", label: "Architecture" },
  { key: "approval", label: "Approval" },
  { key: "provisioning", label: "Provisioning" },
  { key: "live", label: "Live" },
];

export interface ChatMessage {
  id: string;
  role: "agent" | "user";
  content: string;
  ts: number;
  suggestions?: string[];
}

export interface AgentNotebook {
  projectName?: string;
  projectType?: string;
  techStack?: string[];
  expectedTraffic?: string;
  dataSensitivity?: string;
  budget?: string;
  compliance?: string[];
  regionPreference?: string;
  cloudPreference?: CloudProvider | "no-preference";
  usesAI?: boolean;
}

export interface RecommendedResource {
  service: string;
  count: number;
  sizing: string;
  monthlyCostUsd: number;
  rationale: string;
}

export interface Recommendation {
  solutionType: SolutionType;
  solutionRationale: string[];
  provider: CloudProvider;
  providerRationale: string[];
  region: string;
  resources: RecommendedResource[];
  totalMonthlyCostUsd: number;
  budgetTargetUsd: number | null;
  approved: boolean;
}

export interface ActivityEvent {
  id: string;
  ts: number;
  stage: PipelineStage;
  level: "info" | "success" | "warning" | "error";
  message: string;
  agent?: string;
}

export interface ApprovalTicket {
  id: string;
  type: "GPS" | "RFC" | "Other";
  title: string;
  ticketNumber: string;
  status: "draft" | "submitted" | "in-review" | "approved" | "rejected";
  approver: string;
  submittedAt: number | null;
  remarks: string[];
}

export interface ProvisioningState {
  serviceId: string | null;
  terraformPlan: { resources: number; toAdd: number; toChange: number; toDestroy: number } | null;
  terraformApplied: boolean;
}

export interface Project {
  id: string;
  name: string;
  owner: string;
  empId: string;
  businessUnit: string;
  createdAt: number;
  lastActivityAt: number;
  stage: PipelineStage;
  notebook: AgentNotebook;
  chat: ChatMessage[];
  chatLocked: boolean;
  recommendation: Recommendation | null;
  approvals: ApprovalTicket[];
  provisioning: ProvisioningState;
  activity: ActivityEvent[];
  autoMode: boolean;
}
