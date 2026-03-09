import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Loader, ExternalLink, CheckCircle } from "lucide-react";

export function CashfreePayment({ 
  bookingId, 
  amount, 
  customerName, 
  customerEmail, 
  customerPhone,
  paymentType = "advance",
  onPaymentSuccess
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      // Call backend to initiate Cashfree payment
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          paymentType,
          amount,
          customerName,
          customerEmail,
          customerPhone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate payment");
      }

      const data = await response.json();
      const paymentLink = data.data?.paymentLink || data.paymentLink;

      if (!paymentLink) {
        throw new Error("No payment link received");
      }

      // Open Cashfree payment link
      window.open(paymentLink, "_blank");

      toast({
        title: "Payment Link Opened",
        description: "Complete your payment in the new window",
      });

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const paymentLabel = paymentType === "advance" ? "Advance" : "Final";

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <CreditCard className="w-4 h-4" />
          {paymentLabel} Payment via Cashfree
        </div>
        <p className="text-sm text-muted-foreground">
          Secure payment processing with Cashfree
        </p>
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">
                {paymentLabel} Amount
              </p>
              <p className="text-3xl font-bold text-primary">
                ₹{amount?.toLocaleString("en-IN")}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
          </div>

          <div className="pt-4 border-t border-primary/10">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Secure payment gateway
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Multiple payment options (Cards, UPI, NetBanking)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Instant payment confirmation
              </li>
            </ul>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full gap-2 h-12 text-base font-semibold"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Initializing Payment...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Pay ₹{amount?.toLocaleString("en-IN")} with Cashfree
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You will be redirected to Cashfree's secure payment page
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
