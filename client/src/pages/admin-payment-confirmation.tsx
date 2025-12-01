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
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, MessageCircle, Clock, Pencil, Save, X } from "lucide-react";
import { type EventBooking, type CompanyInfo } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

export default function AdminPaymentConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [customAdvanceAmount, setCustomAdvanceAmount] = useState<number | null>(null);
  const [editTotalAmount, setEditTotalAmount] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editAdvanceStatus, setEditAdvanceStatus] = useState<"pending" | "paid" | null>(null);
  const [editFinalStatus, setEditFinalStatus] = useState<"pending" | "paid" | null>(null);

  const { data: booking, isLoading: bookingLoading } = useQuery<EventBooking>({
    queryKey: ["/api/bookings", bookingId],
    queryFn: () => fetch(`/api/bookings/${bookingId}`).then(r => r.json()),
  });

  const { data: companyInfo } = useQuery<CompanyInfo>({
    queryKey: ["/api/company-info"],
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async () => {
      if (!booking) return;
      const updateData: Record<string, any> = {};
      if (editAdvanceStatus !== null && editAdvanceStatus !== booking.advancePaymentStatus) {
        updateData.advancePaymentStatus = editAdvanceStatus;
      }
      if (editFinalStatus !== null && editFinalStatus !== booking.finalPaymentStatus) {
        updateData.finalPaymentStatus = editFinalStatus;
      }
      if (editTotalAmount !== null && editTotalAmount !== totalAmount) {
        updateData.totalAmount = editTotalAmount;
      }
      return apiRequest("PATCH", `/api/bookings/${bookingId}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId] });
      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });
      setIsEditing(false);
      setEditAdvanceStatus(null);
      setEditFinalStatus(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    },
  });

  const handleEditClick = () => {
    if (booking && !isEditing) {
      setEditAdvanceStatus(booking.advancePaymentStatus as "pending" | "paid");
      setEditFinalStatus(booking.finalPaymentStatus as "pending" | "paid");
      setEditTotalAmount(totalAmount);
    }
    setIsEditing(!isEditing);
  };

  const handleSendWhatsApp = () => {
    if (!booking) return;
    
    const phoneNumber = booking.contactPhone?.replace(/\D/g, "");
    if (!phoneNumber) return;

    let message = "";
    const totalAmount = booking.guestCount * booking.pricePerPlate;
    const defaultAdvanceAmount = Math.ceil(totalAmount * 0.5);
    const advanceAmount = customAdvanceAmount ?? defaultAdvanceAmount;
    const finalAmount = totalAmount - advanceAmount;

    if (booking.advancePaymentStatus === "pending") {
      message = encodeURIComponent(
        `Hi ${booking.clientName},\n\n*Advance Payment (50%)*\n- Amount: ₹${advanceAmount}\n- UPI ID: ${companyInfo?.upiId || "N/A"}\n- Event Date: ${new Date(booking.eventDate).toLocaleDateString()}\n\nScan the QR code or transfer the amount to complete advance payment.\n\nPayment Link: ${window.location.origin}/payment/${bookingId}`
      );
    }
    else if (booking.advancePaymentStatus === "paid" && booking.finalPaymentStatus === "pending") {
      message = encodeURIComponent(
        `Hi ${booking.clientName},\n\n*Final Payment (50%)*\n- Amount: ₹${finalAmount}\n- UPI ID: ${companyInfo?.upiId || "N/A"}\n- Event Date: ${new Date(booking.eventDate).toLocaleDateString()}\n\nScan the QR code or transfer the amount to complete final payment.\n\nPayment Link: ${window.location.origin}/payment/${bookingId}`
      );
    }
    else if (booking.advancePaymentStatus === "paid" && booking.finalPaymentStatus === "paid") {
      message = encodeURIComponent(
        `Hi ${booking.clientName},\n\nThank you for completing the payment! Your booking is confirmed.\n- Event Date: ${new Date(booking.eventDate).toLocaleDateString()}\n- Total Amount: ₹${totalAmount}\n\nWe will contact you soon with event details.`
      );
    }

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  if (bookingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Booking Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/admin/bookings")} className="w-full">
              Back to Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const baseAmount = booking.guestCount * booking.pricePerPlate;
  const totalAmount = booking.totalAmount ?? editTotalAmount ?? baseAmount;
  
  // If advance payment was already paid, keep it fixed at the original 50% of base amount
  // Only final payment should change when total is adjusted
  const originalAdvanceAmount = Math.ceil(baseAmount * 0.5);
  let advanceAmount: number;
  
  if (booking.advancePaymentStatus === "paid") {
    // Advance is paid - keep it fixed at what was originally paid
    advanceAmount = originalAdvanceAmount;
  } else {
    // Advance not paid yet - calculate 50% of current total
    const defaultAdvanceAmount = Math.ceil(totalAmount * 0.5);
    advanceAmount = customAdvanceAmount ?? defaultAdvanceAmount;
  }
  
  const finalAmount = totalAmount - advanceAmount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/admin/bookings")}
            className="gap-2 mb-4"
            data-testid="button-back-bookings-admin"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Bookings
          </Button>
          <h1 className="text-3xl font-bold">Booking Payment Details</h1>
          <p className="text-muted-foreground">View and manage customer payment</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Booking Details</span>
                  <Badge variant="secondary" data-testid="badge-booking-status-admin">
                    {booking.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Client Name</Label>
                    <p className="font-semibold" data-testid="text-client-name-admin">{booking.clientName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-semibold text-sm" data-testid="text-client-email-admin">{booking.contactEmail}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Event Date</Label>
                    <p className="font-semibold" data-testid="text-event-date-admin">{new Date(booking.eventDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Event Type</Label>
                    <p className="font-semibold" data-testid="text-event-type-admin">{booking.eventType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Guest Count</Label>
                    <p className="font-semibold" data-testid="text-guest-count-admin">{booking.guestCount}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Price per Plate</Label>
                    <p className="font-semibold" data-testid="text-price-per-plate-admin">₹{booking.pricePerPlate}</p>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div>
                    <Label className="text-muted-foreground">Special Requests</Label>
                    <p className="text-sm">{booking.specialRequests}</p>
                  </div>
                )}

                <div className="pt-4 border-t space-y-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount:</span>
                    {!isEditing ? (
                      <span className="text-primary" data-testid="text-total-amount-admin">₹{totalAmount}</span>
                    ) : (
                      <Input
                        type="number"
                        value={editTotalAmount ?? totalAmount}
                        onChange={(e) => setEditTotalAmount(Number(e.target.value))}
                        className="w-32"
                        data-testid="input-edit-total-amount"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={booking.advancePaymentStatus === "paid" ? "border-green-200 dark:border-green-800" : "border-amber-200 dark:border-amber-800"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-lg">Advance Payment (50%)</span>
                    {!isEditing && booking.advancePaymentStatus === "paid" && (
                      <CheckCircle className="w-5 h-5 text-green-600" data-testid="icon-advance-paid-admin" />
                    )}
                    {!isEditing && booking.advancePaymentStatus === "pending" && (
                      <Clock className="w-5 h-5 text-amber-600" data-testid="icon-advance-pending-admin" />
                    )}
                    {isEditing && editAdvanceStatus === "paid" && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {isEditing && editAdvanceStatus === "pending" && (
                      <Clock className="w-5 h-5 text-amber-600" />
                    )}
                  </CardTitle>
                  {!isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEditClick}
                      data-testid="button-edit-payment-admin"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {!isEditing ? (
                    <>
                      <p className="text-2xl font-bold text-primary" data-testid="text-advance-amount-admin">₹{advanceAmount}</p>
                      <Badge variant={booking.advancePaymentStatus === "paid" ? "default" : "secondary"} data-testid="badge-advance-status-admin">
                        {booking.advancePaymentStatus === "paid" ? "Received" : "Pending"}
                      </Badge>
                    </>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <Select value={editAdvanceStatus || "pending"} onValueChange={(val) => setEditAdvanceStatus(val as "pending" | "paid")}>
                        <SelectTrigger className="w-32" data-testid="select-advance-status-edit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Received</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {booking.advancePaymentStatus === "pending" && !isEditing ? (
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      Awaiting customer payment and screenshot upload. Customer will receive payment details via WhatsApp.
                    </p>
                  </div>
                ) : booking.advancePaymentStatus === "paid" ? (
                  <>
                    {!isEditing && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-green-700 dark:text-green-200">Payment received</p>
                          <p className="text-sm text-green-600 dark:text-green-300">Customer has submitted payment proof.</p>
                        </div>
                      </motion.div>
                    )}
                    {booking.advancePaymentScreenshot && (
                      <div className={isEditing ? "" : "border-t pt-4 mt-4"}>
                        <Label className="text-sm font-semibold mb-2 block">Payment Screenshot</Label>
                        <img src={booking.advancePaymentScreenshot} alt="Advance payment proof" className="w-full max-w-sm border rounded-lg" data-testid="img-advance-screenshot-admin" />
                      </div>
                    )}
                  </>
                ) : null}
              </CardContent>
            </Card>

            {(booking.advancePaymentStatus === "paid" || isEditing) && (
              <Card className={editFinalStatus === "paid" || booking.finalPaymentStatus === "paid" ? "border-green-200 dark:border-green-800" : "border-blue-200 dark:border-blue-800"}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-lg">Final Payment (50%)</span>
                    {!isEditing && booking.finalPaymentStatus === "paid" && (
                      <CheckCircle className="w-5 h-5 text-green-600" data-testid="icon-final-paid-admin" />
                    )}
                    {!isEditing && booking.finalPaymentStatus === "pending" && (
                      <Clock className="w-5 h-5 text-blue-600" data-testid="icon-final-pending-admin" />
                    )}
                    {isEditing && editFinalStatus === "paid" && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {isEditing && editFinalStatus === "pending" && (
                      <Clock className="w-5 h-5 text-blue-600" />
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    {!isEditing ? (
                      <>
                        <p className="text-2xl font-bold text-primary" data-testid="text-final-amount-admin">₹{finalAmount}</p>
                        <Badge variant={booking.finalPaymentStatus === "paid" ? "default" : "secondary"} data-testid="badge-final-status-admin">
                          {booking.finalPaymentStatus === "paid" ? "Received" : "Pending"}
                        </Badge>
                      </>
                    ) : (
                      <div className="flex gap-2 w-full">
                        <Select value={editFinalStatus || "pending"} onValueChange={(val) => setEditFinalStatus(val as "pending" | "paid")}>
                          <SelectTrigger className="w-32" data-testid="select-final-status-edit">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Received</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.finalPaymentStatus === "pending" && !isEditing ? (
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        Awaiting customer final payment and screenshot upload.
                      </p>
                    </div>
                  ) : booking.finalPaymentStatus === "paid" ? (
                    <>
                      {!isEditing && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-green-700 dark:text-green-200">Payment received</p>
                            <p className="text-sm text-green-600 dark:text-green-300">Customer has submitted final payment proof.</p>
                          </div>
                        </motion.div>
                      )}
                      {booking.finalPaymentScreenshot && (
                        <div className={isEditing ? "" : "border-t pt-4 mt-4"}>
                          <Label className="text-sm font-semibold mb-2 block">Payment Screenshot</Label>
                          <img src={booking.finalPaymentScreenshot} alt="Final payment proof" className="w-full max-w-sm border rounded-lg" data-testid="img-final-screenshot-admin" />
                        </div>
                      )}
                    </>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {booking.advancePaymentStatus === "paid" && booking.finalPaymentStatus === "paid" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/30 dark:to-green-950/10">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto" data-testid="icon-all-paid-admin" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-green-700 dark:text-green-200">Booking Complete!</h3>
                      <p className="text-muted-foreground">All payments have been received and verified.</p>
                      <p className="text-sm text-muted-foreground">You can now proceed with event preparations.</p>
                      <Button onClick={() => setLocation("/admin/bookings")} data-testid="button-back-bookings-final-admin" className="w-full mt-4">
                        Back to Bookings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3">
                  <CardTitle className="text-lg">Payment Summary</CardTitle>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => updatePaymentMutation.mutate()}
                        disabled={updatePaymentMutation.isPending}
                        className="gap-2 flex-1"
                        data-testid="button-save-payment-changes"
                      >
                        <Save className="w-4 h-4" />
                        {updatePaymentMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setEditAdvanceStatus(null);
                          setEditFinalStatus(null);
                        }}
                        variant="outline"
                        className="gap-2"
                        data-testid="button-cancel-edit"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleSendWhatsApp}
                      className="gap-2 w-full"
                      data-testid="button-send-whatsapp-admin-payment"
                      title="Send payment details to customer via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Send via WhatsApp
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Amount</span>
                    <span className="font-medium" data-testid="text-summary-subtotal-admin">₹{totalAmount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{booking.guestCount} guests × ₹{booking.pricePerPlate}/plate</p>
                </div>

                <div className="border-t pt-3 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {booking.advancePaymentStatus === "paid" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600" />
                        )}
                        <span className="text-sm font-medium">Advance (50%)</span>
                      </div>
                      <span className={`font-semibold ${booking.advancePaymentStatus === "paid" ? "text-green-600" : ""}`} data-testid="text-advance-summary-admin">
                        ₹{advanceAmount}
                      </span>
                    </div>
                    <p className={`text-xs ml-6 ${booking.advancePaymentStatus === "paid" ? "text-green-600" : "text-amber-600"}`} data-testid="text-advance-summary-status-admin">
                      {booking.advancePaymentStatus === "paid" ? "Received" : "Awaiting"}
                    </p>
                  </div>

                  {booking.advancePaymentStatus === "paid" && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {booking.finalPaymentStatus === "paid" ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="text-sm font-medium">Final (50%)</span>
                        </div>
                        <span className={`font-semibold ${booking.finalPaymentStatus === "paid" ? "text-green-600" : ""}`} data-testid="text-final-summary-admin">
                          ₹{finalAmount}
                        </span>
                      </div>
                      <p className={`text-xs ml-6 ${booking.finalPaymentStatus === "paid" ? "text-green-600" : "text-blue-600"}`} data-testid="text-final-summary-status-admin">
                        {booking.finalPaymentStatus === "paid" ? "Received" : "Awaiting"}
                      </p>
                    </div>
                  )}
                </div>

                {booking.advancePaymentStatus === "paid" && booking.finalPaymentStatus === "paid" && (
                  <div className="border-t pt-3 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Received</span>
                      <span className="text-lg font-bold text-green-600" data-testid="text-total-paid-admin">₹{totalAmount}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
