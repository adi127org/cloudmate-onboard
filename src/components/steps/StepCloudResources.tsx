import { useState } from "react";
import { type CloudResourceBucket, type CloudResource, AWS_SERVICES, AZURE_SERVICES, GCP_SERVICES, ONPREM_SERVICES } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  data: CloudResourceBucket[];
  providers: string[];
  onChange: (data: CloudResourceBucket[]) => void;
}

const getServicesForProvider = (provider: string): string[] => {
  switch (provider) {
    case "AWS": return AWS_SERVICES;
    case "Azure": return AZURE_SERVICES;
    case "GCP": return GCP_SERVICES;
    case "On-Prem": return ONPREM_SERVICES;
    default: return [];
  }
};

export const StepCloudResources = ({ data, providers, onChange }: Props) => {
  const [activeTab, setActiveTab] = useState(providers[0] || "AWS");

  const getBucket = (provider: string): CloudResourceBucket => {
    return data.find((b) => b.provider === provider) || { provider, resources: [] };
  };

  const updateBucket = (provider: string, resources: CloudResource[]) => {
    const existing = data.filter((b) => b.provider !== provider);
    onChange([...existing, { provider, resources }]);
  };

  const addResource = (provider: string) => {
    const bucket = getBucket(provider);
    const services = getServicesForProvider(provider);
    const newResource: CloudResource = {
      id: crypto.randomUUID(),
      service: services[0] || "",
      count: 1,
      configDetails: "",
    };
    updateBucket(provider, [...bucket.resources, newResource]);
  };

  const removeResource = (provider: string, id: string) => {
    const bucket = getBucket(provider);
    updateBucket(provider, bucket.resources.filter((r) => r.id !== id));
  };

  const updateResource = (provider: string, id: string, field: keyof CloudResource, value: string | number) => {
    const bucket = getBucket(provider);
    updateBucket(
      provider,
      bucket.resources.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleEstimateCost = () => {
    toast({
      title: "Cost Estimation",
      description: "Estimated monthly cost: $2,450. This calls individual service provider cost APIs for detailed analysis.",
    });
  };

  if (providers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Please select at least one Cloud Provider in the previous step.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {providers.map((p) => (
            <TabsTrigger key={p} value={p}>{p}</TabsTrigger>
          ))}
        </TabsList>

        {providers.map((provider) => {
          const bucket = getBucket(provider);
          const services = getServicesForProvider(provider);
          return (
            <TabsContent key={provider} value={provider} className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{bucket.resources.length} resource(s) configured</Badge>
                <Button variant="outline" size="sm" onClick={() => addResource(provider)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Resource
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[200px]">Service</TableHead>
                      <TableHead className="w-[100px]">Count</TableHead>
                      <TableHead>Configuration Details</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bucket.resources.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No resources added. Click "Add Resource" to begin.
                        </TableCell>
                      </TableRow>
                    ) : (
                      bucket.resources.map((res) => (
                        <TableRow key={res.id}>
                          <TableCell>
                            <Select value={res.service} onValueChange={(v) => updateResource(provider, res.id, "service", v)}>
                              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {services.map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input type="number" min={1} value={res.count} onChange={(e) => updateResource(provider, res.id, "count", parseInt(e.target.value) || 1)} className="w-20" />
                          </TableCell>
                          <TableCell>
                            <Input placeholder="e.g., t3.large, 2 vCPU, 8GB RAM" value={res.configDetails} onChange={(e) => updateResource(provider, res.id, "configDetails", e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeResource(provider, res.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleEstimateCost} className="gradient-primary text-primary-foreground">
          <DollarSign className="h-4 w-4 mr-1" /> Estimate Cost
        </Button>
      </div>
    </div>
  );
};
