import { AgentNotebook, ChatMessage } from "@/types/project";

export interface AgentTurn {
  message: string;
  suggestions?: string[];
  field?: keyof AgentNotebook;
  done?: boolean;
}

const QUESTIONS: AgentTurn[] = [
  {
    message:
      "👋 Hi! I'm **Aria**, your DIS Cloud Solution Architect agent. I'll ask a few questions about your project so I can recommend the right cloud blueprint. To start — what's the **name of your project** and a one-line description of what it does?",
    field: "projectName",
  },
  {
    message:
      "Great. What's the **primary tech stack** you're planning to use? (languages, frameworks, databases — anything relevant)",
    field: "techStack",
    suggestions: [
      "Python + FastAPI + Postgres",
      "Node.js + React + MongoDB",
      "Java Spring Boot + Oracle",
      "LLM / RAG with Python + Vector DB",
    ],
  },
  {
    message:
      "Got it. What's your **expected traffic / scale**? Daily active users, requests per second, or anything you can share helps me size the infra.",
    field: "expectedTraffic",
    suggestions: ["~1k DAU (low)", "~10k DAU (medium)", "~100k DAU (high)", "Internal tool, <100 users"],
  },
  {
    message:
      "What kind of **data** will your application handle? Any PII, financial, healthcare, or regulated data?",
    field: "dataSensitivity",
    suggestions: ["Public / non-sensitive", "Internal business data", "PII (customer data)", "Financial / PCI-DSS"],
  },
  {
    message:
      "Any **compliance requirements** I should keep in mind? (RBI, HIPAA, GDPR, ISO 27001, etc.)",
    field: "compliance",
    suggestions: ["None / standard", "ISO 27001", "GDPR", "RBI / Indian financial"],
  },
  {
    message:
      "What's your **monthly cloud budget** target? (rough range is fine — helps me pick right-sized resources)",
    field: "budget",
    suggestions: ["< $1,000 / mo", "$1,000 – $5,000 / mo", "$5,000 – $20,000 / mo", "Flexible / enterprise"],
  },
  {
    message:
      "Do you have a **preferred cloud provider**, or should I recommend one for you?",
    field: "cloudPreference",
    suggestions: ["AWS", "Azure", "GCP", "No preference — you pick"],
  },
  {
    message:
      "Last question — any **region preference**? Most TCS workloads run in **ap-south-1 (Mumbai)** or **Central India** for latency + data residency.",
    field: "regionPreference",
    suggestions: ["ap-south-1 (Mumbai)", "Central India (Pune)", "US East", "EU West"],
  },
  {
    message:
      "✅ Perfect — I have everything I need. Based on your inputs, I'm drafting a **complete cloud recommendation**: solution type, provider, sized resource bucket, and an estimated monthly cost. Click **Generate Recommendation** when you're ready to review.",
    done: true,
  },
];

export const FIRST_TURN: ChatMessage = {
  id: crypto.randomUUID(),
  role: "agent",
  content: QUESTIONS[0].message,
  ts: Date.now(),
};

export const getNextAgentTurn = (turnIndex: number): AgentTurn | null => {
  if (turnIndex >= QUESTIONS.length) return null;
  return QUESTIONS[turnIndex];
};

export const detectFromAnswer = (
  field: keyof AgentNotebook | undefined,
  answer: string,
  notebook: AgentNotebook,
): Partial<AgentNotebook> => {
  if (!field) return {};
  const lower = answer.toLowerCase();
  const update: Partial<AgentNotebook> = {};

  switch (field) {
    case "projectName":
      update.projectName = answer.split(/[—\-:.]/)[0].trim().slice(0, 60) || answer.slice(0, 60);
      update.projectType = answer;
      break;
    case "techStack":
      update.techStack = answer.split(/[,+]/).map((s) => s.trim()).filter(Boolean);
      if (/llm|rag|gpt|gemini|claude|vector|embedding|openai|sagemaker|bedrock|vertex/i.test(answer)) {
        update.usesAI = true;
      }
      break;
    case "expectedTraffic":
      update.expectedTraffic = answer;
      break;
    case "dataSensitivity":
      update.dataSensitivity = answer;
      break;
    case "compliance":
      update.compliance = /none|standard/i.test(answer)
        ? []
        : answer.split(/[,/]/).map((s) => s.trim()).filter(Boolean);
      break;
    case "budget":
      update.budget = answer;
      break;
    case "cloudPreference":
      if (/aws/i.test(answer)) update.cloudPreference = "AWS";
      else if (/azure/i.test(answer)) update.cloudPreference = "Azure";
      else if (/gcp|google/i.test(answer)) update.cloudPreference = "GCP";
      else update.cloudPreference = "no-preference";
      break;
    case "regionPreference":
      update.regionPreference = answer;
      break;
  }

  // global keyword sniff for AI
  if (notebook.usesAI === undefined && /ai|ml|llm|rag|gen[\s-]?ai|chatbot|copilot/i.test(lower)) {
    update.usesAI = true;
  }
  return update;
};
