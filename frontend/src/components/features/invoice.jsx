import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer } from "lucide-react";
import { type EventBooking, type CompanyInfo } from "@/schema";

interface InvoiceProps {
  bookingventBooking;
  companyInfo?ompanyInfo;
  isAdmin?oolean;
}

export function Invoice({ booking, companyInfo, isAdmin = false }nvoiceProps) {
  const totalAmount = booking.totalAmount || (booking.guestCount * booking.pricePerPlate);
  // Use stored advance amount if available, otherwise calculate 50%
  const advanceAmount = booking.advanceAmount ?? Math.ceil(totalAmount * 0.5);
  const finalAmount = totalAmount - advanceAmount;
  
  // Real business logictatus is 'paid' only if APPROVED
  const advancePaid = booking.advancePaymentStatus === 'paid' && booking.advancePaymentApprovalStatus === 'approved';
  const finalPaid = booking.finalPaymentStatus === 'paid' && booking.finalPaymentApprovalStatus === 'approved';
  
  const balanceAmount = totalAmount - (advancePaid ? advanceAmount : 0) - (finalPaid ? finalAmount : 0);
  const paymentStatus = balanceAmount <= 0 ? "PAID" : "UNPAID";

  const invoiceDate = new Date().toLocaleDateString('en-IN');
  const eventDate = new Date(booking.eventDate).toLocaleDateString('en-IN');
  
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const invoiceHTML = document.getElementById('invoice-content')?.innerHTML;
    if (!invoiceHTML) return;
    
    const element = document.createElement('a');
    const file = new Blob([invoiceHTML], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `Invoice-${booking.id}-${invoiceDate.replace(/\//g, '-')}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="w-full">
      
        <div className="flex items-center justify-between">
          Payment Receipt & Invoice</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              data-testid="button-print-invoice"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              data-testid="button-download-invoice"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      
        <div
          id="invoice-content"
          className="space-y-6 bg-white dark:bg-slate-950 p-6 rounded-lg print:bg-white"
        >
          {/* Header */}
          <div className="border-b pb-4">
            <h1 className="text-2xl font-bold">{companyInfo?.companyName || 'OM Caterers'}</h1>
            <p className="text-xs text-muted-foreground mt-2">Invoice Date: {invoiceDate}</p>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-muted-foreground">Bill To:</p>
              <p className="font-semibold">{booking.clientName}</p>
              <p className="text-muted-foreground">{booking.contactEmail}</p>
              <p className="text-muted-foreground">{booking.contactPhone}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-muted-foreground">Booking Details:</p>
              <p>Event: {booking.eventType}</p>
              <p>Date: {eventDate}</p>
              <p>Guests: {booking.guestCount}</p>
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="bg-muted/50 p-3 rounded text-sm">
              <p className="font-semibold mb-1">Special Requests:</p>
              <p className="text-muted-foreground">{booking.specialRequests}</p>
            </div>
          )}

          {/* Payment Breakdown */}
          <div className="border-t pt-4">
            <p className="font-semibold mb-3">Payment Breakdown:</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Price per plate:</span>
                <span>₹{booking.pricePerPlate}</span>
              </div>
              <div className="flex justify-between">
                <span>Number of guests:</span>
                <span>{booking.guestCount}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="border-t pt-4">
            <p className="font-semibold mb-3">Payment Status:</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span>Advance Payment (50%):</span>
                <div className="text-right">
                  <p className="font-semibold">₹{advanceAmount}</p>
                  <p
                    className={`text-xs ${
                      advancePaid
                        ? 'text-green-600'
                        ooking.advancePaymentStatus === 'paid' && !advancePaid
                        ? 'text-amber-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {advancePaid ? 'Approved' ooking.advancePaymentStatus === 'paid' ? 'Pending Approval' : 'Pending'}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span>Final Payment (50%):</span>
                <div className="text-right">
                  <p className="font-semibold">₹{finalAmount}</p>
                  <p
                    className={`text-xs ${
                      finalPaid
                        ? 'text-green-600'
                        ooking.finalPaymentStatus === 'paid' && !finalPaid
                        ? 'text-amber-600'
                        dvancePaid ? 'text-blue-600' : 'text-muted-foreground'
                    }`}
                  >
                    {finalPaid ? 'Approved' ooking.finalPaymentStatus === 'paid' ? 'Pending Approval' dvancePaid ? 'Pending' : 'Awaiting Advance'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Final Total */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Balance Amount:</span>
              <span className={`text-xl font-bold ${balanceAmount <= 0 ? 'text-green-600' : 'text-destructive'}`}>
                ₹{balanceAmount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Payment Status:</span>
              <Badge variant={balanceAmount <= 0 ? "default" : "destructive"}>
                {paymentStatus}
              </Badge>
            </div>
          </div>

          {advancePaid && finalPaid && (
            <div className="border-t pt-4 bg-green-50 dark:bg-green-950/20 p-4 rounded">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Paid:</span>
                <span className="text-2xl font-bold text-green-600">₹{totalAmount}</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400 mt-2">
                Thank you! Full payment received.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-4 text-center text-xs text-muted-foreground">
            <p>Booking ID: {booking.id}</p>
            <p className="mt-2">Thank you for choosing {companyInfo?.companyName || 'OM Caterers'}!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
