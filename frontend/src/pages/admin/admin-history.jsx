import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  History,
  IndianRupee,
  Search,
  Trash2,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ConfirmDialog } from "@/components/features/confirm-dialog";

const todayInput = () => new Date().toISOString().split("T")[0];
const yearStartInput = () => new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0];

const getTotal = (booking) =>
  Number(booking.totalAmount) || (Number(booking.guestCount) || 0) * (Number(booking.pricePerPlate) || 0);

const getAdvance = (booking) => Number(booking.advanceAmount) || Math.ceil(getTotal(booking) * 0.5);

const getFinal = (booking) => getTotal(booking) - getAdvance(booking);

const getDate = (booking) => {
  const date = new Date(booking.eventDate);
  return Number.isNaN(date.getTime()) ? null : date;
};

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const statusStyle = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

function paymentSummary(booking) {
  const advanceAmount = getAdvance(booking);
  const finalAmount = getFinal(booking);
  const advanceApproved = booking.advancePaymentStatus === "paid" && booking.advancePaymentApprovalStatus === "approved";
  const finalApproved = booking.finalPaymentStatus === "paid" && booking.finalPaymentApprovalStatus === "approved";
  const collected = (advanceApproved ? advanceAmount : 0) + (finalApproved ? finalAmount : 0);
  return {
    collected,
    balance: Math.max(getTotal(booking) - collected, 0),
    label: finalApproved ? "Paid" : advanceApproved ? "Advance Paid" : booking.advancePaymentStatus === "paid" ? "Review" : "Pending",
  };
}

export default function AdminHistory() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState(yearStartInput());
  const [endDate, setEndDate] = useState(todayInput());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);

  const deleteBookingMutation = useMutation({
    mutationFn: (id) => apiRequest("DELETE", `/api/bookings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Booking deleted", description: "The booking record has been permanently removed." });
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/bookings"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "All bookings deleted", description: "The entire booking history has been cleared." });
      setShowDeleteAll(false);
    },
    onError: (error) => {
      toast({ title: "Failed to delete all", description: error.message, variant: "destructive" });
    },
  });

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const filteredBookings = useMemo(() => {
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;
    const needle = search.trim().toLowerCase();

    return bookings
      .filter((booking) => {
        const eventDate = getDate(booking);
        if (start && eventDate && eventDate < start) return false;
        if (end && eventDate && eventDate > end) return false;
        if (status !== "all" && booking.status !== status) return false;
        if (!needle) return true;
        return [booking.clientName, booking.contactPhone, booking.contactEmail, booking.eventType]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));
      })
      .sort((a, b) => (getDate(b)?.getTime() || 0) - (getDate(a)?.getTime() || 0));
  }, [bookings, endDate, search, startDate, status]);

  const totals = useMemo(() => {
    const summary = filteredBookings.reduce((acc, booking) => {
      const payment = paymentSummary(booking);
      const total = getTotal(booking);
      acc.revenue += ["confirmed", "completed"].includes(booking.status) ? total : 0;
      acc.collected += payment.collected;
      acc.balance += payment.balance;
      acc.guests += Number(booking.guestCount) || 0;
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      acc.eventTypes[booking.eventType || "Other"] = (acc.eventTypes[booking.eventType || "Other"] || 0) + 1;
      return acc;
    }, { revenue: 0, collected: 0, balance: 0, guests: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, eventTypes: {} });

    const topEventType = Object.entries(summary.eventTypes).sort((a, b) => b[1] - a[1])[0];
    return { ...summary, topEventType };
  }, [filteredBookings]);

  const exportHistory = () => {
    if (!filteredBookings.length) {
      toast({ title: "No records", description: "There are no records to export", variant: "destructive" });
      return;
    }

    const rows = filteredBookings.map((booking) => {
      const payment = paymentSummary(booking);
      return {
        Client: booking.clientName,
        EventDate: booking.eventDate,
        EventType: booking.eventType,
        Guests: booking.guestCount,
        Status: booking.status,
        TotalRevenue: getTotal(booking),
        Collected: payment.collected,
        Balance: payment.balance,
        Payment: payment.label,
        Phone: booking.contactPhone,
        Email: booking.contactEmail,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet["!cols"] = Object.keys(rows[0]).map(() => ({ wch: 20 }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Booking History");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `booking_history_${todayInput()}.xlsx`);
    toast({ title: "Exported", description: "Booking history report downloaded" });
  };

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
    { label: "Recorded Revenue", value: money(totals.revenue), icon: IndianRupee, hint: "Confirmed and completed bookings" },
    { label: "Collected", value: money(totals.collected), icon: WalletCards, hint: `${money(totals.balance)} balance` },
    { label: "Bookings", value: filteredBookings.length, icon: Calendar, hint: `${totals.completed} completed, ${totals.pending} pending` },
    { label: "Guests Served", value: totals.guests.toLocaleString("en-IN"), icon: Users, hint: totals.topEventType ? `Top: ${totals.topEventType[0]}` : "No event type yet" },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Booking History</h1>
              <p className="text-muted-foreground">Permanent records for revenue, bookings, payments, clients, and event activity.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button onClick={exportHistory} className="w-full gap-2 sm:w-auto">
            <Download className="h-4 w-4" />
            Export History
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteAll(true)}
            className="w-full gap-2 sm:w-auto"
            disabled={bookings.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Delete All Bookings
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
              <metric.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{metric.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Records</CardTitle>
            <CardDescription>Search and filter the full booking ledger.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_150px_150px_150px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search client, phone, email, event..." className="pl-9" />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No records match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    const payment = paymentSummary(booking);
                    return (
                      <TableRow key={booking.id || booking._id}>
                        <TableCell>
                          <p className="font-semibold">{booking.clientName}</p>
                          <p className="text-xs text-muted-foreground">{booking.contactPhone || booking.contactEmail}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{booking.eventType}</p>
                          <p className="text-xs text-muted-foreground">
                            {getDate(booking) ? format(getDate(booking), "dd MMM yyyy") : "No date"} · {booking.guestCount || 0} guests
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusStyle[booking.status] || ""}>{booking.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="secondary">{payment.label}</Badge>
                            <p className="text-xs text-muted-foreground">Balance {money(payment.balance)}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-bold">{money(getTotal(booking))}</p>
                          <p className="text-xs text-muted-foreground">Collected {money(payment.collected)}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(booking)}
                            title="Delete booking"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {["completed", "confirmed", "pending", "cancelled"].map((key) => (
                <div key={key} className="flex items-center justify-between rounded-lg border bg-muted/20 p-3">
                  <div className="flex items-center gap-2">
                    {key === "completed" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                    <span className="capitalize">{key}</span>
                  </div>
                  <span className="font-bold">{totals[key] || 0}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Type Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(totals.eventTypes).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="truncate">{type}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
              {Object.keys(totals.eventTypes).length === 0 && (
                <p className="text-sm text-muted-foreground">No event records yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Booking Record"
        description={`Permanently delete booking for "${deleteTarget?.clientName || 'this client'}"? This cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteBookingMutation.isPending}
        onConfirm={() => deleteTarget && deleteBookingMutation.mutate(deleteTarget._id || deleteTarget.id)}
      />

      <ConfirmDialog
        open={showDeleteAll}
        onOpenChange={(open) => !open && setShowDeleteAll(false)}
        title="Delete All Bookings"
        description={`This will permanently delete ALL ${bookings.length} booking records. This action cannot be undone.`}
        confirmText="Delete All"
        variant="destructive"
        isLoading={deleteAllMutation.isPending}
        onConfirm={() => deleteAllMutation.mutate()}
      />
    </div>
  );
}
