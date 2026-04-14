import { useState, useEffect } from "react";
import { type Recommendation } from "@/types/onboarding";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Props {
  data: Recommendation[];
  solutionType: string;
  onChange: (data: Recommendation[]) => void;
}

const generateRecommendations = (solutionType: string): Recommendation[] => {
  const base: Recommendation[] = [
    { id: "gps-1", category: "gps", title: "GPS for Cloud Infrastructure", description: "Raise GPS for compute, storage and networking resources in the TCS GPS portal.", status: "pending" },
    { id: "gps-2", category: "gps", title: "GPS for SSL Certificate", description: "SSL certificate purchase via GPS with ISM approval for production domains.", status: "pending" },
    { id: "rfc-1", category: "rfc", title: "RFC for AD Group Creation", description: "Create AD groups for cloud domain and subscription access & identity management.", status: "pending" },
    { id: "rfc-2", category: "rfc", title: "RFC for CyberArk Onboarding", description: "User onboarding on CyberArk portal for secure credential management.", status: "pending" },
    { id: "rfc-3", category: "rfc", title: "RFC for Cloud Portal Access", description: "User access on cloud portal for resource management.", status: "pending" },
    { id: "approval-1", category: "approval", title: "Architecture Approval from ISM", description: "Get architecture validated and approved by unit ISM before provisioning.", status: "pending" },
    { id: "approval-2", category: "approval", title: "GPS Approval", description: "GPS raised in applicable category by project with relevant artefacts.", status: "pending" },
  ];

  if (solutionType === "generative-ai") {
    base.push(
      { id: "approval-3", category: "approval", title: "Approval from Legals", description: "Legal approval required for non-TCS approved LLM models.", status: "pending" },
      { id: "approval-4", category: "approval", title: "Approval for Data Privacy", description: "Data privacy clearance for GenAI application data handling.", status: "pending" },
    );
  }
  return base;
};

export const StepRecommendations = ({ data, solutionType, onChange }: Props) => {
  const [activeTab, setActiveTab] = useState("gps");

  useEffect(() => {
    if (data.length === 0) {
      onChange(generateRecommendations(solutionType));
    }
  }, []);

  const applyRecommendation = (id: string) => {
    onChange(data.map((r) => (r.id === id ? { ...r, status: "applied" as const } : r)));
    toast({ title: "Recommendation Applied", description: "The recommendation has been marked as applied." });
  };

  const filterByCategory = (cat: string) => data.filter((r) => r.category === cat);

  const statusBadge = (status: string) => {
    switch (status) {
      case "applied": return <Badge className="bg-success/10 text-success border-success/20">Applied</Badge>;
      case "recommended": return <Badge className="bg-info/10 text-info border-info/20">Recommended</Badge>;
      default: return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="gps">GPS ({filterByCategory("gps").length})</TabsTrigger>
          <TabsTrigger value="rfc">RFC ({filterByCategory("rfc").length})</TabsTrigger>
          <TabsTrigger value="approval">Approval Lists ({filterByCategory("approval").length})</TabsTrigger>
        </TabsList>

        {["gps", "rfc", "approval"].map((cat) => (
          <TabsContent key={cat} value={cat} className="space-y-3">
            {filterByCategory(cat).map((rec) => (
              <div key={rec.id} className="flex items-start justify-between p-4 border rounded-lg hover:shadow-card-hover transition-shadow">
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{rec.title}</span>
                    {statusBadge(rec.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
                {rec.status !== "applied" && (
                  <Button variant="outline" size="sm" onClick={() => applyRecommendation(rec.id)}>
                    <Check className="h-4 w-4 mr-1" /> Apply
                  </Button>
                )}
              </div>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {solutionType === "generative-ai" && (
        <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 text-sm">
          <strong>GenAI Note:</strong> Additional approvals from Legal and Data Privacy teams are required for Generative AI projects.
        </div>
      )}
    </div>
  );
};
