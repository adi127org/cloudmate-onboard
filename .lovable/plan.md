

## Vision

Transform DIS Cloud Onboarding from a 7-step form into an **agent-driven CloudOps platform**. Users land on a multi-project dashboard, then start a new onboarding by chatting with an AI Solution Architect agent. The agent gathers context, recommends a full cloud blueprint, and — once approved — drives architecture, approvals, GPS/RFC, Service ID, and Terraform stages with live activity logs (auto-progress with manual override).

Phase 1 (this build): Dashboard + Chat Agent + Recommendation review + auto-progress framework with simulated logs for downstream stages.

## New Information Architecture

```text
/                        Dashboard (list of onboarding projects)
/onboarding/new          Agent chat (Discovery)
/onboarding/:id          Project workspace (tabs below)
  ├─ Overview            Pipeline status, key metrics
  ├─ Discovery           Chat transcript (read-only after lock)
  ├─ Recommendations     AI proposal + Approve / Refine
  ├─ Architecture        Diagram + security analysis (existing)
  ├─ Approvals           GPS/RFC tracker w/ remarks + resend
  ├─ Provisioning        Service ID + Terraform live log
  └─ Activity            Full event timeline
```

The current 7-step wizard is replaced. Existing step components are repurposed inside tabs.

## Key Screens

**1. Dashboard (`/`)**
- Header: "DIS Cloud Onboarding" + "+ New Onboarding" CTA
- Stats row: Active, In Approval, Provisioning, Live
- Project cards with: name, owner, cloud provider chips, pipeline progress bar (Discovery → Recommendation → Architecture → Approval → Provisioning → Live), current stage badge, last activity
- Filter/search bar
- Seeded with 3-4 demo projects in different stages so the dashboard feels populated

**2. Agent Chat (`/onboarding/new`)**
- Split view: chat (left, 65%) + live "AI Notebook" sidebar (right, 35%) that fills in as the user talks (Project Type, Tech Stack, Expected Traffic, Data Sensitivity, Budget, Compliance, Region preference)
- Chat UX: typing indicator, streamed character-by-character responses, suggested-reply chips ("~10k DAU", "GenAI / RAG", "Strict budget < $2k/mo")
- Scripted branching agent with ~8-10 turn conversation. Detects keywords (LLM, RAG, model → GenAI; high traffic → autoscaling; PII → private subnets)
- Final agent turn: "I have enough to draft a recommendation" → CTA "Generate Recommendation"

**3. Recommendation Review**
- AI-generated card stack:
  - Solution verdict (GenAI vs Non-GenAI) with rationale bullets
  - Recommended cloud provider with reasoning ("AWS chosen — your team's Python/SageMaker experience + ap-south-1 latency")
  - Cloud resource bucket table (service / count / sizing / monthly $ estimate)
  - Total estimated cost vs stated budget
- Actions: **Approve & Continue**, **Refine** (reopens chat with context), **Override** (manual edit of bucket)

**4. Project Workspace + Auto-Progress Engine**
- Pipeline stepper at top showing all stages
- After approval, a background "automation engine" (setInterval-based state machine in a React context) auto-advances stages every 6-10s with realistic activity log entries:
  - "Architecture diagram drafted by Architect Agent"
  - "Security scan: 3 findings → auto-remediated"
  - "Email sent to ism@tcs.com"
  - "GPS-48217 raised → polling status..."
  - "GPS approved → auto-raising RFC-9921"
  - "Service ID SVC-AWS-2841 provisioned in ap-south-1"
  - "Terraform plan: 23 to add → applying..."
  - "Infrastructure live ✓"
- Hidden admin drawer (gear icon): "Simulate approval", "Simulate rejection", "Pause auto", "Skip to stage X" — for live demos
- Rejection path: shows comment box → user adds remarks → "Resend for approval" → engine resumes

## Files to Create

- `src/types/project.ts` — `Project`, `ChatMessage`, `AgentNotebook`, `Recommendation`, `PipelineStage`, `ActivityEvent`
- `src/context/ProjectsContext.tsx` — global state (projects, current project, automation engine)
- `src/lib/agentScript.ts` — scripted conversation tree + keyword-based branching
- `src/lib/recommendationEngine.ts` — derives provider/services/cost from notebook
- `src/lib/automationEngine.ts` — stage state machine with timed transitions
- `src/pages/Dashboard.tsx`
- `src/pages/NewOnboarding.tsx` (chat)
- `src/pages/ProjectWorkspace.tsx` (tabs container)
- `src/components/agent/ChatBubble.tsx`, `TypingIndicator.tsx`, `AgentNotebook.tsx`, `SuggestedReplies.tsx`
- `src/components/dashboard/ProjectCard.tsx`, `PipelineProgress.tsx`, `StatsRow.tsx`
- `src/components/workspace/RecommendationReview.tsx`, `ActivityLog.tsx`, `AdminDrawer.tsx`, `RejectionRemarkDialog.tsx`

## Files to Reuse (moved into tabs)

- `StepArchitectureOverview`, `StepApprovalTracker`, `StepServiceIdCreation` → embedded inside Project Workspace tabs (slight prop changes to read from ProjectsContext)

## Files to Remove/Retire

- `OnboardingWizard.tsx`, `StepIndicator.tsx`, `StepAccountDetails.tsx`, `StepRequirementAssessment.tsx`, `StepCloudResources.tsx`, `StepRecommendations.tsx` (logic absorbed into agent + recommendation engine)
- `pages/Index.tsx` becomes the new Dashboard

## Routing

App.tsx gets routes: `/`, `/onboarding/new`, `/onboarding/:id`. ProjectsContext wraps the BrowserRouter.

## Design

Keep navy/teal theme. Add agent-specific tokens: chat bubble bg, AI accent gradient, activity-log timeline rail. All colors via existing semantic tokens — no hardcoded colors.

## Out of Scope (Phase 2 — explicit)

- Real LLM (Lovable AI swap-in is a one-file change in `agentScript.ts`)
- Real email sending, real GPS/RFC integration, real Terraform — all simulated with rich logs
- Auth & persistence (state lives in memory; demo-friendly)

