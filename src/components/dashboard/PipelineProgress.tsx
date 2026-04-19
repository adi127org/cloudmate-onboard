import { PIPELINE_STAGES, PipelineStage } from "@/types/project";
import { cn } from "@/lib/utils";

interface Props {
  current: PipelineStage;
  compact?: boolean;
}

export const PipelineProgress = ({ current, compact }: Props) => {
  const currentIdx = PIPELINE_STAGES.findIndex((s) => s.key === current);

  if (compact) {
    const pct = ((currentIdx + 1) / PIPELINE_STAGES.length) * 100;
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{PIPELINE_STAGES[currentIdx]?.label}</span>
          <span>
            Stage {currentIdx + 1} / {PIPELINE_STAGES.length}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full gradient-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full">
      {PIPELINE_STAGES.map((s, i) => {
        const reached = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                  isCurrent && "gradient-primary text-primary-foreground ring-4 ring-primary/20",
                  reached && !isCurrent && "bg-success text-success-foreground",
                  !reached && "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium whitespace-nowrap",
                  reached ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < PIPELINE_STAGES.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-2 mb-5", i < currentIdx ? "bg-success" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
};
