import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Plus, Pencil, Trash2, CalendarDays, Printer, Search, Eye, RefreshCw, List } from "lucide-react";
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

export default function EventBookingsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedBookingForAssignment, setSelectedBookingForAssignment] = useState(null);
  const [assignedStaff, setAssignedStaff] = useState([]);
  const [viewType, setViewType] = useState("list");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const { data: bookings, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const { data: foodItems } = useQuery({
    queryKey: ["/api/food-items"],
  });

  const { data: staffList } = useQuery({
    queryKey: ["/api/staff"],
  });

  const filteredBookings = bookings?.filter((booking) => {
    const matchesSearch = booking.clientName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      booking.eventType.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      booking.contactEmail.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      booking.status.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    const matchesStatus = !statusFilter || booking.status === statusFilter;
    
    const bookingDate = new Date(booking.eventDate);
    const matchesDateFrom = !dateFrom || bookingDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || bookingDate <= new Date(dateTo);
    
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  }).sort((a, b) => {
    let compareValue = 0;
    
    if (sortBy === "date") {
      compareValue = new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
    } else if (sortBy === "status") {
      compareValue = a.status.localeCompare(b.status);
    } else if (sortBy === "amount") {
      compareValue = (a.totalAmount || 0) - (b.totalAmount || 0);
    } else if (sortBy === "client") {
      compareValue = a.clientName.localeCompare(b.clientName);
    }
    
    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  const getDomain = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'http://localhost:5000';
  };

  const fetchAssignedStaff = async () => {
    if (!selectedBookingForAssignment) return;
    try {
      const res = await fetch(`/api/bookings/${selectedBookingForAssignment.id}/assigned-staff`);
      const staff = await res.json();
      setAssignedStaff(staff);
    } catch (error) {
      console.error("Failed to fetch assigned staff:", error);
    }
  };

  useEffect(() => {
    if (assignmentModalOpen && selectedBookingForAssignment) {
      fetchAssignedStaff();
    }
  }, [assignmentModalOpen, selectedBookingForAssignment]);

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

  useEffect(() => {
    if (editingBooking) {
      fetch(`/api/bookings/${editingBooking.id}/items`)
        .then(res => res.json())
        .then((items) => {
          setSelectedItems(items.map(item => ({
            foodItemId: item.foodItemId,
            quantity: item.quantity
          })));
        });
    } else {
      setSelectedItems([]);
    }
  }, [editingBooking]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const priceInRupees = Math.round(data.pricePerPlate);
      const response = await apiRequest("POST", "/api/bookings", { ...data, pricePerPlate: priceInRupees });
      return await response.json();
    },
    onSuccess: async (booking) => {
      if (selectedItems.length > 0) {
        const items = selectedItems.map(item => ({
          bookingId: booking.id,
          foodItemId: item.foodItemId,
          quantity: item.quantity
        }));
        await apiRequest("POST", `/api/bookings/${booking.id}/items`, items);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ 
        title: "Booking Created", 
        description: `New booking for ${booking.clientName} has been created successfully`,
      });
      setIsDialogOpen(false);
      form.reset();
      setSelectedItems([]);
    },
    onError: (error) => {
      toast({ 
        title: "Creation Failed", 
        description: error?.message || "Unable to create booking. Please check all required fields.",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const updateData = { ...data };
      if (data.pricePerPlate !== undefined) {
        updateData.pricePerPlate = Math.round(data.pricePerPlate);
      }
      const response = await apiRequest("PATCH", `/api/bookings/${id}`, updateData);
      return await response.json();
    },
    onSuccess: async (_booking, variables) => {
      if (selectedItems.length > 0) {
        const items = selectedItems.map(item => ({
          bookingId: variables.id,
          foodItemId: item.foodItemId,
          quantity: item.quantity
        }));
        await apiRequest("POST", `/api/bookings/${variables.id}/items`, items);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ 
        title: "Updated", 
        description: "Booking details have been updated successfully" 
      });
      setIsDialogOpen(false);
      setEditingBooking(null);
      form.reset();
      setSelectedItems([]);
    },
    onError: (error) => {
      toast({ 
        title: "Update Failed", 
        description: error?.message || "Unable to update booking. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return apiRequest("DELETE", `/api/bookings/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ 
        title: "Deleted", 
        description: "Booking has been removed from the system",
      });
      setDeleteTargetId(null);
    },
    onError: (error) => {
      toast({ 
        title: "Delete Failed", 
        description: error?.message || "Unable to delete this booking. Please check if it's still in use.",
        variant: "destructive" 
      });
    },
  });

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    form.reset({
      clientName: booking.clientName,
      eventDate: booking.eventDate,
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

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
    }
  };

  const onSubmit = (data) => {
    const guestCount = data.guestCount ?? (editingBooking?.guestCount || 0);
    const pricePerPlate = data.pricePerPlate ?? (editingBooking?.pricePerPlate || 0);
    const totalAmount = guestCount * pricePerPlate;
    const advanceAmount = Math.round(totalAmount * 0.5);

    const submissionData = {
      ...data,
      totalAmount,
      advanceAmount
    };

    if (editingBooking) {
      updateMutation.mutate({ id: editingBooking.id, data: submissionData });
    } else {
      createMutation.mutate(submissionData);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingBooking(null);
    form.reset();
    setSelectedItems([]);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Event Bookings
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage upcoming and past event bookings
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            data-testid="button-refresh-bookings"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewType === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("list")}
              className="rounded-r-none"
              data-testid="button-view-list"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          {bookings && <ExportButton bookings={bookings} />}
          <Button
            variant="outline"
            onClick={() => setLocation('/admin/chef-printout')}
            data-testid="button-chef-printout"
          >
            <Printer className="w-4 h-4 mr-2" />
            Chef Printout
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) {
              handleDialogClose();
            } else {
              setIsDialogOpen(true);
            }
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-booking">
                <Plus className="w-4 h-4 mr-2" />
                Add Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">
                  {editingBooking ? "Edit Booking" : "Add New Booking"}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {editingBooking ? "Update booking details" : "Create a new event booking"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} data-testid="input-client-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="eventDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} data-testid="input-event-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="eventType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Wedding, Corporate, etc." {...field} data-testid="input-event-type" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guestCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guest Count</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-guest-count"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pricePerPlate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Plate (₹)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="1"
                              placeholder="500" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-price-per-plate"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="client@example.com" {...field} data-testid="input-contact-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+1 (555) 000-0000" {...field} data-testid="input-contact-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleDialogClose}
                      data-testid="button-cancel-booking"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-save-booking"
                    >
                      {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Booking"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-bookings"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : filteredBookings?.length === 0 ? (
            <div className="text-center py-12">No bookings found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings?.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.clientName}</TableCell>
                      <TableCell>{new Date(booking.eventDate).toLocaleDateString()}</TableCell>
                      <TableCell>{booking.eventType}</TableCell>
                      <TableCell>{booking.guestCount}</TableCell>
                      <TableCell>₹{booking.totalAmount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[booking.status]}>{booking.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(booking)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(booking.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete Booking"
        description="Are you sure you want to delete this booking? This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
