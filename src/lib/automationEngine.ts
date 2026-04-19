import { ActivityEvent, ApprovalTicket, PipelineStage, Project } from "@/types/project";

const newEvent = (
  stage: PipelineStage,
  message: string,
  level: ActivityEvent["level"] = "info",
  agent?: string,
): ActivityEvent => ({
  id: crypto.randomUUID(),
  ts: Date.now(),
  stage,
  level,
  message,
  agent,
});

const randId = (prefix: string) =>
  `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;

/**
 * Returns the next set of activity events + state mutations for a project.
 * Returns null if no further auto-progress is possible.
 */
export interface AutoStep {
  events: ActivityEvent[];
  patch: Partial<Project>;
}

export const getInitialActivity = (): ActivityEvent[] => [
  newEvent("discovery", "Aria (Solution Architect Agent) session started.", "info", "Aria"),
];

export const onRecommendationApproved = (project: Project): AutoStep => ({
  events: [
    newEvent("recommendation", "Recommendation approved by user. Handing off to Architect Agent.", "success", "Aria"),
  ],
  patch: { stage: "architecture" },
});

/**
 * Architecture stage micro-steps
 */
export const tickArchitecture = (project: Project): AutoStep | null => {
  const archEvents = project.activity.filter((e) => e.stage === "architecture");
  const step = archEvents.length;
  switch (step) {
    case 0:
      return {
        events: [newEvent("architecture", "Architect Agent drafting diagram from approved resource bucket…", "info", "Atlas")],
        patch: {},
      };
    case 1:
      return {
        events: [newEvent("architecture", "Architecture diagram v1 generated (12 components, 4 subnets).", "success", "Atlas")],
        patch: {},
      };
    case 2:
      return {
        events: [newEvent("architecture", "Security scan complete: 3 findings detected.", "warning", "SecOps Agent")],
        patch: {},
      };
    case 3:
      return {
        events: [newEvent("architecture", "Auto-remediation applied: WAF enabled, SSH restricted to VPN CIDR, RDS moved to private subnet.", "success", "SecOps Agent")],
        patch: {},
      };
    case 4: {
      const approvals: ApprovalTicket[] = [
        { id: crypto.randomUUID(), type: "GPS", title: "GPS — Cloud Infrastructure Provisioning", ticketNumber: randId("GPS"), status: "submitted", approver: "Rajesh Kumar (ISM)", submittedAt: Date.now(), remarks: [] },
        { id: crypto.randomUUID(), type: "GPS", title: "GPS — Network & Security Baseline", ticketNumber: randId("GPS"), status: "submitted", approver: "Priya Singh (NetSec)", submittedAt: Date.now(), remarks: [] },
      ];
      if (project.recommendation?.solutionType === "generative-ai") {
        approvals.push({ id: crypto.randomUUID(), type: "Other", title: "Legal Approval — LLM Usage", ticketNumber: randId("LEG"), status: "submitted", approver: "Legal Team", submittedAt: Date.now(), remarks: [] });
        approvals.push({ id: crypto.randomUUID(), type: "Other", title: "Data Privacy Clearance", ticketNumber: randId("DPO"), status: "submitted", approver: "Privacy Office", submittedAt: Date.now(), remarks: [] });
      }
      return {
        events: [
          newEvent("architecture", "Architecture finalised. Initial approval email dispatched to ism@tcs.com, netsec@tcs.com.", "success", "Atlas"),
          newEvent("approval", `Auto-raised ${approvals.length} approval ticket(s): ${approvals.map((a) => a.ticketNumber).join(", ")}`, "info", "Approval Bot"),
        ],
        patch: { stage: "approval", approvals: [...project.approvals, ...approvals] },
      };
    }
    default:
      return null;
  }
};

/**
 * Approval stage — auto-progress pending tickets to approved one at a time.
 */
export const tickApproval = (project: Project): AutoStep | null => {
  const pending = project.approvals.find((a) => a.status === "submitted" || a.status === "in-review");
  if (pending) {
    if (pending.status === "submitted") {
      return {
        events: [newEvent("approval", `${pending.ticketNumber} → moved to In Review by ${pending.approver}.`, "info", "Approval Bot")],
        patch: {
          approvals: project.approvals.map((a) =>
            a.id === pending.id ? { ...a, status: "in-review" as const } : a,
          ),
        },
      };
    }
    return {
      events: [newEvent("approval", `${pending.ticketNumber} approved by ${pending.approver}. ${project.approvals.filter(a => a.status === "submitted" || a.status === "in-review").length === 1 ? "All approvals complete." : "Continuing..."}`, "success", "Approval Bot")],
      patch: {
        approvals: project.approvals.map((a) =>
          a.id === pending.id ? { ...a, status: "approved" as const } : a,
        ),
      },
    };
  }
  // All approved → move to provisioning
  if (project.approvals.every((a) => a.status === "approved") && project.approvals.length > 0) {
    return {
      events: [newEvent("provisioning", "All approvals cleared. Triggering Service ID creation in target cloud account.", "success", "Provisioning Bot")],
      patch: { stage: "provisioning" },
    };
  }
  return null;
};

/**
 * Provisioning stage — Service ID then Terraform plan/apply.
 */
export const tickProvisioning = (project: Project): AutoStep | null => {
  const provEvents = project.activity.filter((e) => e.stage === "provisioning");
  const provider = project.recommendation?.provider || "AWS";
  const step = provEvents.length;
  switch (step) {
    case 1:
      return {
        events: [newEvent("provisioning", `Calling ${provider} account-vending API…`, "info", "Provisioning Bot")],
        patch: {},
      };
    case 2: {
      const sid = `SVC-${provider.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        events: [newEvent("provisioning", `✅ Service ID provisioned: ${sid} in ${project.recommendation?.region}.`, "success", "Provisioning Bot")],
        patch: { provisioning: { ...project.provisioning, serviceId: sid } },
      };
    }
    case 3:
      return {
        events: [newEvent("provisioning", "Terraform Cloud workspace created. Generating plan from approved RFCs…", "info", "Terraform Agent")],
        patch: {},
      };
    case 4: {
      const total = project.recommendation?.resources.length || 5;
      const toAdd = total + 8; // include networking primitives
      return {
        events: [newEvent("provisioning", `Terraform plan: ${toAdd} to add, 0 to change, 0 to destroy.`, "info", "Terraform Agent")],
        patch: { provisioning: { ...project.provisioning, terraformPlan: { resources: total, toAdd, toChange: 0, toDestroy: 0 } } },
      };
    }
    case 5:
      return {
        events: [newEvent("provisioning", "terraform apply running… provisioning VPC, subnets, IAM roles, compute, data tier.", "info", "Terraform Agent")],
        patch: {},
      };
    case 6:
      return {
        events: [
          newEvent("provisioning", "✅ Apply complete. All resources healthy. Smoke tests passed.", "success", "Terraform Agent"),
          newEvent("live", "🎉 Infrastructure is LIVE. Onboarding complete.", "success", "Aria"),
        ],
        patch: { provisioning: { ...project.provisioning, terraformApplied: true }, stage: "live" },
      };
    default:
      return null;
  }
};

export const advanceProject = (project: Project): AutoStep | null => {
  switch (project.stage) {
    case "architecture":
      return tickArchitecture(project);
    case "approval":
      return tickApproval(project);
    case "provisioning":
      return tickProvisioning(project);
    default:
      return null;
  }
};

export { newEvent };
