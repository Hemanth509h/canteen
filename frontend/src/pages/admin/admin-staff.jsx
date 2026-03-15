import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStaffSchema, updateStaffSchema } from "@/schema";
import {
  UserPlus, Search, MoreVertical, Pencil, Trash2, Phone, RefreshCw, User,
  IndianRupee, Plus, Wallet, Banknote, Smartphone, CreditCard, Users, TrendingUp, Clock
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/features/confirm-dialog";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

// ==================== SHARED CONSTANTS ====================

const roleMap = {
  chef: "Chef",
  worker: "Worker",
  serving_boy: "Serving Boy",
  manager: "Manager",
  server: "Server",
  cleaner: "Cleaner",
};

const roleColors = {
  chef: "default",
  worker: "secondary",
  serving_boy: "secondary",
  manager: "outline",
  server: "secondary",
  cleaner: "outline",
};

const METHOD_LABELS = {
  cash: { label: "Cash", icon: Banknote },
  upi: { label: "UPI", icon: Smartphone },
  bank_transfer: { label: "Bank Transfer", icon: CreditCard },
};

const STATUS_STYLE = {
  paid: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
};

const EMPTY_PAYMENT_FORM = {
  staffId: "",
  bookingId: "",
  amount: "",
  paymentDate: new Date().toISOString().split("T")[0],
  paymentMethod: "cash",
  notes: "",
  status: "paid",
};

// ==================== STAFF MEMBERS TAB ====================

function StaffMembersTab({ staffList, isLoading, isFetching, refetch }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [roleFilter, setRoleFilter] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(editingStaff ? updateStaffSchema : insertStaffSchema),
    defaultValues: { name: "", role: "chef", phone: "" },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/staff", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({ title: "Staff Added", description: `${data.name} has been added to your team` });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Failed to Add Staff", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("PATCH", `/api/staff/${editingStaff.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({ title: "Updated", description: "Staff member details have been updated successfully" });
      setIsDialogOpen(false);
      setEditingStaff(null);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => apiRequest("DELETE", `/api/staff/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
      toast({ title: "Removed", description: "Staff member has been removed from the team" });
      setDeleteConfirmOpen(false);
      setStaffToDelete(null);
    },
    onError: (error) => {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    form.reset({ name: staff.name, role: staff.role, phone: staff.phone });
    setIsDialogOpen(true);
  };

  const handleDelete = (staff) => {
    setStaffToDelete(staff);
    setDeleteConfirmOpen(true);
  };

  const filteredStaffList = staffList
    ?.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (roleMap[staff.role] || staff.role).toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (staff.phone && staff.phone.includes(debouncedSearch));
      const matchesRole = !roleFilter || staff.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      let compareValue = 0;
      if (sortBy === "name") compareValue = a.name.localeCompare(b.name);
      else if (sortBy === "role") compareValue = (roleMap[a.role] || a.role).localeCompare(roleMap[b.role] || b.role);
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

  const onSubmit = (data) => {
    if (editingStaff) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isFetching}
          data-testid="button-refresh-staff"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
        <Button
          onClick={() => {
            setEditingStaff(null);
            form.reset({ name: "", role: "chef", phone: "" });
            setIsDialogOpen(true);
          }}
          data-testid="button-add-staff"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="pb-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-staff"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                data-testid="button-toggle-sort"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
              <Select value={roleFilter || "all"} onValueChange={(v) => setRoleFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="chef">Chef</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="server">Server</SelectItem>
                  <SelectItem value="cleaner">Cleaner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[250px] font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Phone Number</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredStaffList?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      No staff members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaffList?.map((staff) => (
                    <TableRow key={staff.id} className="group hover:bg-muted/40 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          {staff.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleColors[staff.role] || "secondary"} className="capitalize">
                          {roleMap[staff.role] || staff.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {staff.phone}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(staff)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(staff)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStaff ? "Edit Staff" : "Add Staff"}</DialogTitle>
            <DialogDescription>
              {editingStaff ? "Update staff member details." : "Add a new member to your catering team."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem><FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {Object.entries(roleMap).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingStaff ? "Update Staff" : "Add Staff"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={() => staffToDelete && deleteMutation.mutate(staffToDelete.id)}
        title="Remove Staff"
        description={`Are you sure you want to remove ${staffToDelete?.name} from the team?`}
      />
    </div>
  );
}

// ==================== STAFF PAYMENTS TAB ====================

function StaffPaymentsTab({ staffList }) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PAYMENT_FORM);
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

  const totalPaid = useMemo(() => filtered.filter((p) => p.status === "paid").reduce((s, p) => s + (p.amount || 0), 0), [filtered]);
  const totalPending = useMemo(() => filtered.filter((p) => p.status === "pending").reduce((s, p) => s + (p.amount || 0), 0), [filtered]);

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
    setForm(EMPTY_PAYMENT_FORM);
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
    setForm(EMPTY_PAYMENT_FORM);
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

    if (editing) updateMutation.mutate({ id: editing.id || editing._id, data });
    else createMutation.mutate(data);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="bg-amber-500 hover:bg-amber-400 text-white font-semibold shrink-0">
          <Plus size={16} className="mr-2" /> Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Paid</p>
              <p className="text-2xl font-bold">₹{totalPaid.toLocaleString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Pending</p>
              <p className="text-2xl font-bold">₹{totalPending.toLocaleString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Records</p>
              <p className="text-2xl font-bold">{filtered.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by staff name or notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStaff} onValueChange={setFilterStaff}>
              <SelectTrigger className="w-full sm:w-48">
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
              <SelectTrigger className="w-full sm:w-36">
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

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
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
              <IndianRupee className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No payment records found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Click "Record Payment" to add one</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((payment) => {
                const staff = staffMap[payment.staffId];
                const MethodIcon = METHOD_LABELS[payment.paymentMethod]?.icon || Banknote;
                return (
                  <div key={payment.id || payment._id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center font-bold text-amber-700 dark:text-amber-400 shrink-0 text-sm">
                      {staff?.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{staff?.name || "Unknown Staff"}</span>
                        <span className="text-xs text-muted-foreground capitalize">{staff?.role?.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><MethodIcon size={12} />{METHOD_LABELS[payment.paymentMethod]?.label}</span>
                        <span>{new Date(payment.paymentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        {payment.notes && <span className="italic truncate max-w-[180px]">{payment.notes}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-lg">₹{Number(payment.amount).toLocaleString("en-IN")}</p>
                      <span className={cn("text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border", STATUS_STYLE[payment.status])}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-amber-600" onClick={() => openEdit(payment)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(payment.id || payment._id)}>
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

      <Dialog open={dialogOpen} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Payment" : "Record Staff Payment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Staff Member *</Label>
              <Select value={form.staffId} onValueChange={(v) => setForm((f) => ({ ...f, staffId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                <SelectContent>
                  {staffList.map((s) => (
                    <SelectItem key={s.id || s._id} value={s.id || s._id}>
                      {s.name} <span className="text-muted-foreground ml-1 capitalize">({s.role?.replace("_", " ")})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Amount (₹) *</Label>
                <Input
                  type="number" min="1" step="0.01"
                  placeholder="e.g. 1500"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Payment Date *</Label>
                <Input
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) => setForm((f) => ({ ...f, paymentDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Payment Method *</Label>
                <Select value={form.paymentMethod} onValueChange={(v) => setForm((f) => ({ ...f, paymentMethod: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Linked Booking <span className="text-muted-foreground">(optional)</span></Label>
              <Select value={form.bookingId || "none"} onValueChange={(v) => setForm((f) => ({ ...f, bookingId: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select booking (optional)" /></SelectTrigger>
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

            <div className="space-y-1.5">
              <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                placeholder="e.g. Wage for wedding event"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={isPending} className="bg-amber-500 hover:bg-amber-400 text-white font-semibold">
                {isPending ? "Saving..." : editing ? "Update Payment" : "Record Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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

// ==================== COMBINED PAGE ====================

export default function StaffManager() {
  const { data: staffList = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["/api/staff"],
    queryFn: async () => {
      const res = await fetch("/api/staff");
      const json = await res.json();
      return json.data || json || [];
    },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
          Staff
        </h2>
        <p className="text-muted-foreground">Manage your team and their payments</p>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members" className="gap-2">
            <Users className="w-4 h-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <Wallet className="w-4 h-4" />
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <StaffMembersTab
            staffList={staffList}
            isLoading={isLoading}
            isFetching={isFetching}
            refetch={refetch}
          />
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <StaffPaymentsTab staffList={staffList} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
