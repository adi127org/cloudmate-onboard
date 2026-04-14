import { type ServiceIdCreation } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, CheckCircle2, Clock, Loader2, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  data: ServiceIdCreation;
  onChange: (data: ServiceIdCreation) => void;
}

const statusSteps = [
  { key: "not-started", label: "Not Started", icon: Clock },
  { key: "initiated", label: "Initiated", icon: ArrowRight },
  { key: "in-progress", label: "In Progress", icon: Loader2 },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
];

export const StepServiceIdCreation = ({ data, onChange }: Props) => {
  const handleInitiate = () => {
    onChange({
      ...data,
      status: "initiated",
      serviceId: "SVC-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdDate: new Date().toISOString().split("T")[0],
      disTeamAssigned: "DIS Cloud COE Team",
    });
    toast({ title: "Service ID Creation Initiated", description: "Request sent to DIS team for Service ID creation." });
  };

  const handleProgress = () => {
    onChange({ ...data, status: "in-progress" });
    toast({ title: "Status Updated", description: "Service ID creation is now in progress." });
  };

  const handleComplete = () => {
    onChange({ ...data, status: "completed" });
    toast({ title: "🎉 Service ID Created!", description: "Your cloud service ID has been successfully provisioned." });
  };

  const currentIdx = statusSteps.findIndex((s) => s.key === data.status);

  return (
    <div className="space-y-8">
      {/* Status Timeline */}
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {statusSteps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i <= currentIdx;
          const isCurrent = i === currentIdx;
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive ? isCurrent ? "gradient-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2" : "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className={`h-5 w-5 ${isCurrent && step.key === "in-progress" ? "animate-spin" : ""}`} />
                </div>
                <span className={`text-xs font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
              </div>
              {i < statusSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 mt-[-20px] ${i < currentIdx ? "bg-success" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Details Card */}
      {data.status !== "not-started" && (
        <div className="border rounded-lg p-6 bg-muted/30 max-w-2xl mx-auto space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Service ID</span>
              <p className="font-mono font-semibold text-lg text-primary">{data.serviceId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Created Date</span>
              <p className="font-medium">{data.createdDate}</p>
            </div>
            <div>
              <span className="text-muted-foreground">DIS Team Assigned</span>
              <p className="font-medium">{data.disTeamAssigned}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <Badge className={data.status === "completed" ? "bg-success/10 text-success" : "bg-info/10 text-info"}>
                {data.status.replace("-", " ").toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        {data.status === "not-started" && (
          <Button onClick={handleInitiate} className="gradient-primary text-primary-foreground" size="lg">
            <Rocket className="h-5 w-5 mr-2" /> Initiate Service ID Creation
          </Button>
        )}
        {data.status === "initiated" && (
          <Button onClick={handleProgress} variant="outline" size="lg">
            Mark In Progress
          </Button>
        )}
        {data.status === "in-progress" && (
          <Button onClick={handleComplete} className="gradient-accent text-accent-foreground" size="lg">
            <CheckCircle2 className="h-5 w-5 mr-2" /> Mark Complete
          </Button>
        )}
        {data.status === "completed" && (
          <div className="text-center space-y-2">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
            <p className="text-lg font-semibold text-success">Onboarding Complete!</p>
            <p className="text-sm text-muted-foreground">Your cloud resources are now provisioned and ready to use.</p>
          </div>
        )}
      </div>
    </div>
  );
};
