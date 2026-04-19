import { Project } from "@/types/project";
import { Activity, ClipboardCheck, Cloud, Rocket } from "lucide-react";

interface Props {
  projects: Project[];
}

export const StatsRow = ({ projects }: Props) => {
  const active = projects.filter((p) => p.stage !== "live").length;
  const inApproval = projects.filter((p) => p.stage === "approval").length;
  const provisioning = projects.filter((p) => p.stage === "provisioning").length;
  const live = projects.filter((p) => p.stage === "live").length;

  const stats = [
    { label: "Active Onboardings", value: active, icon: Activity, color: "text-info bg-info/10" },
    { label: "In Approval", value: inApproval, icon: ClipboardCheck, color: "text-warning bg-warning/10" },
    { label: "Provisioning", value: provisioning, icon: Rocket, color: "text-accent bg-accent/10" },
    { label: "Live", value: live, icon: Cloud, color: "text-success bg-success/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-card border rounded-lg p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
