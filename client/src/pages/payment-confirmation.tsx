import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UPIPayment } from "@/components/upi-payment";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, CheckCircle, MessageCircle, Clock, AlertCircle } from "lucide-react";
import { type EventBooking, type CompanyInfo } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

export default function PaymentConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [advanceFile, setAdvanceFile] = useState<File | null>(null);
  const [finalFile, setFinalFile] = useState<File | null>(null);
  const [advancePreview, setAdvancePreview] = useState<string | null>(null);
  const [finalPreview, setFinalPreview] = useState<string | null>(null);
  const [editAdvanceAmount, setEditAdvanceAmount] = useState(false);
  const [customAdvanceAmount, setCustomAdvanceAmount] = useState<number | null>(null);
  const isAdmin = typeof window !== "undefined" && localStorage.getItem("adminAuthenticated") === "true";
  const backUrl = isAdmin ? "/admin/bookings" : "/";

  const { data: booking, isLoading: bookingLoading } = useQuery<EventBooking>({
    queryKey: ["/api/bookings", bookingId],
    queryFn: () => fetch(`/api/bookings/${bookingId}`).then(r => r.json()),
  });

  const { data: companyInfo } = useQuery<CompanyInfo>({
    queryKey: ["/api/company-info"],
  });

  const uploadScreenshotMutation = useMutation({
    mutationFn: async (type: "advance" | "final") => {
      const file = type === "advance" ? advanceFile : finalFile;
      if (!file) throw new Error("No file selected");

      const reader = new FileReader();
      return new Promise<string>((resolve, reject) => {
        reader.onload = async () => {
          const base64 = reader.result as string;
          const response = await apiRequest("PATCH", `/api/bookings/${bookingId}`, {
            [type === "advance" ? "advancePaymentScreenshot" : "finalPaymentScreenshot"]: base64,
            [type === "advance" ? "advancePaymentStatus" : "finalPaymentStatus"]: "paid",
          });
          resolve(response);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    onSuccess: (_, type) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId] });
      toast({
        title: "Success",
        description: `${type === "advance" ? "Advance" : "Final"} payment screenshot uploaded successfully!`,
      });
      if (type === "advance") {
        setAdvanceFile(null);
        setAdvancePreview(null);
      } else {
        setFinalFile(null);
        setFinalPreview(null);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload payment screenshot",
        variant: "destructive",
      });
    },
  });

  const handleAdvanceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdvanceFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAdvancePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFinalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFinalFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setFinalPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!booking) return;
    
    const phoneNumber = booking.contactPhone?.replace(/\D/g, "");
    if (!phoneNumber) return;

    let message = "";

    // Advance payment pending
    if (booking.advancePaymentStatus === "pending") {
      message = encodeURIComponent(
        `Hi ${booking.clientName},\n\n*Advance Payment (50%)*\n- Amount: ₹${advanceAmount}\n- UPI ID: ${companyInfo?.upiId || "N/A"}\n- Event Date: ${new Date(booking.eventDate).toLocaleDateString()}\n\nScan the QR code or transfer the amount to complete advance payment.\n\nPayment Link: ${window.location.origin}/payment/${bookingId}`
      );
    }
    // Final payment pending (advance already paid)
    else if (booking.advancePaymentStatus === "paid" && booking.finalPaymentStatus === "pending") {
      message = encodeURIComponent(
        `Hi ${booking.clientName},\n\n*Final Payment (50%)*\n- Amount: ₹${finalAmount}\n- UPI ID: ${companyInfo?.upiId || "N/A"}\n- Event Date: ${new Date(booking.eventDate).toLocaleDateString()}\n\nScan the QR code or transfer the amount to complete final payment.\n\nPayment Link: ${window.location.origin}/payment/${bookingId}`
      );
    }
    // Both payments completed
    else if (booking.advancePaymentStatus === "paid" && booking.finalPaymentStatus === "paid") {
      message = encodeURIComponent(
        `Hi ${booking.clientName},\n\nThank you for completing the payment! Your booking is confirmed.\n- Event Date: ${new Date(booking.eventDate).toLocaleDateString()}\n- Total Amount: ₹${totalAmount}\n\nWe will contact you soon with event details.`
      );
    }
    // Default
    else {
      message = encodeURIComponent(
        `Hi ${booking.clientName},\n\nPayment Link: ${window.location.origin}/payment/${bookingId}`
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
            <Button onClick={() => setLocation("/")} className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalAmount = booking.guestCount * booking.pricePerPlate;
  const defaultAdvanceAmount = Math.ceil(totalAmount * 0.5);
  const advanceAmount = customAdvanceAmount ?? defaultAdvanceAmount;
  const finalAmount = totalAmount - advanceAmount;


  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation(backUrl)}
            className="gap-2 mb-4"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            {isAdmin ? "Back to Bookings" : "Back to Home"}
          </Button>
          <h1 className="text-3xl font-bold">Payment Confirmation</h1>
          <p className="text-muted-foreground">{isAdmin ? "Booking Payment Details" : "Complete your booking payment"}</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Booking Details */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Booking Details</span>
                  <Badge variant="secondary" data-testid="badge-booking-status">
                    {booking.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Client Name</Label>
                    <p className="font-semibold" data-testid="text-client-name">{booking.clientName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-semibold text-sm" data-testid="text-client-email">{booking.contactEmail}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Event Date</Label>
                    <p className="font-semibold" data-testid="text-event-date">{new Date(booking.eventDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Event Type</Label>
                    <p className="font-semibold" data-testid="text-event-type">{booking.eventType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Guest Count</Label>
                    <p className="font-semibold" data-testid="text-guest-count">{booking.guestCount}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Price per Plate</Label>
                    <p className="font-semibold" data-testid="text-price-per-plate">₹{booking.pricePerPlate}</p>
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
                    <span className="text-primary" data-testid="text-total-amount">₹{totalAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advance Payment */}
            <Card className={booking.advancePaymentStatus === "paid" ? "border-green-200 dark:border-green-800" : "border-amber-200 dark:border-amber-800"}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-lg">Step 1: Advance Payment (50%)</span>
                    {booking.advancePaymentStatus === "paid" && (
                      <CheckCircle className="w-5 h-5 text-green-600" data-testid="icon-advance-paid" />
                    )}
                    {booking.advancePaymentStatus === "pending" && (
                      <Clock className="w-5 h-5 text-amber-600" data-testid="icon-advance-pending" />
                    )}
                  </CardTitle>
                  {booking.advancePaymentStatus === "pending" && !editAdvanceAmount && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditAdvanceAmount(true)}
                      data-testid="button-edit-advance-amount"
                    >
                      Edit Amount
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-2xl font-bold text-primary" data-testid="text-advance-amount">₹{advanceAmount}</p>
                  <Badge variant={booking.advancePaymentStatus === "paid" ? "default" : "secondary"} data-testid="badge-advance-status">
                    {booking.advancePaymentStatus === "paid" ? "Completed" : "Pending"}
                  </Badge>
                </div>
                {editAdvanceAmount && booking.advancePaymentStatus === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <Input
                      type="number"
                      value={customAdvanceAmount ?? advanceAmount}
                      onChange={(e) => setCustomAdvanceAmount(Number(e.target.value))}
                      data-testid="input-advance-amount"
                      className="max-w-xs"
                      placeholder="Enter amount"
                    />
                    <Button
                      size="sm"
                      onClick={() => setEditAdvanceAmount(false)}
                      data-testid="button-save-advance-amount"
                    >
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {booking.advancePaymentStatus === "pending" ? (
                  <>
                    {!isAdmin && (
                      <UPIPayment
                        upiId={companyInfo?.upiId || ""}
                        totalAmount={advanceAmount}
                        bookingId={bookingId}
                        clientName={booking.clientName}
                      />
                    )}

                    {!isAdmin && (
                      <div className="border-t pt-4">
                        <Label className="text-base font-semibold mb-3 block">Upload Payment Screenshot</Label>
                        <p className="text-sm text-muted-foreground mb-3">Once you've made the payment, upload a screenshot of the transaction as proof.</p>
                        <div className="space-y-3">
                          {advancePreview && (
                            <div className="relative w-full max-w-sm">
                              <img src={advancePreview} alt="Payment preview" className="w-full border rounded-lg" data-testid="img-advance-preview" />
                            </div>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleAdvanceFileChange}
                              data-testid="input-advance-screenshot"
                              disabled={uploadScreenshotMutation.isPending}
                            />
                            <Button
                              onClick={() => uploadScreenshotMutation.mutate("advance")}
                              disabled={!advanceFile || uploadScreenshotMutation.isPending}
                              data-testid="button-upload-advance"
                              className="gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              {uploadScreenshotMutation.isPending ? "Uploading..." : "Upload"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          Awaiting customer payment and screenshot upload. Customer will receive payment details via WhatsApp.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-200">Advance payment received</p>
                      <p className="text-sm text-green-600 dark:text-green-300">{isAdmin ? "Customer has submitted payment proof." : "Thank you! Proceeding to final payment."}</p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Final Payment */}
            {booking.advancePaymentStatus === "paid" && (
              <Card className={booking.finalPaymentStatus === "paid" ? "border-green-200 dark:border-green-800" : "border-blue-200 dark:border-blue-800"}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-lg">Step 2: Final Payment (50%)</span>
                      {booking.finalPaymentStatus === "paid" && (
                        <CheckCircle className="w-5 h-5 text-green-600" data-testid="icon-final-paid" />
                      )}
                      {booking.finalPaymentStatus === "pending" && (
                        <Clock className="w-5 h-5 text-blue-600" data-testid="icon-final-pending" />
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-2xl font-bold text-primary" data-testid="text-final-amount">₹{finalAmount}</p>
                    <Badge variant={booking.finalPaymentStatus === "paid" ? "default" : "secondary"} data-testid="badge-final-status">
                      {booking.finalPaymentStatus === "paid" ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.finalPaymentStatus === "pending" ? (
                    <>
                      {!isAdmin && (
                        <UPIPayment
                          upiId={companyInfo?.upiId || ""}
                          totalAmount={finalAmount}
                          bookingId={bookingId}
                          clientName={booking.clientName}
                        />
                      )}

                      {!isAdmin && (
                        <div className="border-t pt-4">
                          <Label className="text-base font-semibold mb-3 block">Upload Payment Screenshot</Label>
                          <p className="text-sm text-muted-foreground mb-3">Once you've made the payment, upload a screenshot of the transaction as proof.</p>
                          <div className="space-y-3">
                            {finalPreview && (
                              <div className="relative w-full max-w-sm">
                                <img src={finalPreview} alt="Payment preview" className="w-full border rounded-lg" data-testid="img-final-preview" />
                              </div>
                            )}
                            <div className="flex gap-2 flex-wrap">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFinalFileChange}
                                data-testid="input-final-screenshot"
                                disabled={uploadScreenshotMutation.isPending}
                              />
                              <Button
                                onClick={() => uploadScreenshotMutation.mutate("final")}
                                disabled={!finalFile || uploadScreenshotMutation.isPending}
                                data-testid="button-upload-final"
                                className="gap-2"
                              >
                                <Upload className="w-4 h-4" />
                                {uploadScreenshotMutation.isPending ? "Uploading..." : "Upload"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {isAdmin && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-700 dark:text-blue-200">
                            Awaiting customer final payment and screenshot upload.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-green-700 dark:text-green-200">Final payment received</p>
                        <p className="text-sm text-green-600 dark:text-green-300">{isAdmin ? "Customer has submitted final payment proof." : "Your booking is fully confirmed!"}</p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            )}

            {booking.advancePaymentStatus === "paid" && booking.finalPaymentStatus === "paid" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-950/30 dark:to-green-950/10">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto" data-testid="icon-all-paid" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-green-700 dark:text-green-200">Payment Complete!</h3>
                      <p className="text-muted-foreground">All payments have been received. {isAdmin ? "Booking is confirmed." : "Your booking is confirmed."}</p>
                      <p className="text-sm text-muted-foreground">{isAdmin ? "You can now proceed with event preparations." : "We'll contact you soon with event details and preparations."}</p>
                      <Button onClick={() => setLocation(backUrl)} data-testid="button-back-home-final" className="w-full mt-4">
                        {isAdmin ? "Back to Bookings" : "Back to Home"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Summary Card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3">
                  <CardTitle className="text-lg">Payment Summary</CardTitle>
                  {isAdmin ? (
                    <Button
                      onClick={handleOpenWhatsApp}
                      className="gap-2 w-full"
                      data-testid="button-send-whatsapp-admin"
                      title="Send payment details to customer via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Send via WhatsApp
                    </Button>
                  ) : (
                    <Button
                      onClick={handleOpenWhatsApp}
                      className="gap-2 w-full"
                      data-testid="button-open-whatsapp"
                      title="Send payment details via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Share via WhatsApp
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Amount</span>
                    <span className="font-medium" data-testid="text-summary-subtotal">₹{totalAmount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{booking.guestCount} guests × ₹{booking.pricePerPlate}/plate</p>
                </div>

                <div className="border-t pt-3 space-y-3">
                  {/* Advance Payment Status */}
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
                      <span className={`font-semibold ${booking.advancePaymentStatus === "paid" ? "text-green-600" : ""}`} data-testid="text-advance-summary">
                        ₹{advanceAmount}
                      </span>
                    </div>
                    <p className={`text-xs ml-6 ${booking.advancePaymentStatus === "paid" ? "text-green-600" : "text-amber-600"}`} data-testid="text-advance-summary-status">
                      {booking.advancePaymentStatus === "paid" ? "Received" : "Awaiting payment"}
                    </p>
                  </div>

                  {/* Final Payment Status - only show if advance is paid */}
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
                        <span className={`font-semibold ${booking.finalPaymentStatus === "paid" ? "text-green-600" : ""}`} data-testid="text-final-summary">
                          ₹{finalAmount}
                        </span>
                      </div>
                      <p className={`text-xs ml-6 ${booking.finalPaymentStatus === "paid" ? "text-green-600" : "text-blue-600"}`} data-testid="text-final-summary-status">
                        {booking.finalPaymentStatus === "paid" ? "Received" : "Awaiting payment"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Total if all paid */}
                {booking.advancePaymentStatus === "paid" && booking.finalPaymentStatus === "paid" && (
                  <div className="border-t pt-3 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Paid</span>
                      <span className="text-lg font-bold text-green-600" data-testid="text-total-paid">₹{totalAmount}</span>
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
