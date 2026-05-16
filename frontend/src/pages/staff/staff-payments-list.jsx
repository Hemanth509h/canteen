import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ChefHat,
  RefreshCw,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wallet,
  TrendingUp,
  Calendar,
  CreditCard,
  FileText,
} from "lucide-react";
import { format } from "date-fns";

const METHOD_LABELS = {
  cash: "Cash",
  upi: "UPI",
  bank_transfer: "Bank Transfer",
  card: "Card",
  other: "Other",
};

const STATUS_STYLES = {
  paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function StaffPaymentsListPage() {
  const [, setLocation] = useLocation();
  const [staff, setStaff] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const session = localStorage.getItem("staff_session");
    if (!session) {
      setLocation("/staff/login");
      return;
    }
    setStaff(JSON.parse(session));
  }, [setLocation]);

  const { data: payments = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["/api/staff-payments", staff?.id],
    queryFn: async () => {
      if (!staff?.id) return [];
      const res = await fetch(`/api/staff-payments?staffId=${staff.id}`);
      if (!res.ok) throw new Error("Failed to fetch payments");
      const json = await res.json();
      return json.data || json;
    },
    enabled: !!staff?.id,
    staleTime: 0,
  });

  // Also fetch booking assignments to enrich payment context
  const { data: assignments = [] } = useQuery({
    queryKey: ["/api/staff/assignments"],
    queryFn: async () => {
      if (!staff) return [];
      const res = await fetch("/api/staff/assignments", {
        headers: { Authorization: `Bearer ${staff.id}` },
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || json;
    },
    enabled: !!staff,
  });

  if (!staff) return null;

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const paidCount = payments.filter((p) => p.status === "paid").length;
  const pendingCount = payments.filter((p) => p.status === "pending").length;

  // Sort newest first
  const sorted = [...payments].sort(
    (a, b) => new Date(b.paymentDate || b.createdAt) - new Date(a.paymentDate || a.createdAt)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/staff/dashboard")}
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <ChefHat size={14} className="text-primary" />
            </div>
            <span className="font-semibold text-sm truncate">{staff.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wallet className="text-primary" size={22} />
            My Payments
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            All salary and payment records from admin
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Received</p>
              <p className="text-xl font-bold text-emerald-600">
                ₹{totalPaid.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{paidCount} payments</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Pending</p>
              <p className="text-xl font-bold text-amber-600">
                ₹{totalPending.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{pendingCount} pending</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
              <p className="text-xl font-bold">
                ₹{(totalPaid + totalPending).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{payments.length} records</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Assignments</p>
              <p className="text-xl font-bold">{assignments.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">total events</p>
            </CardContent>
          </Card>
        </div>

        {/* Payments list */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Payment History
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <Card className="border-dashed shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                  <IndianRupee className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-semibold text-lg">No payments yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Payments from admin will appear here once processed.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sorted.map((payment) => (
                <PaymentRecord key={payment.id} payment={payment} assignments={assignments} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function PaymentRecord({ payment, assignments }) {
  const isPaid = payment.status === "paid";

  // Try to find linked booking name
  const linkedAssignment = payment.bookingId
    ? assignments.find((a) => a.bookingId === payment.bookingId)
    : null;

  const dateStr = payment.paymentDate || payment.createdAt;
  const formattedDate = dateStr ? format(new Date(dateStr), "d MMM yyyy") : "—";

  return (
    <Card className={`shadow-sm transition-all ${isPaid ? "border-emerald-200/60 dark:border-emerald-800/40" : "border-amber-200/60 dark:border-amber-800/40"}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={`mt-0.5 p-2 rounded-full shrink-0 ${
                isPaid
                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                  : "bg-amber-100 dark:bg-amber-900/30"
              }`}
            >
              {isPaid ? (
                <CheckCircle2 size={16} className="text-emerald-600" />
              ) : (
                <Clock size={16} className="text-amber-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">
                  ₹{Number(payment.amount).toLocaleString("en-IN")}
                </span>
                <Badge
                  className={`text-[10px] px-2 py-0 shadow-none border-0 ${STATUS_STYLES[payment.status] || ""}`}
                >
                  {payment.status === "paid" ? "Paid" : "Pending"}
                </Badge>
              </div>

              {linkedAssignment?.booking && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  <span className="text-foreground/70 font-medium">
                    {linkedAssignment.booking.eventType}
                  </span>{" "}
                  — {linkedAssignment.booking.clientName}
                </p>
              )}

              {payment.notes && (
                <p className="text-xs text-muted-foreground mt-1 italic truncate">
                  {payment.notes}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard size={11} />
                  {METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod || "—"}
                </span>
                {payment.bookingId && (
                  <Link href={`/staff/payment/${payment.bookingId}`}>
                    <span className="flex items-center gap-1 text-primary hover:underline cursor-pointer">
                      <FileText size={11} />
                      View Booking
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
