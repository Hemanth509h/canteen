import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Ticket, Send } from "lucide-react";

export default function BookingCodeRequestDialog({ open, onOpenChange }) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    eventDetails: ""
  });

  const requestMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/code-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit request");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "We'll review your request and contact you shortly.",
      });
      onOpenChange(false);
      setFormData({ customerName: "", customerEmail: "", customerPhone: "", eventDetails: "" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    requestMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Ticket className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-serif">Request User Code</DialogTitle>
          <DialogDescription>
            Enter your details below to request an exclusive user code for your event.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="req-name">Full Name</Label>
              <Input 
                id="req-name" 
                required 
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="req-email">Email</Label>
                <Input 
                  id="req-email" 
                  type="email" 
                  required 
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="req-phone">Phone</Label>
                <Input 
                  id="req-phone" 
                  type="tel" 
                  required 
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-details">Event Details (Date, Guests, Type)</Label>
              <Textarea 
                id="req-details" 
                placeholder="Tell us about your event..." 
                className="min-h-[100px]"
                value={formData.eventDetails}
                onChange={(e) => setFormData({...formData, eventDetails: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              className="w-full gap-2" 
              disabled={requestMutation.isPending}
            >
              <Send className="w-4 h-4" /> 
              {requestMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
