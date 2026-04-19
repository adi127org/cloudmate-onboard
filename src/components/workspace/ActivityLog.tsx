import { ActivityEvent } from "@/types/project";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Info, XCircle, Bot } from "lucide-react";
import { useEffect, useRef } from "react";

const levelStyle: Record<ActivityEvent["level"], { icon: typeof Info; cls: string }> = {
  info: { icon: Info, cls: "text-info bg-info/10 border-info/30" },
  success: { icon: CheckCircle2, cls: "text-success bg-success/10 border-success/30" },
  warning: { icon: AlertCircle, cls: "text-warning bg-warning/10 border-warning/30" },
  error: { icon: XCircle, cls: "text-destructive bg-destructive/10 border-destructive/30" },
};

const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export const ActivityLog = ({ events, autoScroll = true }: { events: ActivityEvent[]; autoScroll?: boolean }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [events.length, autoScroll]);

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Bot className="h-10 w-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-3">
      <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
      {events.map((e) => {
        const ls = levelStyle[e.level];
        const Icon = ls.icon;
        return (
          <div key={e.id} className="flex gap-3 relative">
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center border-2 border-background shrink-0 z-10", ls.cls)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0 pt-1 pb-2">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm">{e.message}</p>
                <span className="text-[10px] text-muted-foreground shrink-0 font-mono">{fmtTime(e.ts)}</span>
              </div>
              {e.agent && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  via <span className="font-medium">{e.agent}</span>
                </p>
              )}
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
};
