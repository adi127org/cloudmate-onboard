import { AgentNotebook as Notebook } from "@/types/project";
import { Notebook as NotebookIcon, Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  notebook: Notebook;
}

const FIELDS: { key: keyof Notebook; label: string; render?: (v: unknown) => string }[] = [
  { key: "projectName", label: "Project" },
  { key: "techStack", label: "Tech Stack", render: (v) => (Array.isArray(v) ? v.join(", ") : String(v)) },
  { key: "expectedTraffic", label: "Expected Traffic" },
  { key: "dataSensitivity", label: "Data Sensitivity" },
  { key: "compliance", label: "Compliance", render: (v) => (Array.isArray(v) && v.length ? v.join(", ") : "None / standard") },
  { key: "budget", label: "Budget" },
  { key: "cloudPreference", label: "Cloud Preference" },
  { key: "regionPreference", label: "Region" },
];

export const AgentNotebookPanel = ({ notebook }: Props) => {
  return (
    <aside className="border-l bg-card flex flex-col h-full">
      <div className="px-5 py-4 border-b flex items-center gap-2">
        <NotebookIcon className="h-4 w-4 text-accent" />
        <div>
          <h3 className="font-semibold text-sm">AI Notebook</h3>
          <p className="text-[11px] text-muted-foreground">Live context Aria is collecting</p>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-5 space-y-4">
        {FIELDS.map((f) => {
          const raw = notebook[f.key];
          const filled = raw !== undefined && raw !== "" && !(Array.isArray(raw) && raw.length === 0);
          const display = filled ? (f.render ? f.render(raw) : String(raw)) : "—";
          return (
            <div key={f.key} className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-4 w-4 rounded-full flex items-center justify-center shrink-0",
                    filled ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {filled ? <Check className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
                </div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  {f.label}
                </span>
              </div>
              <p className={cn("text-sm pl-6", filled ? "text-foreground" : "text-muted-foreground/60 italic")}>
                {display}
              </p>
            </div>
          );
        })}

        {notebook.usesAI && (
          <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/30">
            <p className="text-xs font-semibold text-accent">🧠 GenAI workload detected</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Aria will recommend a generative-AI environment with managed LLM services.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
