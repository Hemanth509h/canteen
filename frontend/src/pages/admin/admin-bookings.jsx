import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Plus, Pencil, Trash2, CalendarDays, Printer, Search, Eye, RefreshCw, List, DollarSign, Users, CreditCard } from "lucide-react";
import { insertEventBookingSchema, updateEventBookingSchema } from "@/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ExportButton } from "@/components/features/export-button";
import { TableSkeleton } from "@/components/features/loading-spinner";
import { ConfirmDialog } from "@/components/features/confirm-dialog";

const statusColors = {
  pending: "secondary",
  confirmed: "default",
  completed: "default",
  cancelled: "destructive",
};

export default function BookingsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const { data: bookings = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const filteredBookings = (bookings || []).filter((booking) => {
    const matchesSearch = (booking.clientName || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (booking.eventType || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (booking.status || "").toLowerCase().includes(debouncedSearch.toLowerCase());
    
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let compareValue = 0;
    if (sortBy === "date") {
      compareValue = new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
    } else if (sortBy === "status") {
      compareValue = (a.status || "").localeCompare(b.status || "");
    }
    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  const form = useForm({
    resolver: zodResolver(editingBooking ? updateEventBookingSchema : insertEventBookingSchema),
    defaultValues: {
      clientName: "",
      eventDate: "",
      eventType: "",
      guestCount: 0,
      pricePerPlate: 0,
      servingBoysNeeded: 2,
      contactEmail: "",
      contactPhone: "",
      specialRequests: "",
      status: "pending",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Booking Created", description: "New booking created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiRequest("PATCH", `/api/bookings/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Updated", description: "Booking updated successfully" });
      setIsDialogOpen(false);
      setEditingBooking(null);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return apiRequest("DELETE", `/api/bookings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Deleted", description: "Booking removed successfully" });
      setConfirmDeleteOpen(false);
    },
  });

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    form.reset({
      clientName: booking.clientName,
      eventDate: booking.eventDate ? new Date(booking.eventDate).toISOString().split('T')[0] : "",
      eventType: booking.eventType,
      guestCount: booking.guestCount,
      pricePerPlate: booking.pricePerPlate,
      contactEmail: booking.contactEmail,
      contactPhone: booking.contactPhone,
      specialRequests: booking.specialRequests || "",
      status: booking.status,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data) => {
    if (editingBooking) {
      updateMutation.mutate({ id: editingBooking.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-poppins">Event Bookings</h2>
          <p className="text-muted-foreground text-sm">Manage your catering events and payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) { setEditingBooking(null); form.reset(); }
          }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> New Booking</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBooking ? "Edit Booking" : "New Booking"}</DialogTitle>
                <DialogDescription>Enter the booking details below.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="clientName" render={({ field }) => (
                      <FormItem><FormLabel>Client Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="contactPhone" render={({ field }) => (
                      <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="contactEmail" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="eventDate" render={({ field }) => (
                      <FormItem><FormLabel>Event Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="eventType" render={({ field }) => (
                      <FormItem><FormLabel>Event Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="guestCount" render={({ field }) => (
                      <FormItem><FormLabel>Guest Count</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="pricePerPlate" render={({ field }) => (
                      <FormItem><FormLabel>Price Per Plate</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem><FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="specialRequests" render={({ field }) => (
                    <FormItem><FormLabel>Special Requests / Menu Items</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingBooking ? "Update Booking" : "Create Booking"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Event Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-bold">{booking.clientName}</div>
                    <div className="text-xs text-muted-foreground">{booking.contactPhone}</div>
                  </TableCell>
                  <TableCell>
                    <div>{booking.eventType}</div>
                    <div className="text-xs text-muted-foreground">
                      {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : "TBD"} • {booking.guestCount} Guests
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[booking.status] || "secondary"}>{booking.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setLocation(`/admin/payment/${booking.id}`)}>
                      <CreditCard className="h-4 w-4 mr-1" /> Payment
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(booking)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setDeleteTargetId(booking.id); setConfirmDeleteOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={() => deleteMutation.mutate(deleteTargetId)}
        title="Delete Booking"
        description="Are you sure? This action cannot be undone."
      />
    </div>
  );
}
