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
                  <Badge variant={advancePaid ? "default" : "outline"} className={advancePaid ? "bg-green-600" : ""}>
                    {advancePaid ? "Paid" : advanceUploaded ? "Reviewing" : "Pending"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border">
                  <div>
                    <p className="text-sm text-muted-foreground">Required Advance</p>
                    <p className="text-2xl font-bold text-primary">₹{advanceAmount.toLocaleString('en-IN')}</p>
                  </div>
                  {!advancePaid && !advanceUploaded && (
                    <div className="flex gap-2">
                      <Button onClick={() => document.getElementById('advance-upload').click()} variant="outline" size="sm" className="gap-2">
                        <Camera className="w-4 h-4" />
                        Upload
                      </Button>
                      <input id="advance-upload" type="file" className="hidden" accept="image/*" onChange={handleAdvanceFileChange} />
                    </div>
                  )}
                </div>

                {advancePreview && !advancePaid && (
                  <div className="relative mt-4">
                    <img src={advancePreview} alt="Advance preview" className="w-full h-48 object-cover rounded-lg border" />
                    <Button 
                      className="absolute bottom-2 right-2" 
                      onClick={() => uploadScreenshotMutation.mutate("advance")}
                      disabled={uploadScreenshotMutation.isPending}
                    >
                      {uploadScreenshotMutation.isPending ? "Uploading..." : "Confirm & Send"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={finalPaid ? "border-green-300 dark:border-green-800" : "border-blue-300 dark:border-blue-800"}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${finalPaid ? 'bg-green-600' : 'bg-blue-500'}`}>
                      {finalPaid ? <CheckCircle className="w-5 h-5" /> : '2'}
                    </div>
                    <div>
                      <CardTitle className="text-lg">Final Payment</CardTitle>
                      <p className="text-sm text-muted-foreground">Remaining balance</p>
                    </div>
                  </div>
                  <Badge variant={finalPaid ? "default" : "outline"} className={finalPaid ? "bg-green-600" : ""}>
                    {finalPaid ? "Paid" : finalUploaded ? "Reviewing" : "Pending"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border">
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining Balance</p>
                    <p className="text-2xl font-bold text-primary">₹{finalAmount.toLocaleString('en-IN')}</p>
                  </div>
                  {!finalPaid && !finalUploaded && advancePaid && (
                    <div className="flex gap-2">
                      <Button onClick={() => document.getElementById('final-upload').click()} variant="outline" size="sm" className="gap-2">
                        <Camera className="w-4 h-4" />
                        Upload
                      </Button>
                      <input id="final-upload" type="file" className="hidden" accept="image/*" onChange={handleFinalFileChange} />
                    </div>
                  )}
                </div>

                {finalPreview && !finalPaid && (
                  <div className="relative mt-4">
                    <img src={finalPreview} alt="Final preview" className="w-full h-48 object-cover rounded-lg border" />
                    <Button 
                      className="absolute bottom-2 right-2" 
                      onClick={() => uploadScreenshotMutation.mutate("final")}
                      disabled={uploadScreenshotMutation.isPending}
                    >
                      {uploadScreenshotMutation.isPending ? "Uploading..." : "Confirm & Send"}
                    </Button>
                  </div>
                )}
                
                {!advancePaid && !finalPaid && (
                  <p className="text-sm text-amber-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Complete advance payment first to unlock final payment.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <UPIPayment amount={!advancePaid ? advanceAmount : finalAmount} />
            <Invoice booking={booking} />
          </div>
        </div>
      </div>
    </div>
  );
}
