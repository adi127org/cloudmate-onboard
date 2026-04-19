import {
  AgentNotebook,
  CloudProvider,
  Recommendation,
  RecommendedResource,
  SolutionType,
} from "@/types/project";

const parseBudget = (b?: string): number | null => {
  if (!b) return null;
  const nums = b.replace(/[,$]/g, "").match(/\d+/g);
  if (!nums) return null;
  const n = nums.map(Number);
  if (b.includes("<")) return n[0];
  if (n.length >= 2) return Math.round((n[0] + n[1]) / 2);
  return n[0];
};

const trafficScale = (t?: string): "low" | "medium" | "high" => {
  if (!t) return "low";
  const lower = t.toLowerCase();
  if (/100k|million|1m|high/.test(lower)) return "high";
  if (/10k|medium|moderate/.test(lower)) return "medium";
  return "low";
};

const pickProvider = (notebook: AgentNotebook): { provider: CloudProvider; rationale: string[] } => {
  if (notebook.cloudPreference && notebook.cloudPreference !== "no-preference") {
    return {
      provider: notebook.cloudPreference,
      rationale: [
        `You explicitly selected ${notebook.cloudPreference} as your preferred provider.`,
        `Region availability and TCS DIS managed support are confirmed for ${notebook.cloudPreference}.`,
      ],
    };
  }
  // No preference — recommend based on signals
  if (notebook.usesAI) {
    return {
      provider: "Azure",
      rationale: [
        "GenAI workload detected → Azure OpenAI provides enterprise-grade managed LLMs with India data residency.",
        "Native integration with Azure AI Search + Cosmos DB simplifies RAG architecture.",
        "TCS DIS has the largest pre-approved Azure landing zone catalogue.",
      ],
    };
  }
  if (/python|fastapi|django|sagemaker/i.test((notebook.techStack || []).join(" "))) {
    return {
      provider: "AWS",
      rationale: [
        "Python-heavy stack maps cleanly onto AWS Lambda, ECS, and SageMaker.",
        "ap-south-1 (Mumbai) gives you sub-30ms latency for India-based users.",
        "Mature ecosystem of DIS-approved Terraform modules accelerates onboarding.",
      ],
    };
  }
  return {
    provider: "AWS",
    rationale: [
      "AWS recommended as default for general-purpose workloads given DIS landing-zone maturity.",
      "Broadest service catalogue and strongest cost-optimization tooling.",
    ],
  };
};

const pickSolutionType = (notebook: AgentNotebook): { type: SolutionType; rationale: string[] } => {
  if (notebook.usesAI) {
    return {
      type: "generative-ai",
      rationale: [
        "Detected LLM / RAG / vector-DB language in your tech stack.",
        "GenAI environment unlocks Azure OpenAI / Bedrock / Vertex with pre-approved Legal & Privacy templates.",
        "Includes guardrails, prompt logging, and Responsible AI controls by default.",
      ],
    };
  }
  return {
    type: "non-generative-ai",
    rationale: [
      "Workload is conventional web/data — no LLM or generative components detected.",
      "Standard DIS Public Cloud environment is fastest path to provisioning.",
      "Avoids the additional Legal + Data Privacy gates required for GenAI.",
    ],
  };
};

const buildResourceBucket = (
  provider: CloudProvider,
  scale: "low" | "medium" | "high",
  isAI: boolean,
  sensitivity?: string,
): RecommendedResource[] => {
  const sizeMul = scale === "high" ? 4 : scale === "medium" ? 2 : 1;
  const isPII = /pii|financial|pci|healthcare/i.test(sensitivity || "");

  const catalog: Record<CloudProvider, RecommendedResource[]> = {
    AWS: [
      { service: "EC2 (t3.large)", count: 2 * sizeMul, sizing: "2 vCPU / 8 GB", monthlyCostUsd: 60 * sizeMul, rationale: "App tier, autoscaling group across 2 AZs." },
      { service: "RDS PostgreSQL", count: 1, sizing: "db.t3.medium, Multi-AZ", monthlyCostUsd: 180, rationale: "Managed Postgres with automated backups." },
      { service: "S3", count: 2, sizing: "Standard + IA lifecycle", monthlyCostUsd: 25, rationale: "Static assets and backups." },
      { service: "Application Load Balancer", count: 1, sizing: "Internet-facing, WAF-enabled", monthlyCostUsd: 35, rationale: "TLS termination + WAF." },
      { service: "CloudWatch + GuardDuty", count: 1, sizing: "Standard", monthlyCostUsd: 40, rationale: "Observability + threat detection." },
    ],
    Azure: [
      { service: "App Service Plan (P1v3)", count: 1 * sizeMul, sizing: "2 vCPU / 8 GB", monthlyCostUsd: 145 * sizeMul, rationale: "Managed app hosting with autoscale." },
      { service: "Azure SQL DB", count: 1, sizing: "S2 Standard", monthlyCostUsd: 75, rationale: "Managed SQL with PITR." },
      { service: "Blob Storage", count: 2, sizing: "Hot + Cool tiers", monthlyCostUsd: 30, rationale: "Object storage with lifecycle." },
      { service: "Application Gateway + WAF", count: 1, sizing: "Standard_v2", monthlyCostUsd: 220, rationale: "L7 LB with managed WAF." },
      { service: "Log Analytics + Defender", count: 1, sizing: "Pay-as-you-go", monthlyCostUsd: 80, rationale: "Centralised logging + security." },
    ],
    GCP: [
      { service: "Compute Engine (n2-standard-2)", count: 2 * sizeMul, sizing: "2 vCPU / 8 GB", monthlyCostUsd: 70 * sizeMul, rationale: "MIG with regional autoscaling." },
      { service: "Cloud SQL Postgres", count: 1, sizing: "db-custom-2-8GB HA", monthlyCostUsd: 200, rationale: "Managed Postgres with HA." },
      { service: "Cloud Storage", count: 2, sizing: "Standard + Nearline", monthlyCostUsd: 22, rationale: "GCS buckets with lifecycle." },
      { service: "Cloud Load Balancing + Cloud Armor", count: 1, sizing: "Global HTTPS LB", monthlyCostUsd: 50, rationale: "Global LB with WAF." },
      { service: "Cloud Logging + SCC", count: 1, sizing: "Standard", monthlyCostUsd: 45, rationale: "Logs + Security Command Center." },
    ],
    "On-Prem": [
      { service: "VMware VM", count: 4 * sizeMul, sizing: "4 vCPU / 16 GB", monthlyCostUsd: 0, rationale: "On-prem VMs from existing capacity." },
      { service: "F5 Load Balancer", count: 1, sizing: "Shared tenancy", monthlyCostUsd: 0, rationale: "Existing F5 cluster." },
    ],
  };

  const base = catalog[provider];

  if (isAI) {
    if (provider === "Azure") {
      base.push({ service: "Azure OpenAI (GPT-4o)", count: 1, sizing: "PTU + on-demand fallback", monthlyCostUsd: 800, rationale: "Managed LLM with India residency." });
      base.push({ service: "Azure AI Search", count: 1, sizing: "Standard S1", monthlyCostUsd: 250, rationale: "Vector + hybrid search for RAG." });
    } else if (provider === "AWS") {
      base.push({ service: "Bedrock (Claude 3.5)", count: 1, sizing: "On-demand", monthlyCostUsd: 750, rationale: "Managed foundation models." });
      base.push({ service: "OpenSearch Serverless", count: 1, sizing: "2 OCU", monthlyCostUsd: 350, rationale: "Vector store for RAG." });
    } else if (provider === "GCP") {
      base.push({ service: "Vertex AI (Gemini 1.5 Pro)", count: 1, sizing: "On-demand", monthlyCostUsd: 700, rationale: "Managed Gemini models." });
      base.push({ service: "Vertex Vector Search", count: 1, sizing: "Standard", monthlyCostUsd: 280, rationale: "Vector index for RAG." });
    }
  }

  if (isPII) {
    base.push({
      service: provider === "AWS" ? "AWS KMS + Macie" : provider === "Azure" ? "Key Vault + Purview" : "KMS + DLP API",
      count: 1,
      sizing: "Standard",
      monthlyCostUsd: 60,
      rationale: "PII detected → CMK encryption + DLP scanning required.",
    });
  }

  return base;
};

export const generateRecommendation = (notebook: AgentNotebook): Recommendation => {
  const { provider, rationale: providerRationale } = pickProvider(notebook);
  const { type, rationale: solutionRationale } = pickSolutionType(notebook);
  const scale = trafficScale(notebook.expectedTraffic);
  const resources = buildResourceBucket(provider, scale, type === "generative-ai", notebook.dataSensitivity);
  const total = resources.reduce((sum, r) => sum + r.monthlyCostUsd * r.count, 0);

  const regionMap: Record<CloudProvider, string> = {
    AWS: "ap-south-1 (Mumbai)",
    Azure: "Central India (Pune)",
    GCP: "asia-south1 (Mumbai)",
    "On-Prem": "On-Premises DC",
  };

  return {
    solutionType: type,
    solutionRationale,
    provider,
    providerRationale,
    region: notebook.regionPreference?.includes("(") ? notebook.regionPreference : regionMap[provider],
    resources,
    totalMonthlyCostUsd: total,
    budgetTargetUsd: parseBudget(notebook.budget),
    approved: false,
  };
};
