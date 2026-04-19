import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { ActivityEvent, AgentNotebook, ApprovalTicket, ChatMessage, PipelineStage, Project, Recommendation } from "@/types/project";
import { advanceProject, getInitialActivity, newEvent, onRecommendationApproved } from "@/lib/automationEngine";

interface ProjectsContextValue {
  projects: Project[];
  getProject: (id: string) => Project | undefined;
  createProject: (input: { name: string; owner: string; empId: string; businessUnit: string }) => Project;
  appendChat: (id: string, message: ChatMessage) => void;
  updateNotebook: (id: string, patch: Partial<AgentNotebook>) => void;
  lockChat: (id: string) => void;
  setRecommendation: (id: string, rec: Recommendation) => void;
  approveRecommendation: (id: string) => void;
  toggleAuto: (id: string) => void;
  manualAdvance: (id: string) => void;
  simulateRejection: (id: string, ticketId: string) => void;
  resubmitApproval: (id: string, ticketId: string, remark: string) => void;
  setStage: (id: string, stage: PipelineStage) => void;
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

const seedProjects = (): Project[] => {
  const now = Date.now();
  return [
    {
      id: "demo-1",
      name: "Customer Support Copilot",
      owner: "Anita Sharma",
      empId: "TCS-882134",
      businessUnit: "BFSI - Retail Banking",
      createdAt: now - 1000 * 60 * 60 * 48,
      lastActivityAt: now - 1000 * 60 * 30,
      stage: "approval",
      notebook: {
        projectName: "Customer Support Copilot",
        techStack: ["Python", "FastAPI", "Azure OpenAI", "Cosmos DB"],
        expectedTraffic: "~10k DAU",
        dataSensitivity: "PII (customer data)",
        compliance: ["RBI", "ISO 27001"],
        budget: "$5,000 – $20,000 / mo",
        cloudPreference: "Azure",
        regionPreference: "Central India (Pune)",
        usesAI: true,
      },
      chat: [],
      chatLocked: true,
      recommendation: null,
      approvals: [
        { id: "p1-a1", type: "GPS", title: "GPS — Cloud Infrastructure", ticketNumber: "GPS-48217", status: "approved", approver: "Rajesh Kumar (ISM)", submittedAt: now - 1000 * 60 * 60 * 24, remarks: [] },
        { id: "p1-a2", type: "GPS", title: "GPS — Network Baseline", ticketNumber: "GPS-48219", status: "in-review", approver: "Priya Singh (NetSec)", submittedAt: now - 1000 * 60 * 60 * 12, remarks: [] },
        { id: "p1-a3", type: "Other", title: "Legal Approval — LLM Usage", ticketNumber: "LEG-22441", status: "submitted", approver: "Legal Team", submittedAt: now - 1000 * 60 * 60 * 6, remarks: [] },
      ],
      provisioning: { serviceId: null, terraformPlan: null, terraformApplied: false },
      activity: [
        { id: "e1", ts: now - 1000 * 60 * 60 * 48, stage: "discovery", level: "info", message: "Discovery session started." },
        { id: "e2", ts: now - 1000 * 60 * 60 * 30, stage: "recommendation", level: "success", message: "Recommendation approved by Anita Sharma." },
        { id: "e3", ts: now - 1000 * 60 * 60 * 24, stage: "approval", level: "info", message: "GPS-48217 raised → polling." },
        { id: "e4", ts: now - 1000 * 60 * 30, stage: "approval", level: "success", message: "GPS-48217 approved by Rajesh Kumar." },
      ],
      autoMode: false,
    },
    {
      id: "demo-2",
      name: "Fraud Analytics Pipeline",
      owner: "Vikram Desai",
      empId: "TCS-771203",
      businessUnit: "BFSI - Risk",
      createdAt: now - 1000 * 60 * 60 * 24 * 5,
      lastActivityAt: now - 1000 * 60 * 60 * 2,
      stage: "live",
      notebook: { projectName: "Fraud Analytics Pipeline", cloudPreference: "AWS", usesAI: false },
      chat: [],
      chatLocked: true,
      recommendation: null,
      approvals: [],
      provisioning: { serviceId: "SVC-AWS-2841", terraformPlan: { resources: 14, toAdd: 22, toChange: 0, toDestroy: 0 }, terraformApplied: true },
      activity: [
        { id: "f1", ts: now - 1000 * 60 * 60 * 2, stage: "live", level: "success", message: "Infrastructure live ✓" },
      ],
      autoMode: false,
    },
    {
      id: "demo-3",
      name: "Internal HR Portal Modernisation",
      owner: "Sonal Mehta",
      empId: "TCS-660042",
      businessUnit: "Corporate IT",
      createdAt: now - 1000 * 60 * 60 * 6,
      lastActivityAt: now - 1000 * 60 * 60 * 5,
      stage: "discovery",
      notebook: {},
      chat: [],
      chatLocked: false,
      recommendation: null,
      approvals: [],
      provisioning: { serviceId: null, terraformPlan: null, terraformApplied: false },
      activity: [
        { id: "h1", ts: now - 1000 * 60 * 60 * 6, stage: "discovery", level: "info", message: "Aria session started." },
      ],
      autoMode: false,
    },
  ];
};

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>(() => seedProjects());
  const intervalRef = useRef<Record<string, number>>({});

  const updateProject = useCallback((id: string, fn: (p: Project) => Project) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? fn(p) : p)));
  }, []);

  const applyAutoStep = useCallback((id: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const step = advanceProject(p);
        if (!step) return p;
        return {
          ...p,
          ...step.patch,
          activity: [...p.activity, ...step.events],
          lastActivityAt: Date.now(),
        };
      }),
    );
  }, []);

  // Auto-tick engine
  useEffect(() => {
    projects.forEach((p) => {
      const shouldRun = p.autoMode && ["architecture", "approval", "provisioning"].includes(p.stage);
      const isRunning = intervalRef.current[p.id] !== undefined;
      if (shouldRun && !isRunning) {
        intervalRef.current[p.id] = window.setInterval(() => applyAutoStep(p.id), 4500);
      } else if (!shouldRun && isRunning) {
        window.clearInterval(intervalRef.current[p.id]);
        delete intervalRef.current[p.id];
      }
    });
    return () => {
      Object.values(intervalRef.current).forEach((i) => window.clearInterval(i));
      intervalRef.current = {};
    };
  }, [projects, applyAutoStep]);

  const value = useMemo<ProjectsContextValue>(() => ({
    projects,
    getProject: (id) => projects.find((p) => p.id === id),
    createProject: ({ name, owner, empId, businessUnit }) => {
      const project: Project = {
        id: crypto.randomUUID(),
        name,
        owner,
        empId,
        businessUnit,
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        stage: "discovery",
        notebook: { projectName: name },
        chat: [],
        chatLocked: false,
        recommendation: null,
        approvals: [],
        provisioning: { serviceId: null, terraformPlan: null, terraformApplied: false },
        activity: getInitialActivity(),
        autoMode: false,
      };
      setProjects((prev) => [project, ...prev]);
      return project;
    },
    appendChat: (id, message) => updateProject(id, (p) => ({ ...p, chat: [...p.chat, message], lastActivityAt: Date.now() })),
    updateNotebook: (id, patch) => updateProject(id, (p) => ({ ...p, notebook: { ...p.notebook, ...patch } })),
    lockChat: (id) => updateProject(id, (p) => ({ ...p, chatLocked: true })),
    setRecommendation: (id, rec) =>
      updateProject(id, (p) => ({
        ...p,
        recommendation: rec,
        stage: "recommendation",
        activity: [...p.activity, newEvent("recommendation", "Recommendation drafted by Aria.", "success", "Aria")],
      })),
    approveRecommendation: (id) =>
      updateProject(id, (p) => {
        if (!p.recommendation) return p;
        const step = onRecommendationApproved(p);
        return {
          ...p,
          recommendation: { ...p.recommendation, approved: true },
          ...step.patch,
          activity: [...p.activity, ...step.events],
          autoMode: true,
          lastActivityAt: Date.now(),
        };
      }),
    toggleAuto: (id) => updateProject(id, (p) => ({ ...p, autoMode: !p.autoMode })),
    manualAdvance: (id) => applyAutoStep(id),
    simulateRejection: (id, ticketId) =>
      updateProject(id, (p) => ({
        ...p,
        approvals: p.approvals.map((a) =>
          a.id === ticketId
            ? { ...a, status: "rejected" as const, remarks: [...a.remarks, "Approver: Need additional clarifications on data flow and PII handling."] }
            : a,
        ),
        activity: [...p.activity, newEvent("approval", `${p.approvals.find(a => a.id === ticketId)?.ticketNumber} rejected — awaiting user remarks.`, "error", "Approval Bot")],
      })),
    resubmitApproval: (id, ticketId, remark) =>
      updateProject(id, (p) => ({
        ...p,
        approvals: p.approvals.map((a) =>
          a.id === ticketId
            ? { ...a, status: "submitted" as const, remarks: [...a.remarks, `User: ${remark}`], submittedAt: Date.now() }
            : a,
        ),
        activity: [...p.activity, newEvent("approval", `${p.approvals.find(a => a.id === ticketId)?.ticketNumber} resubmitted with user remarks.`, "info", "Approval Bot")],
        autoMode: true,
      })),
    setStage: (id, stage) => updateProject(id, (p) => ({ ...p, stage })),
  }), [projects, updateProject, applyAutoStep]);

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
};

export const useProjects = () => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
};
