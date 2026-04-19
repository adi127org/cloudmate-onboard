import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings, Pause, Play, FastForward, AlertTriangle } from "lucide-react";
import { useProjects } from "@/context/ProjectsContext";
import { Project, PIPELINE_STAGES, PipelineStage } from "@/types/project";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

export const AdminDrawer = ({ project }: { project: Project }) => {
  const { toggleAuto, manualAdvance, simulateRejection, setStage } = useProjects();
  const pendingApproval = project.approvals.find((a) => a.status === "submitted" || a.status === "in-review");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Demo controls">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Demo Controls</SheetTitle>
          <SheetDescription>
            Manual overrides for live demos. Auto-progress is on by default after recommendation approval.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-2">
              {project.autoMode ? <Play className="h-4 w-4 text-success" /> : <Pause className="h-4 w-4 text-muted-foreground" />}
              <div>
                <p className="text-sm font-medium">Auto-progress engine</p>
                <p className="text-xs text-muted-foreground">{project.autoMode ? "Running — advances every ~4.5s" : "Paused"}</p>
              </div>
            </div>
            <Switch checked={project.autoMode} onCheckedChange={() => toggleAuto(project.id)} />
          </div>

          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Manual triggers</h4>
            <Button variant="outline" className="w-full justify-start" onClick={() => manualAdvance(project.id)}>
              <FastForward className="h-4 w-4 mr-2" /> Advance one step
            </Button>
            {pendingApproval && (
              <Button
                variant="outline"
                className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={() => {
                  simulateRejection(project.id, pendingApproval.id);
                  toast({ title: "Rejection simulated", description: `${pendingApproval.ticketNumber} rejected.` });
                }}
              >
                <AlertTriangle className="h-4 w-4 mr-2" /> Simulate rejection on next approval
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Skip to stage</h4>
            <div className="grid grid-cols-2 gap-2">
              {PIPELINE_STAGES.map((s) => (
                <Button
                  key={s.key}
                  variant={project.stage === s.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setStage(project.id, s.key as PipelineStage);
                    toast({ title: "Stage set", description: `Jumped to ${s.label}` });
                  }}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
