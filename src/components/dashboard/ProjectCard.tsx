import { Project, PIPELINE_STAGES } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { PipelineProgress } from "./PipelineProgress";
import { cn } from "@/lib/utils";

const stageStyle: Record<string, string> = {
  discovery: "bg-info/10 text-info border-info/30",
  recommendation: "bg-accent/10 text-accent border-accent/30",
  architecture: "bg-primary/10 text-primary border-primary/30",
  approval: "bg-warning/10 text-warning border-warning/30",
  provisioning: "bg-accent/10 text-accent border-accent/30",
  live: "bg-success/10 text-success border-success/30",
};

const timeAgo = (ts: number) => {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export const ProjectCard = ({ project }: { project: Project }) => {
  const provider = project.notebook.cloudPreference || project.recommendation?.provider;
  const stageLabel = PIPELINE_STAGES.find((s) => s.key === project.stage)?.label;

  return (
    <Link
      to={`/onboarding/${project.id}`}
      className="block bg-card border rounded-lg p-5 shadow-card hover:shadow-card-hover transition-all hover:border-primary/40 group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{project.name}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {project.owner}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(project.lastActivityAt)}
            </span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", stageStyle[project.stage])}>
          {stageLabel}
        </Badge>
        {provider && provider !== "no-preference" && (
          <Badge variant="secondary" className="text-[10px]">
            {provider}
          </Badge>
        )}
        {project.notebook.usesAI && (
          <Badge variant="outline" className="text-[10px] border-accent/40 text-accent">
            GenAI
          </Badge>
        )}
        <Badge variant="secondary" className="text-[10px] ml-auto">
          {project.businessUnit}
        </Badge>
      </div>

      <PipelineProgress current={project.stage} compact />
    </Link>
  );
};
