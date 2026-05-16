import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, CreditCard, IndianRupee, Search, AlertCircle, CheckCircle2, Clock, ExternalLink, Smartphone, Copy, Check, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import branding from "@/lib/branding.json";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getTotal = (booking) =>
  Number(booking.totalAmount) || (Number(booking.guestCount) || 0) * (Number(booking.pricePerPlate) || 0);

const getAdvance = (booking) => Number(booking.advanceAmount) || Math.ceil(getTotal(booking) * 0.5);

const getFinal = (booking) => getTotal(booking) - getAdvance(booking);

function getPaymentState(booking) {
  const advanceAmount = getAdvance(booking);
  const finalAmount = getFinal(booking);
  const advanceApproved = booking.advancePaymentStatus === "paid" && booking.advancePaymentApprovalStatus === "approved";
  const finalApproved = booking.finalPaymentStatus === "paid" && booking.finalPaymentApprovalStatus === "approved";
  const advanceReview = booking.advancePaymentStatus === "paid" && booking.advancePaymentApprovalStatus === "pending";
  const finalReview = booking.finalPaymentStatus === "paid" && booking.finalPaymentApprovalStatus === "pending";
  const collected = (advanceApproved ? advanceAmount : 0) + (finalApproved ? finalAmount : 0);
  const total = getTotal(booking);

  let status = "pending";
  if (advanceReview || finalReview) status = "review";
  else if (advanceApproved && finalApproved) status = "paid";
  else if (advanceApproved) status = "partial";

  return {
    total,
    advanceAmount,
    finalAmount,
    collected,
    balance: Math.max(total - collected, 0),
    status,
    advanceApproved,
    finalApproved,
    advanceReview,
    finalReview,
  };
}

const statusLabel = {
  all: "All Payments",
  review: "Needs Review",
  pending: "Pending",
  partial: "Partial",
  paid: "Paid",
};

const statusClass = {
  review: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-muted text-muted-foreground border-border",
  partial: "bg-blue-50 text-blue-700 border-blue-200",
  paid: "bg-green-50 text-green-700 border-green-200",
};

export default function AdminPayments() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [upiId, setUpiId] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const { data: companyInfo = {}, isLoading: loadingCompanyInfo } = useQuery({
    queryKey: ["/api/company-info"],
  });

  useEffect(() => {
    setUpiId(companyInfo?.upiId || "");
  }, [companyInfo?.upiId]);

  const upiPreviewLink = useMemo(() => {
    const id = upiId.trim();
    if (!id) return "";
    return `upi://pay?pa=${encodeURIComponent(id)}&pn=${encodeURIComponent(companyInfo?.companyName || branding.companyName)}&tn=${encodeURIComponent("Payment Collection")}`;
  }, [companyInfo?.companyName, upiId]);

  const updateUpiMutation = useMutation({
    mutationFn: (data) => apiRequest("PATCH", "/api/company-info", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-info"] });
      toast({ title: "UPI collection updated", description: "Payment collection UPI ID is ready for customer payment links." });
    },
    onError: (error) => {
      toast({ title: "Failed to update UPI ID", description: error.message, variant: "destructive" });
    },
  });

  const handleSaveUpi = () => {
    const trimmedUpiId = upiId.trim();
    if (!trimmedUpiId) {
      toast({ title: "UPI ID required", description: "Enter a UPI ID before saving.", variant: "destructive" });
      return;
    }
    updateUpiMutation.mutate({ upiId: trimmedUpiId });
  };

  const copyUpi = async () => {
    const trimmedUpiId = upiId.trim();
    if (!trimmedUpiId) return;
    await navigator.clipboard.writeText(trimmedUpiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const paymentRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return bookings
      .map((booking) => ({ booking, payment: getPaymentState(booking) }))
      .filter(({ booking, payment }) => {
        if (filter !== "all" && payment.status !== filter) return false;
        if (!needle) return true;
        return [booking.clientName, booking.contactPhone, booking.contactEmail, booking.eventType, booking.status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));
      })
      .sort((a, b) => {
        const priority = { review: 0, pending: 1, partial: 2, paid: 3 };
        const diff = priority[a.payment.status] - priority[b.payment.status];
        if (diff !== 0) return diff;
        return new Date(b.booking.eventDate).getTime() - new Date(a.booking.eventDate).getTime();
      });
  }, [bookings, filter, search]);

  const totals = useMemo(() => {
    return bookings.reduce((acc, booking) => {
      const payment = getPaymentState(booking);
      acc.total += payment.total;
      acc.collected += payment.collected;
      acc.balance += payment.balance;
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, { total: 0, collected: 0, balance: 0, review: 0, pending: 0, partial: 0, paid: 0 });
  }, [bookings]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const metrics = [
    { title: "Total Billing", value: money(totals.total), icon: IndianRupee, hint: "All booking totals" },
    { title: "Collected", value: money(totals.collected), icon: CheckCircle2, hint: `${totals.paid} fully paid` },
    { title: "Balance Due", value: money(totals.balance), icon: Clock, hint: `${totals.pending + totals.partial} not fully paid` },
    { title: "Needs Review", value: totals.review, icon: AlertCircle, hint: "Uploaded screenshots" },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Payments</h1>
              <p className="text-muted-foreground">Track every customer payment, approval, balance, and collection status.</p>
            </div>
          </div>
        </div>
        <Button onClick={() => setFilter("review")} variant={totals.review > 0 ? "default" : "outline"} className="gap-2">
          <AlertCircle className="h-4 w-4" />
          Review Queue ({totals.review})
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{metric.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>UPI Collection Settings</CardTitle>
                <CardDescription>Set the UPI ID customers use on payment links, invoices, and QR codes.</CardDescription>
              </div>
            </div>
            <Badge variant={companyInfo?.upiId ? "default" : "secondary"}>
              {companyInfo?.upiId ? "Configured" : "Not configured"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_180px]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment-upi-id">UPI ID for Payment Collection</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="payment-upi-id"
                    value={upiId}
                    onChange={(event) => setUpiId(event.target.value)}
                    placeholder="example@upi"
                    disabled={loadingCompanyInfo || updateUpiMutation.isPending}
                    data-testid="input-payment-upi-id"
                  />
                  <Button type="button" onClick={handleSaveUpi} disabled={loadingCompanyInfo || updateUpiMutation.isPending}>
                    {updateUpiMutation.isPending ? "Saving..." : "Save UPI"}
                  </Button>
                  <Button type="button" variant="outline" size="icon" onClick={copyUpi} disabled={!upiId.trim()} aria-label="Copy UPI ID">
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Current UPI</p>
                  <p className="mt-1 truncate font-mono text-sm">{companyInfo?.upiId || "Not set"}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Used On</p>
                  <p className="mt-1 text-sm font-medium">Payment page and invoices</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Preview Link</p>
                  <p className="mt-1 truncate font-mono text-sm">{upiPreviewLink || "Add UPI ID"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center rounded-lg border bg-white p-4">
              {upiPreviewLink ? (
                <QRCodeCanvas value={upiPreviewLink} size={140} includeMargin />
              ) : (
                <div className="flex h-[140px] w-[140px] items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <QrCode className="h-10 w-10" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>All Payment Records</CardTitle>
              <CardDescription>{paymentRows.length} records shown from {bookings.length} bookings</CardDescription>
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(240px,1fr)_180px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search client, event, phone..."
                  className="pl-9"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="review">Needs Review</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Advance</TableHead>
                <TableHead>Final</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No payment records match the current filter.
                  </TableCell>
                </TableRow>
              ) : (
                paymentRows.map(({ booking, payment }) => (
                  <TableRow key={booking.id || booking._id}>
                    <TableCell>
                      <p className="font-semibold">{booking.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        <CalendarDays className="mr-1 inline h-3 w-3" />
                        {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString("en-IN") : "No date"} · {booking.eventType}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusClass[payment.status]}>
                        {statusLabel[payment.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{money(payment.advanceAmount)}</p>
                        <Badge variant={payment.advanceApproved ? "default" : payment.advanceReview ? "outline" : "secondary"} className="text-[10px]">
                          {payment.advanceApproved ? "Approved" : payment.advanceReview ? "Review" : "Pending"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{money(payment.finalAmount)}</p>
                        <Badge variant={payment.finalApproved ? "default" : payment.finalReview ? "outline" : "secondary"} className="text-[10px]">
                          {payment.finalApproved ? "Approved" : payment.finalReview ? "Review" : "Pending"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-bold">{money(payment.total)}</p>
                      <p className="text-xs text-muted-foreground">Balance {money(payment.balance)}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => setLocation(`/admin/bookings/payment/${booking._id || booking.id}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
