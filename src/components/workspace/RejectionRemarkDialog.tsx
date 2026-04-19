import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ApprovalTicket } from "@/types/project";
import { Send } from "lucide-react";

interface Props {
  ticket: ApprovalTicket;
  onResubmit: (remark: string) => void;
}

export const RejectionRemarkDialog = ({ ticket, onResubmit }: Props) => {
  const [open, setOpen] = useState(false);
  const [remark, setRemark] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gradient-primary text-primary-foreground">
          <Send className="h-3.5 w-3.5 mr-1.5" />
          Add Remarks & Resend
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resubmit {ticket.ticketNumber}</DialogTitle>
          <DialogDescription>
            Add your remarks addressing the approver's concerns. The ticket will be resubmitted and the auto-progress engine will resume.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="e.g. Updated data flow diagram attached. PII fields are now encrypted with CMK and access is restricted to the application service account only."
          rows={5}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            disabled={!remark.trim()}
            onClick={() => {
              onResubmit(remark.trim());
              setRemark("");
              setOpen(false);
            }}
          >
            Resubmit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
