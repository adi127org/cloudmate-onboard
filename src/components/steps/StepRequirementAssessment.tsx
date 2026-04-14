import { type RequirementAssessment } from "@/types/onboarding";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Brain, Server, Cloud, AlertTriangle } from "lucide-react";

interface Props {
  data: RequirementAssessment;
  onChange: (data: RequirementAssessment) => void;
}

const ENVIRONMENTS = [
  { id: "development", label: "Development Sandbox" },
  { id: "production", label: "Production" },
];

const PROVIDERS = [
  { id: "AWS", label: "AWS", color: "bg-warning/10 text-warning border-warning/20" },
  { id: "Azure", label: "Azure", color: "bg-primary/10 text-primary border-primary/20" },
  { id: "GCP", label: "GCP", color: "bg-success/10 text-success border-success/20" },
  { id: "On-Prem", label: "On-Prem", color: "bg-muted text-muted-foreground border-border" },
];

export const StepRequirementAssessment = ({ data, onChange }: Props) => {
  const isGenAI = data.solutionType === "generative-ai";

  const toggleEnvironment = (env: string) => {
    const envs = data.deploymentEnvironments.includes(env)
      ? data.deploymentEnvironments.filter((e) => e !== env)
      : [...data.deploymentEnvironments, env];
    onChange({ ...data, deploymentEnvironments: envs });
  };

  const toggleProvider = (provider: string) => {
    const providers = data.cloudProviders.includes(provider)
      ? data.cloudProviders.filter((p) => p !== provider)
      : [...data.cloudProviders, provider];
    onChange({ ...data, cloudProviders: providers });
  };

  return (
    <div className="space-y-8">
      {/* Solution Type */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          1. What kind of solution are you looking to host?
        </Label>
        <RadioGroup
          value={data.solutionType}
          onValueChange={(v) => {
            const newData = { ...data, solutionType: v as RequirementAssessment["solutionType"] };
            if (v === "generative-ai") {
              newData.deploymentEnvironments = ["development"];
            }
            onChange(newData);
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${data.solutionType === "generative-ai" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
            <RadioGroupItem value="generative-ai" className="mt-1" />
            <div>
              <p className="font-medium">Generative AI</p>
              <p className="text-sm text-muted-foreground">LLM, NLP, Computer Vision, GenAI POC</p>
              <Badge variant="outline" className="mt-2 text-[10px]">Dev Sandbox Only</Badge>
            </div>
          </label>
          <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${data.solutionType === "non-generative-ai" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
            <RadioGroupItem value="non-generative-ai" className="mt-1" />
            <div>
              <p className="font-medium">Non-Generative AI</p>
              <p className="text-sm text-muted-foreground">Web Apps, APIs, Databases, Microservices</p>
              <Badge variant="outline" className="mt-2 text-[10px]">All Environments</Badge>
            </div>
          </label>
        </RadioGroup>
      </div>

      {/* Deployment Environment */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          2. Select Deployment Environment
        </Label>
        {isGenAI && (
          <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <span>For Generative AI projects, only Development Sandbox is available per security policy.</span>
          </div>
        )}
        <div className="flex gap-4">
          {ENVIRONMENTS.map((env) => {
            const disabled = isGenAI && env.id === "production";
            const checked = data.deploymentEnvironments.includes(env.id);
            return (
              <label key={env.id} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${disabled ? "opacity-50 cursor-not-allowed" : checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                <Checkbox checked={checked} disabled={disabled} onCheckedChange={() => !disabled && toggleEnvironment(env.id)} />
                <span className="text-sm font-medium">{env.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Cloud Provider */}
      <div className="space-y-4">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          3. Select Cloud Provider(s)
          <Badge variant="secondary" className="text-[10px]">Multiple Select</Badge>
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PROVIDERS.map((p) => {
            const checked = data.cloudProviders.includes(p.id);
            return (
              <label key={p.id} className={`flex items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all text-center justify-center ${checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                <Checkbox checked={checked} onCheckedChange={() => toggleProvider(p.id)} />
                <span className="text-sm font-semibold">{p.label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};
