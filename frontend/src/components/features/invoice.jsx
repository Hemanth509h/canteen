import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Loader2 } from "lucide-react";
import { printElement } from "@/lib/print-utils";
import branding from "@/lib/branding.json";

export function Invoice({ booking, companyInfo, isAdmin = false }) {
  const invoiceRef = useRef(null);
  const [isGeneratingPrint, setIsGeneratingPrint] = useState(false);

  const totalAmount = booking.totalAmount || (booking.guestCount * booking.pricePerPlate);
  const advanceAmount = booking.advanceAmount ?? Math.ceil(totalAmount * 0.5);
  const finalAmount = totalAmount - advanceAmount;

  const advancePaid = booking.advancePaymentStatus === "paid" && booking.advancePaymentApprovalStatus === "approved";
  const finalPaid = booking.finalPaymentStatus === "paid" && booking.finalPaymentApprovalStatus === "approved";

  const balanceAmount = totalAmount - (advancePaid ? advanceAmount : 0) - (finalPaid ? finalAmount : 0);
  const paymentStatus = balanceAmount <= 0 ? "PAID" : "UNPAID";

  const invoiceDate = new Date().toLocaleDateString("en-IN");
  const eventDate = new Date(booking.eventDate).toLocaleDateString("en-IN");
  const invoiceNumber = `INV-${(booking.id || booking._id || "").slice(-6).toUpperCase()}`;

  const handlePrint = async () => {
    setIsGeneratingPrint(true);
    await printElement(invoiceRef.current);
    setIsGeneratingPrint(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payment Receipt &amp; Invoice</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              disabled={isGeneratingPrint}
              data-testid="button-print-invoice"
            >
              {isGeneratingPrint ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Printer className="w-4 h-4 mr-2" />
              )}
              {isGeneratingPrint ? "Preparing..." : "Print"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={invoiceRef}
          className="bg-white p-10 space-y-6"
          style={{ width: "210mm", maxWidth: "100%", margin: "0 auto", boxSizing: "border-box" }}
        >
          {/* Header */}
          <div className="border-b-4 border-blue-600 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{companyInfo?.companyName || branding.companyName}</h1>
                <p className="text-xs text-gray-600 mt-1">{companyInfo?.tagline || branding.tagline}</p>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold text-blue-600">INVOICE</h2>
                <p className="text-sm text-gray-600 mt-2">#<span className="font-semibold">{invoiceNumber}</span></p>
                <p className="text-sm text-gray-600">Date: <span className="font-semibold">{invoiceDate}</span></p>
              </div>
            </div>
          </div>

          {/* Bill To & Event Details */}
          <div className="grid grid-cols-2 gap-8">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-bold uppercase text-gray-700 mb-3">Bill To</h3>
              <p className="text-sm font-semibold text-gray-900">{booking.clientName}</p>
              <p className="text-xs text-gray-600 mt-1">{booking.contactPhone}</p>
              <p className="text-xs text-gray-600">{booking.contactEmail}</p>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-bold uppercase text-gray-700 mb-3">Event Details</h3>
              <div className="space-y-1 text-xs">
                <p><span className="font-semibold text-gray-900">{booking.eventType}</span></p>
                <p className="text-gray-600">Date: <span className="font-semibold text-gray-900">{eventDate}</span></p>
                <p className="text-gray-600">Guests: <span className="font-semibold text-gray-900">{booking.guestCount}</span></p>
                {booking.servingStaff && (
                  <p className="text-gray-600">Staff: <span className="font-semibold text-gray-900">{booking.servingStaff}</span></p>
                )}
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
              <h4 className="text-sm font-semibold text-amber-900 mb-1">Special Requests</h4>
              <p className="text-xs text-amber-800">{booking.specialRequests}</p>
            </div>
          )}

          {/* Itemized Table */}
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-center w-20">Rate</th>
                <th className="p-3 text-center w-16">Qty</th>
                <th className="p-3 text-right w-24">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">{companyInfo?.companyName || branding.companyName}</td>
                <td className="p-3 text-center">₹{booking.pricePerPlate}</td>
                <td className="p-3 text-center">{booking.guestCount}</td>
                <td className="p-3 text-right font-semibold">₹{totalAmount}</td>
              </tr>
            </tbody>
          </table>

          {/* Payment Summary */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-800">Advance Payment (50%)</p>
                <p className="text-xs text-gray-600">₹{advanceAmount}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">₹{advancePaid ? advanceAmount : 0}</span>
                <Badge
                  className={`text-xs font-semibold ${
                    advancePaid
                      ? "bg-green-100 text-green-800"
                      : booking.advancePaymentStatus === "paid"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {advancePaid
                    ? "Approved"
                    : booking.advancePaymentStatus === "paid"
                    ? "Pending Approval"
                    : "Pending"}
                </Badge>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-800">Final Payment (50%)</p>
                <p className="text-xs text-gray-600">₹{finalAmount}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">₹{finalPaid ? finalAmount : 0}</span>
                <Badge
                  className={`text-xs font-semibold ${
                    finalPaid
                      ? "bg-green-100 text-green-800"
                      : booking.finalPaymentStatus === "paid"
                      ? "bg-yellow-100 text-yellow-800"
                      : advancePaid
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {finalPaid
                    ? "Approved"
                    : booking.finalPaymentStatus === "paid"
                    ? "Pending Approval"
                    : advancePaid
                    ? "Pending"
                    : "Awaiting Advance"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Balance Due */}
          <div className="border-t-2 pt-4 pb-2">
            <div className={`text-right p-4 rounded-lg ${balanceAmount <= 0 ? "bg-green-50" : "bg-red-50"}`}>
              <p className="text-xs text-gray-600 uppercase mb-1">Balance Due</p>
              <p className={`text-3xl font-bold ${balanceAmount <= 0 ? "text-green-600" : "text-red-600"}`}>
                ₹{Math.abs(balanceAmount)}
              </p>
            </div>
          </div>

          {/* PAID stamp */}
          {paymentStatus === "PAID" && (
            <div className="relative h-20 flex items-center justify-center">
              <div className="absolute text-6xl font-bold text-green-600 opacity-20 transform -rotate-45">
                ✓ PAID
              </div>
            </div>
          )}

          {/* UPI Info */}
          {balanceAmount > 0 && companyInfo?.upiId && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <h4 className="text-sm font-bold text-blue-900 mb-2">UPI Payment</h4>
              <p className="text-xs text-blue-800">UPI ID: <span className="font-mono font-semibold">{companyInfo.upiId}</span></p>
              <p className="text-xs text-blue-800 mt-1">Amount to Pay: <span className="font-semibold">₹{balanceAmount}</span></p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-4 flex justify-between text-xs text-gray-600">
            <div>
              <p className="font-semibold">Booking ID: <span className="font-mono">{booking.id}</span></p>
              <p className="mt-1 text-[10px]">Payment terms as agreed upon invoice date.</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Thank You!</p>
              <p className="mt-1">We appreciate your business and look forward to serving you again.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
