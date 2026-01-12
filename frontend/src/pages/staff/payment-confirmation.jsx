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
import { useState, useEffect } from "react";

import { API_URL } from "@/lib/queryClient";

export default function PaymentConfirmation() {
  const { bookingId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [advanceFile, setAdvanceFile] = useState(null);
  const [finalFile, setFinalFile] = useState(null);
  const [advancePreview, setAdvancePreview] = useState(null);
  const [finalPreview, setFinalPreview] = useState(null);

  const { data: companyInfo } = useQuery({
    queryKey: ["/api/company-info"],
  });

  useEffect(() => {
    if (companyInfo?.primaryColor) {
      document.documentElement.style.setProperty('--primary', companyInfo.primaryColor);
    }
  }, [companyInfo?.primaryColor]);

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
                        <img src={booking.advancePaymentScreenshot} alt="Advance payment screenshot" className="w-full max-xs border rounded-lg shadow-sm" data-testid="img-advance-screenshot-customer" />
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
                        <img src={booking.advancePaymentScreenshot} alt="Advance payment screenshot" className="w-full max-xs border rounded-lg shadow-sm" data-testid="img-advance-screenshot-customer" />
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
                            <p className="text-sm font-semibold mb-2 text-muted-foreground">Final Payment Proof</p>
                            <img src={booking.finalPaymentScreenshot} alt="Final payment screenshot" className="w-full max-xs border rounded-lg shadow-sm" data-testid="img-final-screenshot-customer" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="animate-in fade-in duration-300 space-y-4"
                      >
                        <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800 flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-green-700 dark:text-green-200">Final Payment Confirmed</p>
                            <p className="text-sm text-green-600 dark:text-green-300">Your booking is now fully paid. Thank you!</p>
                          </div>
                        </div>
                        {booking.finalPaymentScreenshot && (
                          <div>
                            <p className="text-sm font-semibold mb-2 text-muted-foreground">Final Payment Proof</p>
                            <img src={booking.finalPaymentScreenshot} alt="Final payment screenshot" className="w-full max-xs border rounded-lg shadow-sm" data-testid="img-final-screenshot-customer" />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="animate-in fade-in duration-300 delay-150 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Event Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start text-sm">
                    <span className="text-muted-foreground">Base Amount</span>
                    <span className="font-medium">₹{baseAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-start text-sm">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-bold text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-start text-sm border-t pt-2">
                    <span className="text-muted-foreground">Advance (50%)</span>
                    <span className={`font-medium ${advancePaid ? 'text-green-600' : 'text-amber-600'}`}>
                      ₹{advanceAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-start text-sm">
                    <span className="text-muted-foreground">Final Balance</span>
                    <span className={`font-medium ${finalPaid ? 'text-green-600' : 'text-foreground'}`}>
                      ₹{finalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg space-y-3 border border-dashed mt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${advancePaid ? 'text-green-600' : 'text-muted-foreground'}`} />
                    <span className={`text-xs ${advancePaid ? 'text-green-700' : 'text-muted-foreground'}`}>Advance Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${finalPaid ? 'text-green-600' : 'text-muted-foreground'}`} />
                    <span className={`text-xs ${finalPaid ? 'text-green-700' : 'text-muted-foreground'}`}>Final Payment</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold px-1 text-muted-foreground">Actions</h3>
              <Invoice booking={booking} companyInfo={companyInfo} />
              <Button variant="outline" className="w-full gap-2" onClick={() => window.print()} data-testid="button-print-payment">
                Print Payment Details
              </Button>
            </div>

            <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
              <h3 className="font-semibold text-primary mb-2">Need Assistance?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions regarding your payment or booking details, feel free to contact us.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">{companyInfo?.contactPhone}</p>
                <p className="text-sm font-medium">{companyInfo?.contactEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
