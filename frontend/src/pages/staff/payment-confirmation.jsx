import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UPIPayment } from "@/components/features/upi-payment";
import { Invoice } from "@/components/features/invoice";
import { ArrowLeft, Upload, CheckCircle, Clock, AlertCircle, Camera, Users, Calendar, Utensils, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

import { API_URL } from "@/lib/queryClient";

export default function PaymentConfirmation() {
  const { bookingId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [advanceFile, setAdvanceFile] = useState(null);
  const [finalFile, setFinalFile] = useState(null);
  const [advancePreview, setAdvancePreview] = useState(null);
  const [finalPreview, setFinalPreview] = useState(null);

  const { data: response, isLoading: bookingLoading, isError: bookingError } = useQuery({
    queryKey: ["/api/bookings", bookingId],
    queryFn: async () => {
      if (!bookingId) throw new Error("No booking ID provided");
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) throw new Error("Failed to fetch booking");
      return response.json();
    },
    enabled: !!bookingId,
  });

  const booking = response?.data || response;

  const { data: companyInfo } = useQuery({
    queryKey: ["/api/company-info"],
  });

  const uploadScreenshotMutation = useMutation({
    mutationFn: async (type) => {
      const file = type === "advance" ? advanceFile : finalFile;
      if (!file) throw new Error("No file selected");
      if (file.size > 50 * 1024 * 1024) throw new Error("File is too large (max 50MB)");

      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Upload timed out. Please try again."));
        }, 60000);

        reader.onload = async () => {
          clearTimeout(timeout);
          try {
            const base64 = reader.result;
            await apiRequest("PATCH", `/api/bookings/${bookingId}`, {
              [type === "advance" ? "advancePaymentScreenshot" : "finalPaymentScreenshot"]: base64,
              [type === "advance" ? "advancePaymentStatus" : "finalPaymentStatus"]: "paid",
              [type === "advance" ? "advancePaymentApprovalStatus" : "finalPaymentApprovalStatus"]: "pending",
            });
            resolve("success");
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("Failed to read file"));
        };
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
    onError: (error) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to upload payment screenshot",
        variant: "destructive",
      });
    },
  });

  const handleAdvanceFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdvanceFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAdvancePreview(e.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFinalFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFinalFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setFinalPreview(e.target?.result);
      reader.readAsDataURL(file);
    }
  };


  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">No Booking Found</h2>
            <p className="text-muted-foreground">No booking ID provided</p>
            <Button onClick={() => setLocation("/")} className="w-full" data-testid="button-back-home-error">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (bookingError || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Booking Not Found</h2>
            <p className="text-muted-foreground">Could not load booking details. Please check the booking ID and try again.</p>
            <Button onClick={() => setLocation("/")} className="w-full" data-testid="button-back-home-error">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const guestCount = parseInt(booking.guestCount) || 0;
  const pricePerPlate = parseInt(booking.pricePerPlate) || 0;
  const baseAmount = guestCount * pricePerPlate;
  const totalAmount = (typeof booking.totalAmount === 'number' ? booking.totalAmount : parseFloat(booking.totalAmount)) || baseAmount;
  const advanceAmount = (typeof booking.advanceAmount === 'number' ? booking.advanceAmount : parseFloat(booking.advanceAmount)) || Math.ceil(totalAmount * 0.5);
  const finalAmount = totalAmount - advanceAmount;
  
  // Updated business logicse approval status for customer-facing badges and visibility
  const advancePaid = booking.advancePaymentStatus === "paid" && booking.advancePaymentApprovalStatus === "approved";
  const finalPaid = booking.finalPaymentStatus === "paid" && booking.finalPaymentApprovalStatus === "approved";
  
  const advanceUploaded = booking.advancePaymentStatus === "paid" && booking.advancePaymentApprovalStatus === "pending";
  const finalUploaded = booking.finalPaymentStatus === "paid" && booking.finalPaymentApprovalStatus === "pending";

  const allPaid = advancePaid && finalPaid;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="animate-in fade-in duration-300 mb-6">
          <div className="flex gap-2 mb-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="gap-2"
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId] })}
              className="gap-2"
              data-testid="button-refresh-payment"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Payment</h1>
              <p className="text-muted-foreground">Complete your booking payment</p>
            </div>
            <Badge 
              variant={allPaid ? "default" : "secondary"} 
              className="w-fit text-sm px-3 py-1"
              data-testid="badge-booking-status"
            >
              {allPaid ? "Fully Paid" : advancePaid ? "Advance Paid" : "Payment Pending"}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="animate-in fade-in duration-300 lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-2xl font-bold" data-testid="text-guest-count">{booking.guestCount}</p>
                    <p className="text-xs text-muted-foreground">Guests</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Utensils className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-2xl font-bold" data-testid="text-price-per-plate">₹{booking.pricePerPlate}</p>
                    <p className="text-xs text-muted-foreground">Per Plate</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Calendar className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-bold" data-testid="text-event-date">{new Date(booking.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    <p className="text-xs text-muted-foreground">Event Date</p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-3 text-center border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-primary" data-testid="text-total-amount">₹{totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <div><span className="text-muted-foreground">Client: </span><span className="font-medium text-foreground" data-testid="text-client-name">{booking.clientName}</span></div>
                    <div><span className="text-muted-foreground">Event: </span><span className="font-medium text-foreground" data-testid="text-event-type">{booking.eventType}</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={advancePaid ? "border-green-300 dark:border-green-800" : "border-amber-300 dark:border-amber-800"}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${advancePaid ? 'bg-green-600' : 'bg-amber-500'}`}>
                      {advancePaid ? <CheckCircle className="w-5 h-5" /> : '1'}
                    </div>
                    <div>
                      <CardTitle className="text-lg">Advance Payment</CardTitle>
                      <p className="text-sm text-muted-foreground">50% of total amount</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary" data-testid="text-advance-amount">₹{advanceAmount.toLocaleString('en-IN')}</p>
                    <Badge variant={advancePaid ? "default" : "secondary"} data-testid="badge-advance-status">
                      {advancePaid ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {booking.advancePaymentStatus !== "paid" ? (
                  <>
                    <UPIPayment
                      upiId={companyInfo?.upiId || ""}
                      totalAmount={advanceAmount}
                      bookingId={bookingId}
                      clientName={booking.clientName}
                      paymentType="advance"
                    />

                    <div className="border-t pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Camera className="w-5 h-5 text-muted-foreground" />
                        <Label className="text-base font-semibold">Upload Payment Screenshot</Label>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">After completing payment, upload a screenshot as proof.</p>
                      
                      <div className="space-y-4">
                        {advancePreview && (
                          <div className="animate-in fade-in duration-300 relative w-full max-w-xs mx-auto"
                          >
                            <img src={advancePreview} alt="Payment preview" className="w-full border-2 rounded-lg shadow-md" data-testid="img-advance-preview" />
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="absolute top-2 right-2"
                              onClick={() => { setAdvanceFile(null); setAdvancePreview(null); }}
                            >
                              Change
                            </Button>
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleAdvanceFileChange}
                              data-testid="input-advance-screenshot"
                              disabled={uploadScreenshotMutation.isPending}
                              className="cursor-pointer"
                            />
                          </div>
                          <Button
                            onClick={() => uploadScreenshotMutation.mutate("advance")}
                            disabled={!advanceFile || uploadScreenshotMutation.isPending}
                            data-testid="button-upload-advance"
                            className="gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            {uploadScreenshotMutation.isPending ? "Uploading..." : "Submit Payment"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : advanceUploaded ? (
                  <div className="animate-in fade-in duration-300 space-y-4"
                  >
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start gap-3">
                      <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-700 dark:text-blue-200">Waiting for Admin Approval</p>
                        <p className="text-sm text-blue-600 dark:text-blue-300">Your payment screenshot has been received. The admin will review and approve it shortly. You'll be notified once approved.</p>
                      </div>
                    </div>
                    {booking.advancePaymentScreenshot && (
                      <div>
                        <p className="text-sm font-semibold mb-2 text-muted-foreground">Payment Proof</p>
                        <img src={booking.advancePaymentScreenshot} alt="Advance payment screenshot" className="w-full max-w-xs border rounded-lg shadow-sm" data-testid="img-advance-screenshot-customer" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300 space-y-4"
                  >
                    <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800 flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-700 dark:text-green-200">Payment Approved</p>
                        <p className="text-sm text-green-600 dark:text-green-300">Thank you! Your advance payment has been confirmed by our team.</p>
                      </div>
                    </div>
                    {booking.advancePaymentScreenshot && (
                      <div>
                        <p className="text-sm font-semibold mb-2 text-muted-foreground">Payment Proof</p>
                        <img src={booking.advancePaymentScreenshot} alt="Advance payment screenshot" className="w-full max-w-xs border rounded-lg shadow-sm" data-testid="img-advance-screenshot-customer" />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {booking.advancePaymentStatus === "paid" && booking.advancePaymentApprovalStatus === "approved" && (
              <div className="animate-in fade-in duration-300">
                <Card className={finalPaid ? "border-green-300 dark:border-green-800" : "border-blue-300 dark:border-blue-800"}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${finalPaid ? 'bg-green-600' : 'bg-blue-600'}`}>
                          {finalPaid ? <CheckCircle className="w-5 h-5" /> : '2'}
                        </div>
                        <div>
                          <CardTitle className="text-lg">Final Payment</CardTitle>
                          <p className="text-sm text-muted-foreground">Remaining 50% amount</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary" data-testid="text-final-amount">₹{finalAmount.toLocaleString('en-IN')}</p>
                        <Badge variant={finalPaid ? "default" : "secondary"} data-testid="badge-final-status">
                          {finalPaid ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {booking.finalPaymentStatus !== "paid" ? (
                      <>
                        <UPIPayment
                          upiId={companyInfo?.upiId || ""}
                          totalAmount={finalAmount}
                          bookingId={bookingId}
                          clientName={booking.clientName}
                          paymentType="final"
                        />

                        <div className="border-t pt-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Camera className="w-5 h-5 text-muted-foreground" />
                            <Label className="text-base font-semibold">Upload Payment Screenshot</Label>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">After completing payment, upload a screenshot as proof.</p>
                          
                          <div className="space-y-4">
                            {finalPreview && (
                              <div className="animate-in fade-in duration-300 relative w-full max-w-xs mx-auto"
                              >
                                <img src={finalPreview} alt="Payment preview" className="w-full border-2 rounded-lg shadow-md" data-testid="img-final-preview" />
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  className="absolute top-2 right-2"
                                  onClick={() => { setFinalFile(null); setFinalPreview(null); }}
                                >
                                  Change
                                </Button>
                              </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="flex-1">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFinalFileChange}
                                  data-testid="input-final-screenshot"
                                  disabled={uploadScreenshotMutation.isPending}
                                  className="cursor-pointer"
                                />
                              </div>
                              <Button
                                onClick={() => uploadScreenshotMutation.mutate("final")}
                                disabled={!finalFile || uploadScreenshotMutation.isPending}
                                data-testid="button-upload-final"
                                className="gap-2"
                              >
                                <Upload className="w-4 h-4" />
                                {uploadScreenshotMutation.isPending ? "Uploading..." : "Submit Payment"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : finalUploaded ? (
                      <div className="animate-in fade-in duration-300 space-y-4"
                      >
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start gap-3">
                          <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-blue-700 dark:text-blue-200">Waiting for Admin Approval</p>
                            <p className="text-sm text-blue-600 dark:text-blue-300">Your final payment screenshot has been received. The admin will review and approve it shortly.</p>
                          </div>
                        </div>
                        {booking.finalPaymentScreenshot && (
                          <div>
                            <p className="text-sm font-semibold mb-2 text-muted-foreground">Payment Proof</p>
                            <img src={booking.finalPaymentScreenshot} alt="Final payment screenshot" className="w-full max-w-xs border rounded-lg shadow-sm" data-testid="img-final-screenshot-customer" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="animate-in fade-in duration-300 space-y-4"
                      >
                        <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800 flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-green-700 dark:text-green-200">Payment Approved</p>
                            <p className="text-sm text-green-600 dark:text-green-300">Thank you! Your final payment has been confirmed and approved by the admin.</p>
                          </div>
                        </div>
                        {booking.finalPaymentScreenshot && (
                          <div>
                            <p className="text-sm font-semibold mb-2 text-muted-foreground">Payment Proof</p>
                            <img src={booking.finalPaymentScreenshot} alt="Final payment screenshot" className="w-full max-w-xs border rounded-lg shadow-sm" data-testid="img-final-screenshot-customer" />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {allPaid && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <Invoice booking={booking} companyInfo={companyInfo} isAdmin={false} />
                <Card className="border-green-300 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/10 overflow-hidden">
                  <CardContent className="pt-8 pb-8">
                    <div className="text-center space-y-4">
                      <div className="animate-in fade-in duration-300 relative"
                      >
                        <div className="absolute inset-0 bg-green-400/20 blur-xl rounded-full" />
                        <CheckCircle className="w-20 h-20 text-green-600 mx-auto relative" data-testid="icon-all-paid" />
                      </div>
                      <h3 className="text-2xl font-bold text-green-700 dark:text-green-200">All Payments Complete!</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Your booking is fully confirmed. We'll contact you soon with event details and preparations.
                      </p>
                      <Button onClick={() => setLocation("/")} data-testid="button-back-home-final" className="mt-4">
                        Back to Home
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="animate-in fade-in duration-300">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Payment Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Calculation</span>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{booking.guestCount} guests</span>
                      <span>× ₹{booking.pricePerPlate}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-1 mt-1">
                      <span>Subtotal</span>
                      <span data-testid="text-summary-subtotal">₹{baseAmount.toLocaleString('en-IN')}</span>
                    </div>
                    {booking.totalAmount && booking.totalAmount !== baseAmount && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Adjusted Total</span>
                        <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className={`flex items-center justify-between p-3 rounded-lg ${advancePaid ? 'bg-green-50 dark:bg-green-950/30' : 'bg-amber-50 dark:bg-amber-950/30'}`}>
                    <div className="flex items-center gap-2">
                      {advancePaid ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-600" />
                      )}
                      <div>
                        <span className="text-sm font-medium">Advance (50%)</span>
                        <p className={`text-xs ${advancePaid ? 'text-green-600' : 'text-amber-600'}`} data-testid="text-advance-summary-status">
                          {advancePaid ? "Paid" : "Awaiting"}
                        </p>
                      </div>
                    </div>
                    <span className={`font-semibold ${advancePaid ? 'text-green-600' : ''}`} data-testid="text-advance-summary">
                      ₹{advanceAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-lg ${finalPaid ? 'bg-green-50 dark:bg-green-950/30' : advancePaid ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-muted/50'}`}>
                    <div className="flex items-center gap-2">
                      {finalPaid ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : advancePaid ? (
                        <Clock className="w-5 h-5 text-blue-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <div>
                        <span className="text-sm font-medium">Final (50%)</span>
                        <p className={`text-xs ${finalPaid ? 'text-green-600' : advancePaid ? 'text-blue-600' : 'text-muted-foreground'}`} data-testid="text-final-summary-status">
                          {finalPaid ? "Paid" : advancePaid ? "Awaiting" : "After advance"}
                        </p>
                      </div>
                    </div>
                    <span className={`font-semibold ${finalPaid ? 'text-green-600' : ''}`} data-testid="text-final-summary">
                      ₹{finalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary" data-testid="text-total-summary">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {allPaid && (
                    <div className="mt-2 text-center">
                      <Badge variant="default" className="bg-green-600">Fully Paid</Badge>
                    </div>
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
