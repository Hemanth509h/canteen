import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, RefreshCw, AlertCircle, Save, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";

export default function AdminPaymentConfirmation() {
  const { bookingId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editTotal, setEditTotal] = useState("");
  const [editAdvance, setEditAdvance] = useState("");
  const [editAdvanceStatus, setEditAdvanceStatus] = useState("pending");
  const [editFinalStatus, setEditFinalStatus] = useState("pending");

  const { data: response, isLoading } = useQuery({
    queryKey: ["/api/bookings", bookingId],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (!res.ok) throw new Error("Booking not found");
      return res.json();
    },
    enabled: !!bookingId,
  });

  const booking = response?.data || response;

  useEffect(() => {
    if (booking) {
      setEditTotal(booking.totalAmount?.toString() || "");
      setEditAdvance(booking.advanceAmount?.toString() || "");
      setEditAdvanceStatus(booking.advancePaymentStatus || "pending");
      setEditFinalStatus(booking.finalPaymentStatus || "pending");
    }
  }, [booking]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return apiRequest("PATCH", `/api/bookings/${bookingId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId] });
      toast({ title: "Success", description: "Payment details updated" });
      setIsEditing(false);
    },
  });

  if (isLoading) return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;
  if (!booking) return <div className="p-8 text-center"><AlertCircle className="mx-auto h-12 w-12 text-destructive" /><h2 className="mt-4 text-xl font-bold">Booking Not Found</h2></div>;

  const handleSave = () => {
    updateMutation.mutate({
      totalAmount: parseInt(editTotal) || 0,
      advanceAmount: parseInt(editAdvance) || 0,
      advancePaymentStatus: editAdvanceStatus,
      finalPaymentStatus: editFinalStatus,
      advancePaymentApprovalStatus: editAdvanceStatus === "paid" ? "approved" : "pending",
      finalPaymentApprovalStatus: editFinalStatus === "paid" ? "approved" : "pending",
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setLocation("/admin/bookings")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h2 className="text-2xl font-bold">Payment Management</h2>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? <X className="h-4 w-4 mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {isEditing ? "Cancel" : "Edit Details"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Total Amount (₹)</Label>
              {isEditing ? <Input type="number" value={editTotal} onChange={e => setEditTotal(e.target.value)} /> : <div className="text-2xl font-bold">₹{booking.totalAmount?.toLocaleString()}</div>}
            </div>
            <div className="space-y-2">
              <Label>Advance Amount (₹)</Label>
              {isEditing ? <Input type="number" value={editAdvance} onChange={e => setEditAdvance(e.target.value)} /> : <div className="text-xl font-semibold">₹{booking.advanceAmount?.toLocaleString()}</div>}
            </div>
            {isEditing && (
              <Button className="w-full mt-4" onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payment Status</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Advance Payment</Label>
              {isEditing ? (
                <Select value={editAdvanceStatus} onValueChange={setEditAdvanceStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent>
                </Select>
              ) : <Badge variant={booking.advancePaymentStatus === "paid" ? "default" : "secondary"}>{booking.advancePaymentStatus || "pending"}</Badge>}
            </div>
            <div className="space-y-2">
              <Label>Final Payment</Label>
              {isEditing ? (
                <Select value={editFinalStatus} onValueChange={setEditFinalStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent>
                </Select>
              ) : <Badge variant={booking.finalPaymentStatus === "paid" ? "default" : "secondary"}>{booking.finalPaymentStatus || "pending"}</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
