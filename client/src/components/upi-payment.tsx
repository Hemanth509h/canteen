import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UPIPaymentProps {
  upiId: string;
  amount: number;
  bookingId: string;
  clientName: string;
}

export function UPIPayment({ upiId, amount, bookingId, clientName }: UPIPaymentProps) {
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");

  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(clientName)}&tn=Catering%20Booking%20${bookingId}&am=${amount}&tr=${bookingId}`;

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
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-3xl font-bold text-primary">₹{amount.toLocaleString('en-IN')}</p>
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
                <strong>Transfer Amount:</strong> ₹{amount.toLocaleString('en-IN')} to {upiId}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
