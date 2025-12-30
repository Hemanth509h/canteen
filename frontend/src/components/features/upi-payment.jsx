import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Copy, Check, QrCode, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UPIPayment({ upiId, totalAmount, bookingId, clientName, paymentType = "advance" }) {
  const [copied, setCopied] = useState(false);
  const [amountCopied, setAmountCopied] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");

  const paymentLabel = paymentType === "advance" ? "Advance" : "Final";
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(clientName)}&tn=${paymentLabel}%20Payment%20${bookingId}&am=${totalAmount}&tr=${bookingId}-${paymentType}`;

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qr = await import("qrcode");
        const dataUrl = await qr.toDataURL(upiString, {
          width: 280,
          margin: 2,
          color: {
            dark: '#1a1a1a',
            light: '#ffffff'
          }
        });
        setQrCode(dataUrl);
      } catch (error) {
        console.error("QR Code generation failed:", error);
      }
    };
    generateQR();
  }, [upiString]);

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAmount = () => {
    navigator.clipboard.writeText(totalAmount.toString());
    setAmountCopied(true);
    setTimeout(() => setAmountCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <IndianRupee className="w-4 h-4" />
          {paymentLabel} Payment via UPI
        </div>
        <p className="text-sm text-muted-foreground">Scan QR code or use UPI ID to complete {paymentLabel.toLowerCase()} payment</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute -inset-3 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl opacity-50" />
            <Card className="relative p-3 bg-white dark:bg-white shadow-xl border-2">
              {qrCode ? (
                <img 
                  src={qrCode} 
                  alt="UPI QR Code" 
                  className="w-[220px] h-[220px] md:w-[260px] md:h-[260px]"
                  data-testid="img-qr-code"
                />
              ) : (
                <div className="w-[220px] h-[220px] md:w-[260px] md:h-[260px] bg-muted animate-pulse rounded flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-muted-foreground/30" />
                </div>
              )}
            </Card>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
            <Smartphone className="w-4 h-4" />
            <span>Scan with any UPI app</span>
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-6">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20">
            <p className="text-sm text-muted-foreground font-medium mb-1">{paymentLabel} Amount to Pay</p>
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold text-foreground">₹{totalAmount.toLocaleString('en-IN')}</span>
              <Button 
                size="sm"
                variant="ghost"
                onClick={copyAmount}
                data-testid="button-copy-amount"
                className="gap-1"
              >
                {amountCopied ? <Check className="w-4 h-4 text-green-600" /> Copy className="w-4 h-4" />}
                {amountCopied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">UPI ID</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted border rounded-lg px-4 py-3 font-mono text-base overflow-hidden text-ellipsis">
                {upiId || "Loading..."}
              </div>
              <Button 
                size="icon"
                variant="outline"
                onClick={copyUpiId}
                data-testid="button-copy-upi"
                className="h-12 w-12 shrink-0"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> Copy className="w-5 h-5" />}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 font-medium">
                UPI ID copied to clipboard
              </p>
            )}
          </div>

          <Card className="bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Payment Steps:</p>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                  <span>Open any UPI app (GPay, PhonePe, Paytm)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                  <span>Scan QR code or enter UPI ID</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                  <span>Pay ₹{totalAmount.toLocaleString('en-IN')} and upload screenshot below</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
