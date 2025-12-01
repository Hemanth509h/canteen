import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UPIPaymentProps {
  upiId: string;
  totalAmount: number;
  bookingId: string;
  clientName: string;
  advancePaymentStatus?: string;
  finalPaymentStatus?: string;
}

export function UPIPayment({ upiId, totalAmount, bookingId, clientName, advancePaymentStatus = "pending", finalPaymentStatus = "pending" }: UPIPaymentProps) {
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [paymentStage, setPaymentStage] = useState<"advance" | "final">("advance");
  
  const advanceAmount = Math.round(totalAmount * 0.5);
  const finalAmount = totalAmount - advanceAmount;
  const currentAmount = paymentStage === "advance" ? advanceAmount : finalAmount;

  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(clientName)}&tn=${paymentStage === "advance" ? "Advance" : "Final"}%20Payment%20${bookingId}&am=${currentAmount}&tr=${bookingId}`;

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qr = await import("qrcode");
        const dataUrl = await qr.toDataURL(upiString);
        setQrCode(dataUrl);
      } catch (error) {
        console.error("QR Code generation failed:", error);
      }
    };
    generateQR();
  }, [upiString]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <CardTitle>Payment Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-2 mb-6">
          <Button 
            variant={paymentStage === "advance" ? "default" : "outline"}
            onClick={() => setPaymentStage("advance")}
            data-testid="button-advance-payment"
            disabled={advancePaymentStatus === "paid"}
          >
            Advance Payment {advancePaymentStatus === "paid" && "✓"}
          </Button>
          <Button 
            variant={paymentStage === "final" ? "default" : "outline"}
            onClick={() => setPaymentStage("final")}
            data-testid="button-final-payment"
            disabled={finalPaymentStatus === "paid"}
          >
            Final Payment {finalPaymentStatus === "paid" && "✓"}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-lg border-2 border-primary/10">
              {qrCode ? (
                <img src={qrCode} alt="UPI QR Code" width={200} height={200} />
              ) : (
                <div className="w-[200px] h-[200px] bg-muted animate-pulse rounded" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">Scan to pay via UPI</p>
          </div>
          
          <div className="flex flex-col gap-4 md:border-l-2 md:border-primary/20 md:pl-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {paymentStage === "advance" ? "Advance Payment (50%)" : "Final Payment (50%)"}
              </p>
              <p className="text-3xl font-bold text-primary">₹{currentAmount.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground">Total: ₹{totalAmount.toLocaleString('en-IN')}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">UPI ID</p>
              <div className="flex items-center gap-2">
                <code className="bg-muted px-3 py-2 rounded font-mono text-sm">{upiId}</code>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={copyToClipboard}
                  data-testid="button-copy-upi"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-900 dark:text-blue-100">
                <strong>Transfer:</strong> ₹{currentAmount.toLocaleString('en-IN')} to {upiId}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
