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
import { Invoice } from "@/components/features/invoice";
import { ArrowLeft, CheckCircle, MessageCircle, Clock, Pencil, Save, X, Users, Calendar, Utensils, IndianRupee, ExternalLink, AlertCircle, Calculator, CheckIcon, XIcon, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";

export default function AdminPaymentConfirmation() {
  const { bookingId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editTotalAmount, setEditTotalAmount] = useState(null);
  const [editAdvanceAmount, setEditAdvanceAmount] = useState(null);
  const [editAdvanceStatus, setEditAdvanceStatus] = useState(null);
  const [editFinalStatus, setEditFinalStatus] = useState(null);
  const [approvingAdvance, setApprovingAdvance] = useState(false);
  const [approvingFinal, setApprovingFinal] = useState(false);

  const { data: response, isLoading: isLoadingBooking } = useQuery({
    queryKey: ["/api/bookings", bookingId],
    queryFn: async () => {
      if (!bookingId) throw new Error("No booking ID provided");
      const url = `/api/bookings/${bookingId}`;
      console.log('Fetching from URL:', url);
      const res = await fetch(url);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Fetch failed:', res.status, errorText);
        throw new Error("Booking not found");
      }
      return res.json();
    },
    enabled: !!bookingId,
  });

  const booking = response?.data || response;

  const { data: companyInfo } = useQuery({
    queryKey: ["/api/company-info"],
  });

  useEffect(() => {
    if (booking && !isEditing) {
      setEditAdvanceStatus(booking.advancePaymentStatus);
      setEditFinalStatus(booking.finalPaymentStatus);
    }
  }, [booking, isEditing]);

  const updatePaymentMutation = useMutation({
    mutationFn: async () => {
      if (!booking) return;
      
      // Validate payment states - final cannot be paid if advance isn't paid
      if (editFinalStatus === "paid" && editAdvanceStatus !== "paid") {
        throw new Error("Final payment cannot be marked as paid before advance payment");
      }
      
      const updateData = {};
      if (editAdvanceStatus !== null && editAdvanceStatus !== booking.advancePaymentStatus) {
        updateData.advancePaymentStatus = editAdvanceStatus;
      }
      if (editFinalStatus !== null && editFinalStatus !== booking.finalPaymentStatus) {
        updateData.finalPaymentStatus = editFinalStatus;
      }
      if (editTotalAmount !== null) {
        const baseAmount = booking.guestCount * booking.pricePerPlate;
        const currentTotal = booking.totalAmount ?? baseAmount;
        if (editTotalAmount !== currentTotal) {
          updateData.totalAmount = editTotalAmount;
          // When amount changes, reset approval statuses to pending for re-verification
          updateData.advancePaymentApprovalStatus = undefined;
          updateData.finalPaymentApprovalStatus = undefined;
        }
      }
      if (editAdvanceAmount !== null) {
        updateData.advanceAmount = editAdvanceAmount;
      }
      return apiRequest("PATCH", `/api/bookings/${bookingId}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId] });
      toast({
        title: "Success",
        description: "Payment details updated successfully",
      });
      setIsEditing(false);
      setEditTotalAmount(null);
      setEditAdvanceAmount(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment details",
        variant: "destructive",
      });
    },
  });

  const handleEditClick = () => {
    if (booking && !isEditing) {
      const baseAmount = booking.guestCount * booking.pricePerPlate;
      const currentTotal = booking.totalAmount ?? baseAmount;
      setEditAdvanceStatus(booking.advancePaymentStatus);
      setEditFinalStatus(booking.finalPaymentStatus);
      setEditTotalAmount(currentTotal);
      setEditAdvanceAmount(booking.advanceAmount ?? Math.ceil(currentTotal * 0.5));
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditAdvanceStatus(null);
    setEditFinalStatus(null);
    setEditTotalAmount(null);
    setEditAdvanceAmount(null);
  };

  const approvePaymentMutation = useMutation({
    mutationFn: async (type) => {
      return apiRequest("PATCH", `/api/bookings/${bookingId}`, {
        [type === "advance" ? "advancePaymentStatus" : "finalPaymentStatus"]: "paid",
        [type === "advance" ? "advancePaymentApprovalStatus" : "finalPaymentApprovalStatus"]: "approved",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId] });
      toast({
        title: "Success",
        description: "Payment approved successfully",
      });
      setApprovingAdvance(false);
      setApprovingFinal(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve payment",
        variant: "destructive",
      });
      setApprovingAdvance(false);
      setApprovingFinal(false);
    },
  });

  const handleSendWhatsApp = () => {
    if (!booking) return;
    
    const phoneNumber = booking.contactPhone?.replace(/\D/g, "");
    if (!phoneNumber) {
      toast({
        title: "No phone number",
        description: "Customer phone number not available",
        variant: "destructive",
      });
      return;
    }

    const storedAdvanceAmount = booking ? (booking.advanceAmount ?? Math.ceil(totalAmount * 0.5)) : 0;
    const advanceAmount = isEditing && editAdvanceAmount !== null ? editAdvanceAmount : storedAdvanceAmount;
    const finalAmount = totalAmount - advanceAmount;

    let message = "";
    if (booking.advancePaymentStatus === "pending") {
      message = encodeURIComponent(
        `Hi ${booking.clientName},\n\n*Advance Payment Required*\nAmount: ₹${advanceAmount.toLocaleString('en-IN')}\nUPI ID: ${companyInfo?.upiId || "N/A"}\nEvent: ${new Date(booking.eventDate).toLocaleDateString('en-IN')}\n\nPay online: ${window.location.origin}/payment/${bookingId}\n\nThank you!`
      );
    } else if (booking.advancePaymentStatus === "paid" && booking.finalPaymentStatus === "pending") {
      message = encodeURIComponent(
        `Hi ${booking.clientName},\n\n*Final Payment Required*\nAmount: ₹${finalAmount.toLocaleString('en-IN')}\nUPI ID: ${companyInfo?.upiId || "N/A"}\nEvent: ${new Date(booking.eventDate).toLocaleDateString('en-IN')}\n\nPay online: ${window.location.origin}/payment/${bookingId}\n\nThank you!`
      );
    } else if (booking.advancePaymentStatus === "paid" && booking.finalPaymentStatus === "paid") {
      message = encodeURIComponent(
        `Hi ${booking.clientName},\n\n*Booking Confirmed!*\nTotal Paid: ₹${totalAmount.toLocaleString('en-IN')}\nEvent: ${new Date(booking.eventDate).toLocaleDateString('en-IN')}\n\nThank you for your payment. We'll contact you soon with event details.`
      );
    }

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const openPaymentPage = () => {
    window.open(`/payment/${bookingId}`, "_blank");
  };

  if (isLoadingBooking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Booking Not Found</h2>
            <Button onClick={() => setLocation("/admin/bookings")} className="w-full">
              Back to Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const guestCount = parseInt(booking ? booking.guestCount : 0) || 0;
  const pricePerPlate = parseInt(booking ? booking.pricePerPlate : 0) || 0;
  const baseAmount = guestCount * pricePerPlate;
  const totalAmount = (booking ? (typeof booking.totalAmount === 'number' ? booking.totalAmount : parseFloat(booking.totalAmount)) : 0) || baseAmount;
  const storedAdvanceAmount = (booking ? (typeof booking.advanceAmount === 'number' ? booking.advanceAmount : parseFloat(booking.advanceAmount)) : 0) || Math.ceil(totalAmount * 0.5);
  const displayTotal = isEditing && editTotalAmount !== null ? (parseFloat(editTotalAmount) || 0) : totalAmount;
  const advanceAmount = isEditing && editAdvanceAmount !== null ? (parseFloat(editAdvanceAmount) || 0) : storedAdvanceAmount;
  const finalAmount = displayTotal - advanceAmount;
  const advancePaid = booking ? (isEditing ? editAdvanceStatus === "paid" : booking.advancePaymentStatus === "paid" && booking.advancePaymentApprovalStatus === "approved") : false;
  const finalPaid = booking ? (isEditing ? editFinalStatus === "paid" : booking.finalPaymentStatus === "paid" && booking.finalPaymentApprovalStatus === "approved") : false;
  const allPaid = advancePaid && finalPaid;
  const advanceUploaded = booking ? (booking.advancePaymentStatus === "paid" && booking.advancePaymentApprovalStatus === "pending") : false;
  const finalUploaded = booking ? (booking.finalPaymentStatus === "paid" && booking.finalPaymentApprovalStatus === "pending") : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="animate-in fade-in duration-300 mb-6">
          <div className="flex gap-2 mb-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/admin/bookings")}
              className="gap-2"
              data-testid="button-back-bookings-admin"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bookings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId] })}
              className="gap-2"
              data-testid="button-refresh-admin-payment"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Payment Management</h1>
              <p className="text-muted-foreground">View and manage customer payment</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant={allPaid ? "default" : "secondary"} 
                className="text-sm px-3 py-1"
                data-testid="badge-booking-status-admin"
              >
                {allPaid ? "Fully Paid" : advancePaid ? "Advance Paid" : "Pending"}
              </Badge>
              {!isEditing && (
                <Button size="sm" variant="outline" onClick={handleEditClick} data-testid="button-edit-payment-admin">
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="animate-in fade-in duration-300 lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  Booking Details
                  <Button size="sm" variant="ghost" onClick={openPaymentPage} className="ml-auto gap-1">
                    <ExternalLink className="w-4 h-4" />
                    View Customer Page
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-2xl font-bold" data-testid="text-guest-count-admin">{booking.guestCount}</p>
                    <p className="text-xs text-muted-foreground">Guests</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Utensils className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-2xl font-bold" data-testid="text-price-per-plate-admin">₹{booking.pricePerPlate}</p>
                    <p className="text-xs text-muted-foreground">Per Plate</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Calendar className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold" data-testid="text-event-date-admin">{new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    <p className="text-xs text-muted-foreground">Event Date</p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-3 text-center border border-primary/20">
                    <IndianRupee className="w-5 h-5 mx-auto mb-1 text-primary" />
                    {isEditing ? (
                      <Input 
                        type="number" 
                        value={editTotalAmount ?? totalAmount}
                        onChange={(e) => setEditTotalAmount(Number(e.target.value))}
                        className="text-center font-bold text-lg h-8 w-24 mx-auto"
                        data-testid="input-edit-total-amount"
                      />
                    ) : (
                      <p className="text-2xl font-bold text-primary" data-testid="text-total-amount-admin">₹{totalAmount.toLocaleString('en-IN')}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                  <div>
                    <Label className="text-muted-foreground">Client</Label>
                    <p className="font-medium" data-testid="text-client-name-admin">{booking.clientName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{booking.contactPhone || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium text-sm" data-testid="text-client-email-admin">{booking.contactEmail}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Event Type</Label>
                    <p className="font-medium" data-testid="text-event-type-admin">{booking.eventType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className={advancePaid ? "border-green-300 dark:border-green-800" : "border-amber-300 dark:border-amber-800"}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${advancePaid ? 'bg-green-100 dark:bg-green-900' : 'bg-amber-100 dark:bg-amber-900'}`}>
                      {advancePaid ? (
                        <CheckCircle className="w-5 h-5 text-green-600" data-testid="icon-advance-paid-admin" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-600" data-testid="icon-advance-pending-admin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">Advance Payment</CardTitle>
                      <p className="text-xs text-muted-foreground">50% of total</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xl font-bold">₹</span>
                        <Input 
                          type="number" 
                          value={editAdvanceAmount ?? advanceAmount}
                          onChange={(e) => setEditAdvanceAmount(Number(e.target.value))}
                          className="text-xl font-bold w-28"
                          data-testid="input-edit-advance-amount"
                        />
                      </div>
                    ) : (
                      <p className="text-3xl font-bold" data-testid="text-advance-amount-admin">₹{advanceAmount.toLocaleString('en-IN')}</p>
                    )}
                    {isEditing ? (
                      <Select value={editAdvanceStatus || "pending"} onValueChange={(val) => setEditAdvanceStatus(val)}>
                        <SelectTrigger className="w-28" data-testid="select-advance-status-edit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={advancePaid ? "default" : "secondary"} data-testid="badge-advance-status-admin">
                        {advancePaid ? "Paid" : "Pending"}
                      </Badge>
                    )}
                  </div>
                  <div className="border-t pt-3 space-y-3">
                    {booking.advancePaymentScreenshot && (
                      <>
                        <Label className="text-xs text-muted-foreground mb-2 block">Payment Proof</Label>
                        <img src={booking.advancePaymentScreenshot} alt="Advance payment proof" className="w-full max-h-48 object-contain border rounded-lg" data-testid="img-advance-screenshot-admin" />
                      </>
                    )}
                    <div className="space-y-2">
                      {!booking.advancePaymentScreenshot ? (
                        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                          Awaiting payment screenshot from customer
                        </div>
                      ) : advanceUploaded ? (
                        <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                          <p className="text-sm font-semibold text-amber-700 dark:text-amber-200 mb-2">Payment Pending Your Approval</p>
                        </div>
                      ) : advancePaid ? (
                        <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-sm font-semibold text-green-700 dark:text-green-200">Payment Approved</p>
                        </div>
                      ) : null}
                      {!isEditing && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => { setApprovingAdvance(true); approvePaymentMutation.mutate("advance"); }}
                            disabled={approvePaymentMutation.isPending || !advanceUploaded}
                            className="gap-2 flex-1"
                            data-testid="button-approve-advance"
                          >
                            <CheckIcon className="w-4 h-4" />
                            Approve Payment
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            disabled={!advanceUploaded}
                            className="gap-2 flex-1"
                            data-testid="button-reject-advance"
                          >
                            <XIcon className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={finalPaid ? "border-green-300 dark:border-green-800" : advancePaid ? "border-blue-300 dark:border-blue-800" : "border-muted"}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${finalPaid ? 'bg-green-100 dark:bg-green-900' : advancePaid ? 'bg-blue-100 dark:bg-blue-900' : 'bg-muted'}`}>
                      {finalPaid ? (
                        <CheckCircle className="w-5 h-5 text-green-600" data-testid="icon-final-paid-admin" />
                      ) : advancePaid ? (
                        <Clock className="w-5 h-5 text-blue-600" data-testid="icon-final-pending-admin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">Final Payment</CardTitle>
                      <p className="text-xs text-muted-foreground">50% of total</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-3xl font-bold" data-testid="text-final-amount-admin">₹{finalAmount.toLocaleString('en-IN')}</p>
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <Select value={editFinalStatus || "pending"} onValueChange={(val) => setEditFinalStatus(val)} disabled={editAdvanceStatus !== "paid"}>
                          <SelectTrigger className="w-28" data-testid="select-final-status-edit" disabled={editAdvanceStatus !== "paid"}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid" disabled={editAdvanceStatus !== "paid"}>Paid</SelectItem>
                          </SelectContent>
                        </Select>
                        {editAdvanceStatus !== "paid" && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">Advance must be paid first</p>
                        )}
                      </div>
                    ) : (
                      <Badge variant={finalPaid ? "default" : "secondary"} data-testid="badge-final-status-admin">
                        {finalPaid ? "Paid" : advancePaid ? "Pending" : "Waiting"}
                      </Badge>
                    )}
                  </div>
                  <div className="border-t pt-3 space-y-3">
                    {booking.finalPaymentScreenshot && (
                      <>
                        <Label className="text-xs text-muted-foreground mb-2 block">Payment Proof</Label>
                        <img src={booking.finalPaymentScreenshot} alt="Final payment proof" className="w-full max-h-48 object-contain border rounded-lg" data-testid="img-final-screenshot-admin" />
                      </>
                    )}
                    <div className="space-y-2">
                      {!booking.finalPaymentScreenshot ? (
                        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                          Awaiting payment screenshot from customer
                        </div>
                      ) : finalUploaded ? (
                        <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                          <p className="text-sm font-semibold text-amber-700 dark:text-amber-200 mb-2">Payment Pending Your Approval</p>
                        </div>
                      ) : finalPaid ? (
                        <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-sm font-semibold text-green-700 dark:text-green-200">Payment Approved</p>
                        </div>
                      ) : null}
                      {!isEditing && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => { setApprovingFinal(true); approvePaymentMutation.mutate("final"); }}
                            disabled={approvePaymentMutation.isPending || !finalUploaded}
                            className="gap-2 flex-1"
                            data-testid="button-approve-final"
                          >
                            <CheckIcon className="w-4 h-4" />
                            Approve Payment
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            disabled={!finalUploaded}
                            className="gap-2 flex-1"
                            data-testid="button-reject-final"
                          >
                            <XIcon className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {allPaid && !isEditing && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <Invoice booking={booking} companyInfo={companyInfo} isAdmin={true} />
                <Card className="border-green-300 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/10">
                  <CardContent className="pt-6 pb-6">
                    <div className="text-center space-y-3">
                      <div className="animate-in fade-in duration-300">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto" data-testid="icon-all-paid-admin" />
                      </div>
                      <h3 className="text-xl font-bold text-green-700 dark:text-green-200">All Payments Complete</h3>
                      <p className="text-sm text-muted-foreground">This booking is fully paid and confirmed.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="animate-in fade-in duration-300">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing && (
                  <div className="flex gap-2 pb-3 border-b">
                    <Button
                      onClick={() => updatePaymentMutation.mutate()}
                      disabled={updatePaymentMutation.isPending}
                      className="flex-1 gap-2"
                      data-testid="button-save-payment-changes"
                    >
                      <Save className="w-4 h-4" />
                      {updatePaymentMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      data-testid="button-cancel-edit"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base Calculation</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{booking.guestCount} guests × ₹{booking.pricePerPlate}</span>
                      <span className="font-medium">₹{baseAmount.toLocaleString('en-IN')}</span>
                    </div>
                    {displayTotal !== baseAmount && (
                      <div className="flex justify-between text-sm border-t pt-2 mt-2">
                        <span className="text-muted-foreground">Adjusted Total</span>
                        <span className="font-medium text-primary">₹{displayTotal.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className={`flex items-center justify-between p-3 rounded-lg ${advancePaid ? 'bg-green-50 dark:bg-green-950/30' : 'bg-amber-50 dark:bg-amber-950/30'}`}>
                    <div className="flex items-center gap-2">
                      {advancePaid ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-600" />
                      )}
                      <span className="text-sm font-medium">Advance</span>
                    </div>
                    <span className={`font-semibold ${advancePaid ? 'text-green-600' : ''}`} data-testid="text-advance-summary-admin">
                      ₹{advanceAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-lg ${finalPaid ? 'bg-green-50 dark:bg-green-950/30' : advancePaid ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-muted/50'}`}>
                    <div className="flex items-center gap-2">
                      {finalPaid ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : advancePaid ? (
                        <Clock className="w-4 h-4 text-blue-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className="text-sm font-medium">Final</span>
                    </div>
                    <span className={`font-semibold ${finalPaid ? 'text-green-600' : ''}`} data-testid="text-final-summary-admin">
                      ₹{finalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary" data-testid="text-total-summary-admin">
                      ₹{displayTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  
                  {!isEditing && (
                    <Button
                      onClick={handleSendWhatsApp}
                      className="w-full gap-2"
                      data-testid="button-send-whatsapp-admin-payment"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Send via WhatsApp
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
