import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Banknote, IndianRupee, Plus, ReceiptText, Trash2, TrendingDown } from "lucide-react";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const CATEGORY_LABELS = {
  raw_materials: "Raw Materials",
  transport: "Transport",
  utilities: "Utilities",
  staff: "Staff",
  rent: "Rent",
  maintenance: "Maintenance",
  other: "Other",
};

const EMPTY_FORM = {
  title: "",
  category: "raw_materials",
  amount: "",
  expenseDate: new Date().toISOString().split("T")[0],
  vendor: "",
  paymentMethod: "cash",
  notes: "",
};

const getBookingTotal = (booking) =>
  Number(booking.totalAmount) || (Number(booking.guestCount) || 0) * (Number(booking.pricePerPlate) || 0);

const getCollected = (booking) => {
  const total = getBookingTotal(booking);
  const advance = Number(booking.advanceAmount) || Math.ceil(total * 0.5);
  const final = total - advance;
  
  const advanceApproved = booking.advancePaymentStatus === "paid" && 
    (!booking.advancePaymentApprovalStatus || booking.advancePaymentApprovalStatus === "approved");
  const finalApproved = booking.finalPaymentStatus === "paid" && 
    (!booking.finalPaymentApprovalStatus || booking.finalPaymentApprovalStatus === "approved");
    
  return (advanceApproved ? advance : 0) + (finalApproved ? final : 0);
};

export default function AdminExpenses() {
  const { toast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: expenses = [], isLoading: loadingExpenses } = useQuery({ queryKey: ["/api/expenses"] });
  const { data: bookings = [], isLoading: loadingBookings } = useQuery({ queryKey: ["/api/bookings"] });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await apiRequest("POST", "/api/expenses", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      setForm(EMPTY_FORM);
      toast({ title: "Expense recorded", description: "The cost entry is now included in profit reports." });
    },
    onError: (error) => {
      toast({ title: "Failed to record expense", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest("DELETE", `/api/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Expense deleted" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete expense", description: error.message, variant: "destructive" });
    },
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => categoryFilter === "all" || expense.category === categoryFilter);
  }, [categoryFilter, expenses]);

  const totals = useMemo(() => {
    const revenue = bookings
      .filter((booking) => ["confirmed", "completed"].includes(booking.status))
      .reduce((sum, booking) => sum + getCollected(booking), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount || 0);
      return acc;
    }, {});
    return { revenue, totalExpenses, netProfit: revenue - totalExpenses, categoryTotals };
  }, [bookings, expenses]);

  const onSubmit = (event) => {
    event.preventDefault();
    createMutation.mutate({
      ...form,
      amount: Number(form.amount),
    });
  };

  const isLoading = loadingExpenses || loadingBookings;

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-28 rounded-xl" />)}</div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ReceiptText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Expenses</h1>
          <p className="text-muted-foreground">Track raw materials, transport, utilities, and profit after costs.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Revenue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{money(totals.revenue)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Expenses</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{money(totals.totalExpenses)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Net Profit</CardTitle></CardHeader>
          <CardContent><div className={totals.netProfit >= 0 ? "text-2xl font-bold text-emerald-600" : "text-2xl font-bold text-rose-600"}>{money(totals.netProfit)}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> Add Expense</CardTitle>
            <CardDescription>Costs entered here are deducted from analytics revenue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="expense-title">Title</Label>
                <Input id="expense-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-amount">Amount</Label>
                  <Input id="expense-amount" type="number" min="1" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expense-date">Date</Label>
                  <Input id="expense-date" type="date" value={form.expenseDate} onChange={(event) => setForm({ ...form, expenseDate: event.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={form.paymentMethod} onValueChange={(value) => setForm({ ...form, paymentMethod: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-vendor">Vendor</Label>
                <Input id="expense-vendor" value={form.vendor} onChange={(event) => setForm({ ...form, vendor: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-notes">Notes</Label>
                <Textarea id="expense-notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={3} />
              </div>
              <Button className="w-full" disabled={createMutation.isPending}>
                <Banknote className="mr-2 h-4 w-4" />
                {createMutation.isPending ? "Saving..." : "Record Expense"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><TrendingDown className="h-5 w-5 text-primary" /> Expense Ledger</CardTitle>
                <CardDescription>{filteredExpenses.length} visible entries.</CardDescription>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString("en-IN") : "-"}</TableCell>
                    <TableCell>
                      <div className="font-medium">{expense.title}</div>
                      <div className="text-xs text-muted-foreground">{expense.vendor || expense.paymentMethod}</div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{CATEGORY_LABELS[expense.category] || "Other"}</Badge></TableCell>
                    <TableCell className="font-semibold">{money(expense.amount)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(expense.id)} aria-label="Delete expense">
                        <Trash2 className="h-4 w-4 text-rose-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredExpenses.length && (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No expenses recorded.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
