import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const StepIndicator = ({ steps, currentStep, onStepClick }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-between max-w-5xl mx-auto">
      {steps.map((step, i) => {
        const isComplete = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => onStepClick(step.id)}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                  isComplete && "bg-success text-success-foreground",
                  isCurrent && "gradient-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-card",
                  !isComplete && !isCurrent && "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20"
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium text-center leading-tight max-w-[80px]",
                  isCurrent ? "text-primary" : isComplete ? "text-success" : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-2 mt-[-16px]", isComplete ? "bg-success" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
};
