export interface AccountDetails {
  projectName: string;
  isu: string;
  accountName: string;
  owner: string;
  empId: string;
  description: string;
  businessUnit: string;
}

export interface RequirementAssessment {
  solutionType: 'generative-ai' | 'non-generative-ai' | '';
  deploymentEnvironments: string[];
  cloudProviders: string[];
  region: string;
}

export interface CloudResource {
  id: string;
  service: string;
  count: number;
  configDetails: string;
}

export interface CloudResourceBucket {
  provider: string;
  resources: CloudResource[];
}

export interface ArchitectureOverview {
  uploadedDiagram: string | null;
  generatedFromBucket: boolean;
  securityViolations: string[];
  revisedDiagram: string | null;
  analysisComplete: boolean;
}

export interface Recommendation {
  id: string;
  category: 'gps' | 'rfc' | 'approval';
  title: string;
  description: string;
  status: 'pending' | 'recommended' | 'applied';
}

export interface ApprovalItem {
  id: string;
  type: 'gps' | 'rfc' | 'other';
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
  approver: string;
  submittedDate: string;
  lastReminder: string | null;
  reminderCount: number;
  comments: string[];
}

export interface ServiceIdCreation {
  serviceId: string;
  status: 'not-started' | 'initiated' | 'in-progress' | 'completed';
  disTeamAssigned: string;
  createdDate: string | null;
}

export interface OnboardingState {
  currentStep: number;
  accountDetails: AccountDetails;
  requirementAssessment: RequirementAssessment;
  cloudResources: CloudResourceBucket[];
  architectureOverview: ArchitectureOverview;
  recommendations: Recommendation[];
  approvals: ApprovalItem[];
  serviceId: ServiceIdCreation;
}

export const STEPS = [
  { id: 1, title: 'Account Details', description: 'Project & account info' },
  { id: 2, title: 'Requirement Assessment', description: 'Solution & environment' },
  { id: 3, title: 'Cloud Resources', description: 'Resource bucket config' },
  { id: 4, title: 'Architecture Overview', description: 'Diagram & analysis' },
  { id: 5, title: 'Recommendations', description: 'GPS, RFC & approvals' },
  { id: 6, title: 'Approval Tracker', description: 'Track & remind' },
  { id: 7, title: 'Service ID Creation', description: 'Final provisioning' },
];

export const AWS_SERVICES = ['EC2', 'RDS', 'EKS', 'S3', 'Lambda', 'CloudFront', 'ElastiCache', 'SQS', 'SNS', 'DynamoDB'];
export const AZURE_SERVICES = ['Virtual Machines', 'AKS', 'Azure OpenAI', 'Azure SQL', 'Blob Storage', 'App Service', 'Azure Functions', 'CosmosDB', 'Azure Cache', 'Service Bus'];
export const GCP_SERVICES = ['Compute Engine', 'GKE', 'Vertex AI', 'Cloud SQL', 'Cloud Storage', 'Cloud Functions', 'BigQuery', 'Pub/Sub', 'Memorystore', 'Cloud CDN'];
export const ONPREM_SERVICES = ['Physical Servers', 'VMware VMs', 'Storage Arrays', 'Load Balancers', 'Firewalls'];

export const REGIONS: Record<string, { label: string; value: string }[]> = {
  AWS: [
    { label: 'ap-south-1 (Mumbai)', value: 'ap-south-1' },
    { label: 'us-east-1 (N. Virginia)', value: 'us-east-1' },
    { label: 'eu-west-2 (London)', value: 'eu-west-2' },
  ],
  Azure: [
    { label: 'Central India (Pune)', value: 'central-india' },
  ],
  GCP: [
    { label: 'asia-south1-a (Mumbai)', value: 'asia-south1-a' },
  ],
  'On-Prem': [
    { label: 'On-Premises DC', value: 'on-prem' },
  ],
};
