import { type AccountDetails } from "@/types/onboarding";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, User, FileText, Hash } from "lucide-react";

interface Props {
  data: AccountDetails;
  onChange: (data: AccountDetails) => void;
}

export const StepAccountDetails = ({ data, onChange }: Props) => {
  const update = (field: keyof AccountDetails, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4 text-primary" /> Project Name <span className="text-destructive">*</span>
          </Label>
          <Input placeholder="Enter project name" value={data.projectName} onChange={(e) => update("projectName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Hash className="h-4 w-4 text-primary" /> ISU
          </Label>
          <Input placeholder="Enter ISU code" value={data.isu} onChange={(e) => update("isu", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Building2 className="h-4 w-4 text-primary" /> Account Name <span className="text-destructive">*</span>
          </Label>
          <Input placeholder="Enter account name" value={data.accountName} onChange={(e) => update("accountName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <User className="h-4 w-4 text-primary" /> Owner (Employee ID) <span className="text-destructive">*</span>
          </Label>
          <Input placeholder="Enter employee ID" value={data.empId} onChange={(e) => update("empId", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Owner Name</Label>
          <Input placeholder="Enter owner name" value={data.owner} onChange={(e) => update("owner", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Business Unit</Label>
          <Select value={data.businessUnit} onValueChange={(v) => update("businessUnit", v)}>
            <SelectTrigger><SelectValue placeholder="Select business unit" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BFSI">BFSI</SelectItem>
              <SelectItem value="Manufacturing">Manufacturing</SelectItem>
              <SelectItem value="Retail">Retail</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Energy">Energy & Utilities</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Project Description</Label>
        <Textarea placeholder="Brief description of the project and its requirements..." value={data.description} onChange={(e) => update("description", e.target.value)} rows={3} />
      </div>
      <div className="bg-info/5 border border-info/20 rounded-lg p-4 text-sm text-muted-foreground">
        <strong className="text-info">Note:</strong> All fields marked with <span className="text-destructive">*</span> are mandatory. Ensure the ISU and Employee ID are valid and registered in the TCS portal.
      </div>
    </div>
  );
};
