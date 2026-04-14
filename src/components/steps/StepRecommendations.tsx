import { useState, useEffect } from "react";
import { type Recommendation } from "@/types/onboarding";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, FileText, ShieldCheck, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface Props {
  data: Recommendation[];
  solutionType: string;
  onChange: (data: Recommendation[]) => void;
}

interface DetailedRecommendation {
  id: string;
  category: "gps" | "rfc" | "approval";
  title: string;
  summary: string;
  parameters: { label: string; value: string }[];
  copyText: string;
}

const generateDetailedRecommendations = (solutionType: string): DetailedRecommendation[] => {
  const recs: DetailedRecommendation[] = [
    {
      id: "gps-1",
      category: "gps",
      title: "GPS – Cloud Infrastructure Provisioning",
      summary: "Raise a GPS request for compute, storage, and networking resources required for the project environment.",
      parameters: [
        { label: "GPS Category", value: "Cloud Infrastructure – IaaS Provisioning" },
        { label: "Request Type", value: "New Resource Provisioning" },
        { label: "Priority", value: "High" },
        { label: "Business Justification", value: "Project requires dedicated cloud infrastructure for application hosting, data storage, and network connectivity as per approved architecture." },
        { label: "Cost Center", value: "To be filled by requestor" },
        { label: "Estimated Monthly Cost", value: "Refer to cloud resource bucket estimation" },
        { label: "Approval Chain", value: "Project Manager → Delivery Head → ISM → DIS CloudOps" },
        { label: "SLA", value: "5 business days post-approval" },
      ],
      copyText: `GPS Request: Cloud Infrastructure Provisioning
Category: Cloud Infrastructure – IaaS Provisioning
Request Type: New Resource Provisioning
Priority: High
Business Justification: Project requires dedicated cloud infrastructure for application hosting, data storage, and network connectivity as per approved architecture.
Cost Center: [Fill Cost Center]
Estimated Monthly Cost: [Refer to Cloud Resource Bucket]
Approval Chain: Project Manager → Delivery Head → ISM → DIS CloudOps
SLA: 5 business days post-approval`,
    },
    {
      id: "gps-2",
      category: "gps",
      title: "GPS – SSL/TLS Certificate Procurement",
      summary: "Raise a GPS for purchasing SSL/TLS certificates for production and staging domains.",
      parameters: [
        { label: "GPS Category", value: "Security – Certificate Management" },
        { label: "Certificate Type", value: "Wildcard / SAN SSL Certificate" },
        { label: "Domain(s)", value: "To be specified by project team" },
        { label: "Validity", value: "1 Year (Auto-Renewal Recommended)" },
        { label: "Vendor", value: "DigiCert / Let's Encrypt (as per org policy)" },
        { label: "Environment", value: "Production, Staging" },
        { label: "Approval Required From", value: "ISM, Security Team" },
        { label: "SLA", value: "3 business days post-approval" },
      ],
      copyText: `GPS Request: SSL/TLS Certificate Procurement
Category: Security – Certificate Management
Certificate Type: Wildcard / SAN SSL Certificate
Domain(s): [Specify Domains]
Validity: 1 Year (Auto-Renewal Recommended)
Vendor: DigiCert / Let's Encrypt (as per org policy)
Environment: Production, Staging
Approval Required From: ISM, Security Team
SLA: 3 business days post-approval`,
    },
    {
      id: "gps-3",
      category: "gps",
      title: "GPS – Monitoring & Logging Setup",
      summary: "Raise a GPS to provision centralized monitoring, alerting, and log aggregation services.",
      parameters: [
        { label: "GPS Category", value: "Operations – Observability Setup" },
        { label: "Tools Requested", value: "CloudWatch / Azure Monitor / Stackdriver + ELK/Splunk" },
        { label: "Log Retention", value: "90 days (Hot), 1 year (Cold Archive)" },
        { label: "Alert Channels", value: "Email, MS Teams, PagerDuty" },
        { label: "Dashboards Required", value: "Infra Health, Application Metrics, Cost Tracking" },
        { label: "Approval Required From", value: "Project Manager, DIS CloudOps" },
        { label: "SLA", value: "4 business days post-approval" },
      ],
      copyText: `GPS Request: Monitoring & Logging Setup
Category: Operations – Observability Setup
Tools Requested: CloudWatch / Azure Monitor / Stackdriver + ELK/Splunk
Log Retention: 90 days (Hot), 1 year (Cold Archive)
Alert Channels: Email, MS Teams, PagerDuty
Dashboards Required: Infra Health, Application Metrics, Cost Tracking
Approval Required From: Project Manager, DIS CloudOps
SLA: 4 business days post-approval`,
    },
    {
      id: "rfc-1",
      category: "rfc",
      title: "RFC – Active Directory Group Creation",
      summary: "Create AD security groups for cloud subscription access, RBAC role assignments, and identity governance.",
      parameters: [
        { label: "RFC Category", value: "Identity & Access Management" },
        { label: "Change Type", value: "Standard Change" },
        { label: "AD Group Name(s)", value: "SG-Cloud-<ProjectCode>-Admin, SG-Cloud-<ProjectCode>-Contributor, SG-Cloud-<ProjectCode>-Reader" },
        { label: "Group Type", value: "Security Group (Mail-enabled optional)" },
        { label: "Group Scope", value: "Global" },
        { label: "Owner", value: "Project Lead / Delivery Manager" },
        { label: "Members", value: "As per project RACI matrix" },
        { label: "Linked Subscription/Resource Group", value: "To be mapped post-provisioning" },
        { label: "Justification", value: "RBAC-based access control for cloud resources as per least-privilege principle." },
        { label: "Approval Required From", value: "IAM Team Lead, ISM" },
        { label: "SLA", value: "3 business days" },
      ],
      copyText: `RFC: Active Directory Group Creation
Category: Identity & Access Management
Change Type: Standard Change
AD Group Names: SG-Cloud-<ProjectCode>-Admin, SG-Cloud-<ProjectCode>-Contributor, SG-Cloud-<ProjectCode>-Reader
Group Type: Security Group
Scope: Global
Owner: [Project Lead / Delivery Manager]
Members: As per project RACI matrix
Linked Subscription: To be mapped post-provisioning
Justification: RBAC-based access control for cloud resources as per least-privilege principle.
Approval Required From: IAM Team Lead, ISM
SLA: 3 business days`,
    },
    {
      id: "rfc-2",
      category: "rfc",
      title: "RFC – CyberArk Privileged Access Onboarding",
      summary: "Onboard service accounts and privileged users onto CyberArk for secure credential vaulting and session management.",
      parameters: [
        { label: "RFC Category", value: "Security – Privileged Access Management" },
        { label: "Change Type", value: "Standard Change" },
        { label: "Account Type", value: "Service Account / Admin Account" },
        { label: "Platform", value: "AWS / Azure / GCP / Windows / Linux" },
        { label: "Safe Name", value: "Safe-<ProjectCode>-Cloud" },
        { label: "Credential Rotation Policy", value: "Every 30 days (Auto-Rotate)" },
        { label: "Session Recording", value: "Enabled for all privileged sessions" },
        { label: "Access Window", value: "Business hours (09:00–18:00 IST) unless exception approved" },
        { label: "Justification", value: "Compliance with enterprise PAM policy for cloud infrastructure management." },
        { label: "Approval Required From", value: "CyberArk Admin Team, Security Officer" },
        { label: "SLA", value: "5 business days" },
      ],
      copyText: `RFC: CyberArk Privileged Access Onboarding
Category: Security – Privileged Access Management
Change Type: Standard Change
Account Type: Service Account / Admin Account
Platform: [AWS / Azure / GCP / Windows / Linux]
Safe Name: Safe-<ProjectCode>-Cloud
Credential Rotation: Every 30 days (Auto-Rotate)
Session Recording: Enabled
Access Window: Business hours (09:00–18:00 IST)
Justification: Compliance with enterprise PAM policy for cloud infrastructure management.
Approval Required From: CyberArk Admin Team, Security Officer
SLA: 5 business days`,
    },
    {
      id: "rfc-3",
      category: "rfc",
      title: "RFC – Cloud Portal User Access Provisioning",
      summary: "Grant named users access to the cloud management portal with appropriate RBAC roles for resource management.",
      parameters: [
        { label: "RFC Category", value: "Access Management – Cloud Portal" },
        { label: "Change Type", value: "Standard Change" },
        { label: "Portal", value: "AWS Console / Azure Portal / GCP Console" },
        { label: "Role Assignment", value: "Contributor (non-prod), Reader (prod) – customizable" },
        { label: "MFA Requirement", value: "Mandatory – Azure AD / Okta MFA" },
        { label: "Access Duration", value: "Project duration (review every 90 days)" },
        { label: "User List", value: "To be attached as per project team roster" },
        { label: "Conditional Access Policy", value: "Geo-restricted to approved regions, compliant devices only" },
        { label: "Justification", value: "Operational access required for cloud resource deployment and monitoring." },
        { label: "Approval Required From", value: "Project Manager, IAM Team, ISM" },
        { label: "SLA", value: "2 business days" },
      ],
      copyText: `RFC: Cloud Portal User Access Provisioning
Category: Access Management – Cloud Portal
Change Type: Standard Change
Portal: [AWS Console / Azure Portal / GCP Console]
Role Assignment: Contributor (non-prod), Reader (prod)
MFA: Mandatory – Azure AD / Okta MFA
Access Duration: Project duration (review every 90 days)
User List: [Attach team roster]
Conditional Access: Geo-restricted, compliant devices only
Justification: Operational access required for cloud resource deployment and monitoring.
Approval Required From: Project Manager, IAM Team, ISM
SLA: 2 business days`,
    },
    {
      id: "rfc-4",
      category: "rfc",
      title: "RFC – Firewall Rule & Network Security Group Update",
      summary: "Open required network ports and configure NSG/Security Group rules for application connectivity.",
      parameters: [
        { label: "RFC Category", value: "Network Security – Firewall Change" },
        { label: "Change Type", value: "Normal Change" },
        { label: "Source", value: "Application Subnet / VPN CIDR" },
        { label: "Destination", value: "Database Subnet / External API endpoints" },
        { label: "Ports/Protocols", value: "443 (HTTPS), 5432 (PostgreSQL), 6379 (Redis) – as applicable" },
        { label: "Direction", value: "Inbound & Outbound" },
        { label: "Rule Expiry", value: "Permanent (reviewed quarterly)" },
        { label: "Risk Assessment", value: "Low – internal traffic within VPC/VNet" },
        { label: "Justification", value: "Application-tier to data-tier connectivity as per approved architecture diagram." },
        { label: "Approval Required From", value: "Network Team, Security Officer, ISM" },
        { label: "SLA", value: "3 business days" },
      ],
      copyText: `RFC: Firewall Rule & NSG Update
Category: Network Security – Firewall Change
Change Type: Normal Change
Source: Application Subnet / VPN CIDR
Destination: Database Subnet / External API endpoints
Ports/Protocols: 443 (HTTPS), 5432 (PostgreSQL), 6379 (Redis)
Direction: Inbound & Outbound
Rule Expiry: Permanent (quarterly review)
Risk Assessment: Low – internal VPC/VNet traffic
Justification: App-tier to data-tier connectivity per approved architecture.
Approval Required From: Network Team, Security Officer, ISM
SLA: 3 business days`,
    },
    {
      id: "approval-1",
      category: "approval",
      title: "Architecture Approval from ISM",
      summary: "Submit the finalized architecture diagram and resource plan to the unit ISM for security and compliance validation.",
      parameters: [
        { label: "Submission To", value: "Unit Information Security Manager (ISM)" },
        { label: "Artifacts Required", value: "Architecture Diagram, Data Flow Diagram, Network Topology, Security Controls Matrix" },
        { label: "Review Criteria", value: "Data classification, encryption standards, network segmentation, access controls, backup strategy" },
        { label: "Expected Turnaround", value: "3–5 business days" },
      ],
      copyText: `Approval Request: Architecture Validation
Submit To: Unit ISM
Artifacts: Architecture Diagram, Data Flow Diagram, Network Topology, Security Controls Matrix
Review Criteria: Data classification, encryption, network segmentation, access controls, backup strategy
Turnaround: 3–5 business days`,
    },
    {
      id: "approval-2",
      category: "approval",
      title: "GPS Approval from Delivery Head",
      summary: "Get all raised GPS requests approved by the Delivery Head and relevant cost center owner.",
      parameters: [
        { label: "Submission To", value: "Delivery Head / Cost Center Owner" },
        { label: "Artifacts Required", value: "GPS Request IDs, Cost Estimation Sheet, Project SOW reference" },
        { label: "Review Criteria", value: "Budget alignment, resource justification, project timeline" },
        { label: "Expected Turnaround", value: "2–3 business days" },
      ],
      copyText: `Approval Request: GPS Sign-off
Submit To: Delivery Head / Cost Center Owner
Artifacts: GPS Request IDs, Cost Estimation Sheet, Project SOW
Review Criteria: Budget alignment, resource justification, timeline
Turnaround: 2–3 business days`,
    },
  ];

  if (solutionType === "generative-ai") {
    recs.push(
      {
        id: "approval-3",
        category: "approval",
        title: "Legal Approval for LLM Usage",
        summary: "Obtain legal clearance for using non-TCS-approved LLM models, including IP and licensing review.",
        parameters: [
          { label: "Submission To", value: "Legal & Compliance Team" },
          { label: "Artifacts Required", value: "LLM Model List, Data Handling Policy, Licensing Terms, Use Case Description" },
          { label: "Review Criteria", value: "IP ownership, data residency, model licensing, output liability" },
          { label: "Expected Turnaround", value: "5–7 business days" },
        ],
        copyText: `Approval Request: LLM Legal Clearance
Submit To: Legal & Compliance Team
Artifacts: LLM Model List, Data Handling Policy, Licensing Terms, Use Case Description
Review Criteria: IP ownership, data residency, licensing, output liability
Turnaround: 5–7 business days`,
      },
      {
        id: "approval-4",
        category: "approval",
        title: "Data Privacy Clearance for GenAI",
        summary: "Data privacy impact assessment and clearance for GenAI application data processing pipelines.",
        parameters: [
          { label: "Submission To", value: "Data Privacy Officer (DPO)" },
          { label: "Artifacts Required", value: "DPIA Document, Data Flow Diagram, PII Inventory, Consent Mechanism Details" },
          { label: "Review Criteria", value: "GDPR/DPDP compliance, data minimization, anonymization, cross-border transfer" },
          { label: "Expected Turnaround", value: "5–10 business days" },
        ],
        copyText: `Approval Request: GenAI Data Privacy Clearance
Submit To: Data Privacy Officer (DPO)
Artifacts: DPIA Document, Data Flow Diagram, PII Inventory, Consent Mechanism
Review Criteria: GDPR/DPDP compliance, data minimization, anonymization, cross-border transfer
Turnaround: 5–10 business days`,
      }
    );
  }

  return recs;
};

const categoryIcon = (cat: string) => {
  switch (cat) {
    case "gps": return <ClipboardList className="h-4 w-4" />;
    case "rfc": return <FileText className="h-4 w-4" />;
    case "approval": return <ShieldCheck className="h-4 w-4" />;
    default: return null;
  }
};

export const StepRecommendations = ({ data, solutionType, onChange }: Props) => {
  const [activeTab, setActiveTab] = useState("gps");
  const [detailedRecs, setDetailedRecs] = useState<DetailedRecommendation[]>([]);

  useEffect(() => {
    setDetailedRecs(generateDetailedRecommendations(solutionType));
    if (data.length === 0) {
      // Sync basic recommendation data for state tracking
      const basic: import("@/types/onboarding").Recommendation[] = generateDetailedRecommendations(solutionType).map(r => ({
        id: r.id,
        category: r.category,
        title: r.title,
        description: r.summary,
        status: "recommended" as const,
      }));
      onChange(basic);
    }
  }, []);

  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to Clipboard", description: `"${title}" details copied. Paste it into your GPS/RFC portal.` });
  };

  const filterByCategory = (cat: string) => detailedRecs.filter((r) => r.category === cat);

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 border rounded-lg p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">AI-Generated Recommendations:</strong> Based on your project requirements, the following GPS requests, RFC change requests, and approval items have been generated. Copy the details and raise them in your organization's respective portals.
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="gps" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> GPS Requests ({filterByCategory("gps").length})</TabsTrigger>
          <TabsTrigger value="rfc" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> RFC Change Requests ({filterByCategory("rfc").length})</TabsTrigger>
          <TabsTrigger value="approval" className="gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Approval Checklist ({filterByCategory("approval").length})</TabsTrigger>
        </TabsList>

        {["gps", "rfc", "approval"].map((cat) => (
          <TabsContent key={cat} value={cat} className="space-y-4 mt-4">
            {filterByCategory(cat).map((rec) => (
              <div key={rec.id} className="border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-muted/30 border-b">
                  <div className="flex items-center gap-2">
                    {categoryIcon(rec.category)}
                    <span className="font-semibold">{rec.title}</span>
                    <Badge variant="secondary" className="text-xs">AI Recommended</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(rec.copyText, rec.title)}
                    className="gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy for Portal
                  </Button>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">{rec.summary}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {rec.parameters.map((param, idx) => (
                      <div key={idx} className="flex flex-col gap-0.5 p-2 bg-muted/20 rounded text-sm">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{param.label}</span>
                        <span className="text-foreground">{param.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {solutionType === "generative-ai" && (
        <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 text-sm">
          <strong>GenAI Note:</strong> Additional approvals from Legal and Data Privacy teams are required for Generative AI projects. These have been included in the Approval Checklist tab.
        </div>
      )}
    </div>
  );
};
