import { useState } from "react";
import { STEPS, type OnboardingState } from "@/types/onboarding";
import { StepIndicator } from "./StepIndicator";
import { TopNav } from "./TopNav";
import { StepAccountDetails } from "./steps/StepAccountDetails";
import { StepRequirementAssessment } from "./steps/StepRequirementAssessment";
import { StepCloudResources } from "./steps/StepCloudResources";
import { StepArchitectureOverview } from "./steps/StepArchitectureOverview";
import { StepRecommendations } from "./steps/StepRecommendations";
import { StepApprovalTracker } from "./steps/StepApprovalTracker";
import { StepServiceIdCreation } from "./steps/StepServiceIdCreation";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const initialState: OnboardingState = {
  currentStep: 1,
  accountDetails: {
    projectName: "", isu: "", accountName: "", owner: "", empId: "", description: "", businessUnit: "",
  },
  requirementAssessment: {
    solutionType: "", deploymentEnvironments: [], cloudProviders: [], region: "",
  },
  cloudResources: [],
  architectureOverview: {
    uploadedDiagram: null, generatedFromBucket: false, securityViolations: [], revisedDiagram: null, analysisComplete: false,
  },
  recommendations: [],
  approvals: [],
  serviceId: {
    serviceId: "", status: "not-started", disTeamAssigned: "", createdDate: null,
  },
};

export const OnboardingWizard = () => {
  const [state, setState] = useState<OnboardingState>(initialState);

  const updateState = <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const goNext = () => {
    if (state.currentStep < 7) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const goPrev = () => {
    if (state.currentStep > 1) {
      setState((prev) => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };

  const goToStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  };

  const handleSave = () => {
    toast({ title: "Progress Saved", description: "Your onboarding data has been saved as draft." });
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1: return <StepAccountDetails data={state.accountDetails} onChange={(d) => updateState("accountDetails", d)} />;
      case 2: return <StepRequirementAssessment data={state.requirementAssessment} onChange={(d) => updateState("requirementAssessment", d)} />;
      case 3: return <StepCloudResources data={state.cloudResources} providers={state.requirementAssessment.cloudProviders} onChange={(d) => updateState("cloudResources", d)} />;
      case 4: return <StepArchitectureOverview data={state.architectureOverview} onChange={(d) => updateState("architectureOverview", d)} />;
      case 5: return <StepRecommendations data={state.recommendations} solutionType={state.requirementAssessment.solutionType} onChange={(d) => updateState("recommendations", d)} />;
      case 6: return <StepApprovalTracker data={state.approvals} solutionType={state.requirementAssessment.solutionType} onChange={(d) => updateState("approvals", d)} />;
      case 7: return <StepServiceIdCreation data={state.serviceId} onChange={(d) => updateState("serviceId", d)} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-card px-6 py-4">
          <StepIndicator steps={STEPS} currentStep={state.currentStep} onStepClick={goToStep} />
        </div>
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground">
                {STEPS[state.currentStep - 1].title}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Step {state.currentStep} of {STEPS.length} — {STEPS[state.currentStep - 1].description}
              </p>
            </div>
            <div className="bg-card rounded-lg border shadow-card p-6">
              {renderStep()}
            </div>
          </div>
        </div>
        <div className="border-t bg-card px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Button variant="outline" onClick={goPrev} disabled={state.currentStep === 1}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button variant="ghost" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" /> Save Draft
            </Button>
            {state.currentStep < 7 ? (
              <Button onClick={goNext} className="gradient-primary text-primary-foreground">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={() => toast({ title: "Onboarding Complete!", description: "Your cloud onboarding request has been submitted." })} className="gradient-accent text-accent-foreground">
                Submit Request
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
