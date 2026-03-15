import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/features/confirm-dialog";
import {
  IndianRupee, Plus, Trash2, Pencil, Search, Wallet,
  Banknote, Smartphone, CreditCard, Users, TrendingUp, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

const METHOD_LABELS = {
  cash: { label: "Cash", icon: Banknote },
  upi: { label: "UPI", icon: Smartphone },
  bank_transfer: { label: "Bank Transfer", icon: CreditCard },
};

const STATUS_STYLE = {
  paid: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
};

const EMPTY_FORM = {
  staffId: "",
  bookingId: "",
  amount: "",
  paymentDate: new Date().toISOString().split("T")[0],
  paymentMethod: "cash",
  notes: "",
  status: "paid",
};

export default function StaffPayments() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [filterStaff, setFilterStaff] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ["/api/staff-payments"],
    queryFn: async () => {
      const res = await fetch("/api/staff-payments");
      const json = await res.json();
      return json.data || json || [];
    },
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      const res = await fetch("/api/staff");
      const json = await res.json();
      return json.data || json || [];
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      const res = await fetch("/api/bookings");
      const json = await res.json();
      return json.data || json || [];
    },
  });

  const staffMap = useMemo(() => {
    const m = {};
    staffList.forEach((s) => { m[s.id || s._id] = s; });
    return m;
  }, [staffList]);

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      const staff = staffMap[p.staffId];
      const name = staff?.name?.toLowerCase() || "";
      const matchSearch = !search || name.includes(search.toLowerCase()) || (p.notes || "").toLowerCase().includes(search.toLowerCase());
      const matchStaff = filterStaff === "all" || p.staffId === filterStaff;
      const matchStatus = filterStatus === "all" || p.status === filterStatus;
      return matchSearch && matchStaff && matchStatus;
    });
  }, [payments, search, filterStaff, filterStatus, staffMap]);

  const totalPaid = useMemo(() => filtered.filter(p => p.status === "paid").reduce((s, p) => s + (p.amount || 0), 0), [filtered]);
  const totalPending = useMemo(() => filtered.filter(p => p.status === "pending").reduce((s, p) => s + (p.amount || 0), 0), [filtered]);

  const createMutation = useMutation({
    mutationFn: (data) => apiRequest("POST", "/api/staff-payments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-payments"] });
      toast({ title: "Payment recorded successfully" });
      closeDialog();
    },
    onError: (e) => toast({ title: "Failed to record payment", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiRequest("PATCH", `/api/staff-payments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-payments"] });
      toast({ title: "Payment updated" });
      closeDialog();
    },
    onError: (e) => toast({ title: "Failed to update payment", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest("DELETE", `/api/staff-payments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-payments"] });
      toast({ title: "Payment deleted" });
      setDeleteTarget(null);
    },
    onError: (e) => toast({ title: "Failed to delete", description: e.message, variant: "destructive" }),
  });

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      staffId: p.staffId || "",
      bookingId: p.bookingId || "",
      amount: p.amount?.toString() || "",
      paymentDate: p.paymentDate ? p.paymentDate.split("T")[0] : new Date().toISOString().split("T")[0],
      paymentMethod: p.paymentMethod || "cash",
      notes: p.notes || "",
      status: p.status || "paid",
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.staffId) return toast({ title: "Please select a staff member", variant: "destructive" });
    if (!form.amount || isNaN(parseFloat(form.amount))) return toast({ title: "Enter a valid amount", variant: "destructive" });

    const data = {
      staffId: form.staffId,
      bookingId: form.bookingId || undefined,
      amount: parseFloat(form.amount),
      paymentDate: form.paymentDate,
      paymentMethod: form.paymentMethod,
      notes: form.notes || undefined,
      status: form.status,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id || editing._id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white">Staff Payments</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Record and track payments made to your staff</p>
        </div>
        <Button onClick={openCreate} className="bg-amber-500 hover:bg-amber-400 text-white font-semibold shrink-0">
          <Plus size={16} className="mr-2" /> Record Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wide">Total Paid</p>
              <p className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white">₹{totalPaid.toLocaleString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wide">Pending</p>
              <p className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white">₹{totalPending.toLocaleString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wide">Total Records</p>
              <p className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white">{filtered.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Search by staff name or notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
              />
            </div>
            <Select value={filterStaff} onValueChange={setFilterStaff}>
              <SelectTrigger className="w-full sm:w-48 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                <SelectValue placeholder="All Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                {staffList.map((s) => (
                  <SelectItem key={s.id || s._id} value={s.id || s._id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-36 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment Records */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <CardTitle className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Wallet size={18} className="text-amber-500" />
            Payment Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingPayments ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <IndianRupee className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">No payment records found</p>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Click "Record Payment" to add one</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((payment) => {
                const staff = staffMap[payment.staffId];
                const MethodIcon = METHOD_LABELS[payment.paymentMethod]?.icon || Banknote;
                return (
                  <div key={payment.id || payment._id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    {/* Staff Avatar */}
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center font-playfair font-bold text-amber-700 dark:text-amber-400 shrink-0 text-sm">
                      {staff?.name?.charAt(0) || "?"}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-zinc-900 dark:text-white text-sm">{staff?.name || "Unknown Staff"}</span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 capitalize">{staff?.role?.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                        <span className="flex items-center gap-1"><MethodIcon size={12} />{METHOD_LABELS[payment.paymentMethod]?.label}</span>
                        <span>{new Date(payment.paymentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        {payment.notes && <span className="italic truncate max-w-[180px]">{payment.notes}</span>}
                      </div>
                    </div>

                    {/* Amount + Status */}
                    <div className="text-right shrink-0">
                      <p className="font-playfair font-bold text-zinc-900 dark:text-white text-lg">₹{Number(payment.amount).toLocaleString("en-IN")}</p>
                      <span className={cn("text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border", STATUS_STYLE[payment.status])}>
                        {payment.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-amber-600" onClick={() => openEdit(payment)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500" onClick={() => setDeleteTarget(payment.id || payment._id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="font-playfair text-xl text-zinc-900 dark:text-white">
              {editing ? "Edit Payment" : "Record Staff Payment"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Staff */}
            <div className="space-y-1.5">
              <Label className="text-zinc-700 dark:text-zinc-300">Staff Member *</Label>
              <Select value={form.staffId} onValueChange={(v) => setForm((f) => ({ ...f, staffId: v }))}>
                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((s) => (
                    <SelectItem key={s.id || s._id} value={s.id || s._id}>
                      {s.name} <span className="text-zinc-400 ml-1 capitalize">({s.role?.replace("_", " ")})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount + Date row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-zinc-700 dark:text-zinc-300">Amount (₹) *</Label>
                <Input
                  type="number" min="1" step="0.01"
                  placeholder="e.g. 1500"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-700 dark:text-zinc-300">Payment Date *</Label>
                <Input
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))}
                  className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                />
              </div>
            </div>

            {/* Method + Status row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-zinc-700 dark:text-zinc-300">Payment Method *</Label>
                <Select value={form.paymentMethod} onValueChange={(v) => setForm((f) => ({ ...f, paymentMethod: v }))}>
                  <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-700 dark:text-zinc-300">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Booking (optional) */}
            <div className="space-y-1.5">
              <Label className="text-zinc-700 dark:text-zinc-300">Linked Booking <span className="text-zinc-400">(optional)</span></Label>
              <Select value={form.bookingId || "none"} onValueChange={(v) => setForm((f) => ({ ...f, bookingId: v === "none" ? "" : v }))}>
                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                  <SelectValue placeholder="Select booking (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No booking</SelectItem>
                  {bookings.map((b) => (
                    <SelectItem key={b.id || b._id} value={b.id || b._id}>
                      {b.clientName} — {b.eventType} ({b.eventDate ? new Date(b.eventDate).toLocaleDateString("en-IN") : "N/A"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-zinc-700 dark:text-zinc-300">Notes <span className="text-zinc-400">(optional)</span></Label>
              <Input
                placeholder="e.g. Wage for wedding event"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeDialog} className="border-zinc-200 dark:border-zinc-700">Cancel</Button>
              <Button type="submit" disabled={isPending} className="bg-amber-500 hover:bg-amber-400 text-white font-semibold">
                {isPending ? "Saving..." : editing ? "Update Payment" : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Payment Record"
        description="This will permanently remove this payment record. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => deleteMutation.mutate(deleteTarget)}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
