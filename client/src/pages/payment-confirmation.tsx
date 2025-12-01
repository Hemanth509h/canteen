import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { UPIPayment } from "@/components/upi-payment";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Check, MessageCircle } from "lucide-react";
import { type EventBooking, type CompanyInfo } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

interface PaymentConfirmationProps {
  bookingId: string;
}

export default function PaymentConfirmation({ bookingId }: PaymentConfirmationProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [advanceFile, setAdvanceFile] = useState<File | null>(null);
  const [finalFile, setFinalFile] = useState<File | null>(null);
  const [advancePreview, setAdvancePreview] = useState<string | null>(null);
  const [finalPreview, setFinalPreview] = useState<string | null>(null);

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
    const phoneNumber = booking?.contactPhone?.replace(/\D/g, "");
    if (phoneNumber) {
      const message = encodeURIComponent(
        `Hi ${booking?.clientName}, please use this link for your event booking: ${window.location.origin}/payment/${bookingId}`
      );
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
    }
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
  const advanceAmount = Math.ceil(totalAmount * 0.5);
  const finalAmount = totalAmount - advanceAmount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="gap-2 mb-4"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">Payment Confirmation</h1>
          <p className="text-muted-foreground">Complete your booking payment</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Booking Details */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-semibold">{booking.clientName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-semibold text-sm">{booking.contactEmail}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Event Date</Label>
                    <p className="font-semibold">{new Date(booking.eventDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Event Type</Label>
                    <p className="font-semibold">{booking.eventType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Guest Count</Label>
                    <p className="font-semibold">{booking.guestCount}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Price per Plate</Label>
                    <p className="font-semibold">₹{booking.pricePerPlate}</p>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div>
                    <Label className="text-muted-foreground">Special Requests</Label>
                    <p className="text-sm">{booking.specialRequests}</p>
                  </div>
                )}

                <div className="pt-4 border-t space-y-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advance Payment */}
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {booking.advancePaymentStatus === "paid" && <Check className="w-5 h-5 text-green-600" />}
                  Advance Payment (50%)
                </CardTitle>
                <CardDescription>₹{advanceAmount}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {booking.advancePaymentStatus === "pending" ? (
                  <>
                    <UPIPayment
                      upiId={companyInfo?.upiId}
                      totalAmount={advanceAmount}
                      bookingId={bookingId}
                      clientName={booking.clientName}
                    />

                    <div className="border-t pt-4">
                      <Label className="text-base font-semibold mb-3 block">Upload Payment Screenshot</Label>
                      <div className="space-y-3">
                        {advancePreview && (
                          <div className="relative w-full max-w-xs">
                            <img src={advancePreview} alt="Preview" className="w-full border rounded-lg" />
                          </div>
                        )}
                        <div className="flex gap-2">
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
                            Upload
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg text-green-700 dark:text-green-200">
                    ✓ Advance payment completed
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Final Payment */}
            {booking.advancePaymentStatus === "paid" && (
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {booking.finalPaymentStatus === "paid" && <Check className="w-5 h-5 text-green-600" />}
                    Final Payment (50%)
                  </CardTitle>
                  <CardDescription>₹{finalAmount}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.finalPaymentStatus === "pending" ? (
                    <>
                      <UPIPayment
                        upiId={companyInfo?.upiId}
                        totalAmount={finalAmount}
                        bookingId={bookingId}
                        clientName={booking.clientName}
                      />

                      <div className="border-t pt-4">
                        <Label className="text-base font-semibold mb-3 block">Upload Payment Screenshot</Label>
                        <div className="space-y-3">
                          {finalPreview && (
                            <div className="relative w-full max-w-xs">
                              <img src={finalPreview} alt="Preview" className="w-full border rounded-lg" />
                            </div>
                          )}
                          <div className="flex gap-2">
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
                              Upload
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg text-green-700 dark:text-green-200">
                      ✓ Final payment completed
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {booking.advancePaymentStatus === "paid" && booking.finalPaymentStatus === "paid" && (
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="text-4xl">✓</div>
                    <h3 className="text-xl font-bold text-green-700 dark:text-green-200">All Payments Received!</h3>
                    <p className="text-muted-foreground">Your booking is confirmed. We'll contact you soon with details.</p>
                    <Button onClick={() => setLocation("/")} data-testid="button-back-home-final" className="w-full mt-4">
                      Back to Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Summary Card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="sticky top-4">
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>Payment Summary</CardTitle>
                  <Button
                    onClick={handleOpenWhatsApp}
                    variant="default"
                    size="sm"
                    className="gap-2 whitespace-nowrap"
                    data-testid="button-open-whatsapp"
                    title="Send payment link via WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({booking.guestCount} guests)</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      Advance (50%)
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {booking.advancePaymentStatus === "paid" ? "✓ Paid" : "Pending"}
                      </span>
                    </span>
                    <span className={booking.advancePaymentStatus === "paid" ? "text-green-600 font-semibold" : ""}>
                      ₹{advanceAmount}
                    </span>
                  </div>
                  {booking.advancePaymentStatus === "paid" && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        Final (50%)
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {booking.finalPaymentStatus === "paid" ? "✓ Paid" : "Pending"}
                        </span>
                      </span>
                      <span className={booking.finalPaymentStatus === "paid" ? "text-green-600 font-semibold" : ""}>
                        ₹{finalAmount}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
