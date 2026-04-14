import { useState, useEffect } from "react";
import { type ApprovalItem } from "@/types/onboarding";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Clock, CheckCircle2, XCircle, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  data: ApprovalItem[];
  solutionType: string;
  onChange: (data: ApprovalItem[]) => void;
}

const generateApprovals = (solutionType: string): ApprovalItem[] => {
  const base: ApprovalItem[] = [
    { id: "a1", type: "gps", title: "GPS - Cloud Infrastructure", status: "in-review", approver: "Rajesh Kumar", submittedDate: "2026-04-10", lastReminder: null, reminderCount: 0, comments: ["Initial submission with all artefacts."] },
    { id: "a2", type: "gps", title: "GPS - SSL Certificate", status: "pending", approver: "Priya Singh", submittedDate: "2026-04-12", lastReminder: null, reminderCount: 0, comments: [] },
    { id: "a3", type: "rfc", title: "RFC - AD Group Creation", status: "approved", approver: "Amit Patel", submittedDate: "2026-04-08", lastReminder: "2026-04-09", reminderCount: 1, comments: ["Approved. AD groups created."] },
    { id: "a4", type: "rfc", title: "RFC - CyberArk Onboarding", status: "pending", approver: "Sonal Mehta", submittedDate: "2026-04-11", lastReminder: null, reminderCount: 0, comments: [] },
    { id: "a5", type: "other", title: "Architecture Approval - ISM", status: "in-review", approver: "Vikram Desai", submittedDate: "2026-04-09", lastReminder: "2026-04-13", reminderCount: 2, comments: ["Need clarification on DMZ config.", "Updated diagram shared."] },
  ];
  if (solutionType === "generative-ai") {
    base.push(
      { id: "a6", type: "other", title: "Legal Approval", status: "pending", approver: "Legal Team", submittedDate: "2026-04-13", lastReminder: null, reminderCount: 0, comments: [] },
      { id: "a7", type: "other", title: "Data Privacy Approval", status: "pending", approver: "Privacy Office", submittedDate: "2026-04-13", lastReminder: null, reminderCount: 0, comments: [] },
    );
  }
  return base;
};

const statusConfig: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
  pending: { icon: <Clock className="h-3 w-3" />, className: "bg-warning/10 text-warning border-warning/20", label: "Pending" },
  "in-review": { icon: <Eye className="h-3 w-3" />, className: "bg-info/10 text-info border-info/20", label: "In Review" },
  approved: { icon: <CheckCircle2 className="h-3 w-3" />, className: "bg-success/10 text-success border-success/20", label: "Approved" },
  rejected: { icon: <XCircle className="h-3 w-3" />, className: "bg-destructive/10 text-destructive border-destructive/20", label: "Rejected" },
};

export const StepApprovalTracker = ({ data, solutionType, onChange }: Props) => {
  const [activeTab, setActiveTab] = useState("gps");

  useEffect(() => {
    if (data.length === 0) {
      onChange(generateApprovals(solutionType));
    }
  }, []);

  const sendReminder = (id: string) => {
    onChange(
      data.map((a) =>
        a.id === id
          ? { ...a, lastReminder: new Date().toISOString().split("T")[0], reminderCount: a.reminderCount + 1 }
          : a
      )
    );
    toast({ title: "Reminder Sent", description: `Reminder ${data.find((a) => a.id === id)!.reminderCount + 1} sent to the approver.` });
  };

  const filterByType = (type: string) => data.filter((a) => a.type === type);

  const isPendingLong = (item: ApprovalItem) => {
    if (item.status === "approved" || item.status === "rejected") return false;
    const submitted = new Date(item.submittedDate);
    const diff = (Date.now() - submitted.getTime()) / (1000 * 60 * 60);
    return diff > 48;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="gps">GPS ({filterByType("gps").length})</TabsTrigger>
          <TabsTrigger value="rfc">RFC ({filterByType("rfc").length})</TabsTrigger>
          <TabsTrigger value="other">Other Approvals ({filterByType("other").length})</TabsTrigger>
        </TabsList>

        {["gps", "rfc", "other"].map((type) => (
          <TabsContent key={type} value={type} className="space-y-3">
            {filterByType(type).length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No approvals in this category.</p>
            ) : (
              filterByType(type).map((item) => {
                const sc = statusConfig[item.status];
                const overdue = isPendingLong(item);
                return (
                  <div key={item.id} className={`border rounded-lg p-4 transition-shadow hover:shadow-card-hover ${overdue ? "border-warning/50 bg-warning/5" : ""}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.title}</span>
                          <Badge className={sc.className}>
                            {sc.icon} <span className="ml-1">{sc.label}</span>
                          </Badge>
                          {overdue && <Badge variant="destructive" className="text-[10px]">Overdue &gt;48h</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground space-x-4">
                          <span>Approver: {item.approver}</span>
                          <span>Submitted: {item.submittedDate}</span>
                          {item.lastReminder && <span>Last Reminder: {item.lastReminder}</span>}
                        </div>
                      </div>
                      {item.status !== "approved" && item.status !== "rejected" && (
                        <Button variant="outline" size="sm" onClick={() => sendReminder(item.id)}>
                          <Bell className="h-4 w-4 mr-1" />
                          Reminder {item.reminderCount + 1}
                        </Button>
                      )}
                    </div>
                    {item.comments.length > 0 && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> Comments
                        </span>
                        {item.comments.map((c, i) => (
                          <p key={i} className="text-sm bg-muted rounded px-3 py-2">{c}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
