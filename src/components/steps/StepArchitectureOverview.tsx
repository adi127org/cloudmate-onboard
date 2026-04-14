import { type ArchitectureOverview } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Cpu, ShieldAlert, ShieldCheck, FileImage } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  data: ArchitectureOverview;
  onChange: (data: ArchitectureOverview) => void;
}

export const StepArchitectureOverview = ({ data, onChange }: Props) => {
  const handleUpload = () => {
    onChange({ ...data, uploadedDiagram: "architecture_v1.png" });
    toast({ title: "Diagram Uploaded", description: "Architecture diagram has been uploaded successfully." });
  };

  const handleGenerate = () => {
    onChange({ ...data, generatedFromBucket: true, uploadedDiagram: "generated_arch.png" });
    toast({ title: "Diagram Generated", description: "Architecture diagram generated from your resource bucket configuration." });
  };

  const handleAnalyze = () => {
    const violations = [
      "Port 22 (SSH) exposed to 0.0.0.0/0 — restrict to VPN CIDR",
      "RDS instance is publicly accessible — move to private subnet",
      "No WAF configured for internet-facing ALB",
    ];
    onChange({ ...data, securityViolations: violations, analysisComplete: true });
    toast({ title: "Analysis Complete", description: `Found ${violations.length} security findings.` });
  };

  const handleRevise = () => {
    onChange({ ...data, revisedDiagram: "revised_architecture_v2.png", securityViolations: [] });
    toast({ title: "Architecture Revised", description: "Revised architecture diagram has been generated with security fixes applied." });
  };

  return (
    <div className="space-y-8">
      {/* Upload or Generate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer" onClick={handleUpload}>
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">Upload Architecture Diagram</p>
          <p className="text-sm text-muted-foreground mt-1">Drag & drop or click to upload (.png, .pdf, .vsdx)</p>
          {data.uploadedDiagram && !data.generatedFromBucket && (
            <Badge className="mt-3" variant="secondary">✓ {data.uploadedDiagram}</Badge>
          )}
        </div>
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-accent/50 transition-colors cursor-pointer" onClick={handleGenerate}>
          <Cpu className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">Generate from Resource Bucket</p>
          <p className="text-sm text-muted-foreground mt-1">Auto-generate architecture from your configured resources</p>
          {data.generatedFromBucket && (
            <Badge className="mt-3" variant="secondary">✓ Generated</Badge>
          )}
        </div>
      </div>

      {/* Analysis */}
      {data.uploadedDiagram && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-warning" /> Security & Network Analysis
            </h3>
            {!data.analysisComplete && (
              <Button onClick={handleAnalyze} variant="outline">Run Analysis</Button>
            )}
          </div>

          {data.analysisComplete && data.securityViolations.length > 0 && (
            <div className="space-y-2">
              {data.securityViolations.map((v, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-sm">
                  <ShieldAlert className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <span>{v}</span>
                </div>
              ))}
              <Button onClick={handleRevise} className="gradient-accent text-accent-foreground mt-4">
                Generate Revised Architecture
              </Button>
            </div>
          )}

          {data.revisedDiagram && (
            <div className="border rounded-lg p-6 bg-success/5 border-success/20">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-5 w-5 text-success" />
                <span className="font-semibold text-success">Revised Architecture Ready</span>
              </div>
              <div className="bg-muted rounded-lg h-48 flex items-center justify-center">
                <FileImage className="h-16 w-16 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                All security violations have been addressed. The revised diagram includes private subnets, WAF configuration, and restricted SSH access.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
