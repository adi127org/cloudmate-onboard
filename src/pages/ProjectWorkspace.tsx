import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useProjects } from "@/context/ProjectsContext";
import { TopNav } from "@/components/TopNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Cloud, User, Building2, Calendar } from "lucide-react";
import { PipelineProgress } from "@/components/dashboard/PipelineProgress";
import { ChatBubble } from "@/components/agent/ChatBubble";
import { AgentNotebookPanel } from "@/components/agent/AgentNotebook";
import { RecommendationReview } from "@/components/workspace/RecommendationReview";
import { ActivityLog } from "@/components/workspace/ActivityLog";
import { AdminDrawer } from "@/components/workspace/AdminDrawer";
import { RejectionRemarkDialog } from "@/components/workspace/RejectionRemarkDialog";
import { PIPELINE_STAGES } from "@/types/project";
import { CheckCircle2, XCircle, Clock, Eye, Rocket, FileCode2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const ProjectWorkspace = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getProject, approveRecommendation, resubmitApproval } = useProjects();
  const project = id ? getProject(id) : undefined;

  const tab = searchParams.get("tab") || "overview";

  useEffect(() => {
    if (!project) navigate("/");
  }, [project, navigate]);

  if (!project) return null;

  const setTab = (t: string) => setSearchParams({ tab: t });

  const stageBadgeStyle: Record<string, string> = {
    discovery: "bg-info/10 text-info border-info/30",
    recommendation: "bg-accent/10 text-accent border-accent/30",
    architecture: "bg-primary/10 text-primary border-primary/30",
    approval: "bg-warning/10 text-warning border-warning/30",
    provisioning: "bg-accent/10 text-accent border-accent/30",
    live: "bg-success/10 text-success border-success/30",
  };

  const ticketStatusStyle: Record<string, { icon: typeof Clock; cls: string; label: string }> = {
    draft: { icon: Clock, cls: "bg-muted text-muted-foreground", label: "Draft" },
    submitted: { icon: Clock, cls: "bg-info/10 text-info border-info/30", label: "Submitted" },
    "in-review": { icon: Eye, cls: "bg-warning/10 text-warning border-warning/30", label: "In Review" },
    approved: { icon: CheckCircle2, cls: "bg-success/10 text-success border-success/30", label: "Approved" },
    rejected: { icon: XCircle, cls: "bg-destructive/10 text-destructive border-destructive/30", label: "Rejected" },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <div className="border-b bg-card px-6 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold truncate">{project.name}</h2>
            <Badge variant="outline" className={cn("text-[10px]", stageBadgeStyle[project.stage])}>
              {PIPELINE_STAGES.find((s) => s.key === project.stage)?.label}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {project.owner} · {project.empId} · {project.businessUnit}
          </p>
        </div>
        <AdminDrawer project={project} />
      </div>

      <main className="flex-1 px-6 py-6 max-w-7xl w-full mx-auto space-y-6">
        {/* Pipeline */}
        <div className="bg-card border rounded-lg p-5 shadow-card">
          <PipelineProgress current={project.stage} />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="discovery">Discovery</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="approvals">Approvals ({project.approvals.length})</TabsTrigger>
            <TabsTrigger value="provisioning">Provisioning</TabsTrigger>
            <TabsTrigger value="activity">Activity ({project.activity.length})</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-card border rounded-lg p-5 shadow-card lg:col-span-2 space-y-3">
                <h3 className="font-semibold text-sm">Project Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Owner</p>
                      <p className="font-medium">{project.owner}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Business Unit</p>
                      <p className="font-medium">{project.businessUnit}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Cloud className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Provider / Region</p>
                      <p className="font-medium">
                        {project.recommendation?.provider || project.notebook.cloudPreference || "—"}
                        {project.recommendation?.region ? ` · ${project.recommendation.region}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-card border rounded-lg p-5 shadow-card">
                <h3 className="font-semibold text-sm mb-3">Latest Activity</h3>
                <div className="space-y-2 max-h-48 overflow-auto">
                  {project.activity.slice(-5).reverse().map((e) => (
                    <div key={e.id} className="text-xs border-l-2 border-primary/30 pl-3 py-1">
                      <p>{e.message}</p>
                      <p className="text-muted-foreground mt-0.5">
                        {new Date(e.ts).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* DISCOVERY */}
          <TabsContent value="discovery">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
              <div className="bg-card border rounded-lg p-5 shadow-card space-y-4 max-h-[70vh] overflow-auto">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Discovery Transcript</h3>
                  {project.chatLocked && (
                    <Badge variant="outline" className="text-[10px]">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Locked
                    </Badge>
                  )}
                </div>
                {project.chat.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No discovery transcript available.</p>
                ) : (
                  project.chat.map((m) => <ChatBubble key={m.id} message={m} />)
                )}
              </div>
              <div className="bg-card border rounded-lg overflow-hidden h-fit">
                <AgentNotebookPanel notebook={project.notebook} />
              </div>
            </div>
          </TabsContent>

          {/* RECOMMENDATIONS */}
          <TabsContent value="recommendations">
            <RecommendationReview
              project={project}
              onApprove={() => {
                approveRecommendation(project.id);
                setTab("activity");
              }}
            />
          </TabsContent>

          {/* ARCHITECTURE */}
          <TabsContent value="architecture">
            <div className="bg-card border rounded-lg p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Auto-generated Architecture</h3>
                {project.stage === "architecture" || project.activity.some(e => e.stage === "architecture") ? (
                  <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">
                    Generated by Atlas Agent
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">Pending</Badge>
                )}
              </div>
              <div className="aspect-[16/9] rounded-lg border bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                <div className="text-center space-y-2">
                  <FileCode2 className="h-12 w-12 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Architecture diagram (12 components, 4 subnets, WAF + private RDS)
                  </p>
                </div>
              </div>
              <div className="text-sm space-y-1.5">
                <p className="font-medium">Security findings auto-remediated:</p>
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>WAF enabled on internet-facing ALB</li>
                  <li>SSH (22) restricted to TCS VPN CIDR</li>
                  <li>RDS moved to private subnet, no public access</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* APPROVALS */}
          <TabsContent value="approvals" className="space-y-3">
            {project.approvals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No approval tickets raised yet.</p>
              </div>
            ) : (
              project.approvals.map((t) => {
                const sc = ticketStatusStyle[t.status];
                const Icon = sc.icon;
                return (
                  <div key={t.id} className={cn("bg-card border rounded-lg p-4 shadow-card", t.status === "rejected" && "border-destructive/40")}>
                    <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="outline" className="text-[10px]">
                            {t.type}
                          </Badge>
                          <span className="font-mono text-xs text-primary font-semibold">{t.ticketNumber}</span>
                          <span className="font-medium text-sm">{t.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Approver: {t.approver}
                          {t.submittedAt && ` · Submitted ${new Date(t.submittedAt).toLocaleString()}`}
                        </p>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px]", sc.cls)}>
                        <Icon className="h-3 w-3 mr-1" />
                        {sc.label}
                      </Badge>
                    </div>
                    {t.remarks.length > 0 && (
                      <div className="border-t pt-3 mt-3 space-y-1.5">
                        {t.remarks.map((r, i) => (
                          <p key={i} className="text-xs bg-muted rounded px-3 py-2">
                            {r}
                          </p>
                        ))}
                      </div>
                    )}
                    {t.status === "rejected" && (
                      <div className="mt-3 pt-3 border-t flex justify-end">
                        <RejectionRemarkDialog
                          ticket={t}
                          onResubmit={(remark) => resubmitApproval(project.id, t.id, remark)}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* PROVISIONING */}
          <TabsContent value="provisioning">
            <div className="bg-card border rounded-lg p-6 shadow-card space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-primary" />
                  Service ID & Terraform Provisioning
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-muted/20">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Service ID</p>
                  {project.provisioning.serviceId ? (
                    <p className="font-mono text-lg font-semibold text-primary">{project.provisioning.serviceId}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Awaiting approval completion…</p>
                  )}
                </div>
                <div className="border rounded-lg p-4 bg-muted/20">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Terraform Plan</p>
                  {project.provisioning.terraformPlan ? (
                    <p className="text-sm font-mono">
                      <span className="text-success font-semibold">+{project.provisioning.terraformPlan.toAdd}</span>{" "}
                      to add,{" "}
                      <span className="text-warning font-semibold">~{project.provisioning.terraformPlan.toChange}</span>{" "}
                      to change,{" "}
                      <span className="text-destructive font-semibold">-{project.provisioning.terraformPlan.toDestroy}</span>{" "}
                      to destroy
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Plan not generated yet.</p>
                  )}
                </div>
              </div>

              {project.provisioning.terraformApplied && (
                <div className="border border-success/30 bg-success/5 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                  <div>
                    <p className="font-semibold text-success">Infrastructure Live</p>
                    <p className="text-xs text-muted-foreground">All resources provisioned and smoke-tested.</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ACTIVITY */}
          <TabsContent value="activity">
            <div className="bg-card border rounded-lg p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Activity Timeline</h3>
                <Badge variant="outline" className={cn("text-[10px]", project.autoMode ? "bg-success/10 text-success border-success/30" : "bg-muted")}>
                  {project.autoMode ? "● Auto-progress on" : "Auto-progress paused"}
                </Badge>
              </div>
              <ActivityLog events={project.activity} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProjectWorkspace;
