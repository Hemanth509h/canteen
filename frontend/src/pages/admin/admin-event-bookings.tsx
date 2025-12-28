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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Plus, Pencil, Trash2, CalendarDays, Printer, Search, Eye, MessageCircle, Users, RefreshCw, List } from "lucide-react";
import { insertEventBookingSchema, updateEventBookingSchema, type EventBooking, type InsertEventBooking, type UpdateEventBooking, type FoodItem, type BookingItem, type CompanyInfo, type Staff } from "@/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { UPIPayment } from "@/components/features/upi-payment";
import { ExportButton } from "@/components/features/export-button";
import { BookingCalendar } from "@/components/features/booking-calendar";
import { TableSkeleton } from "@/components/features/loading-spinner";
import { ConfirmDialog } from "@/components/features/confirm-dialog";
import { EmptyState } from "@/components/features/empty-state";

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  confirmed: "default",
  completed: "default",
  cancelled: "destructive",
};

interface SelectedItem {
  foodItemId: string;
  quantity: number;
}

export default function EventBookingsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<EventBooking | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedBookingForAssignment, setSelectedBookingForAssignment] = useState<EventBooking | null>(null);
  const [assignedStaff, setAssignedStaff] = useState<Staff[]>([]);
  const [viewType, setViewType] = useState<"list" | "calendar">("list");
  const [sortBy, setSortBy] = useState<"date" | "status" | "amount" | "client">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const { data: bookings, isLoading, isFetching, refetch } = useQuery<EventBooking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: foodItems } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const { data: companyInfo } = useQuery<CompanyInfo>({
    queryKey: ["/api/company-info"],
  });

  const { data: staffList } = useQuery<Staff[]>({
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

  const sendStaffAssignment = useMutation({
    mutationFn: async (staffId: string) => {
      if (!selectedBookingForAssignment) throw new Error("No booking selected");
      const response = await apiRequest("POST", `/api/bookings/${selectedBookingForAssignment.id}/staff-requests`, { staffId });
      return response.json();
    },
    onSuccess: async (request, staffId) => {
      const staff = staffList?.find(s => s.id === staffId);
      if (staff && selectedBookingForAssignment) {
        const assignmentLink = `${getDomain()}/staff-assignment/${request.token}`;
        const message = `Hi ${staff.name}, you've been assigned to a catering event:\n\nEvent: ${selectedBookingForAssignment.eventType}\nDate: ${new Date(selectedBookingForAssignment.eventDate).toLocaleDateString()}\nGuests: ${selectedBookingForAssignment.guestCount}\nClient: ${selectedBookingForAssignment.clientName}\n\nPlease confirm your availability:\n${assignmentLink}`;
        const cleanPhone = staff.phone.replace(/\D/g, '');
        window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
        toast({ title: "Assignment sent!", description: `Staff link sent via WhatsApp` });
        queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
        fetchAssignedStaff();
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send assignment", variant: "destructive" });
    },
  });

  const removeStaffAssignment = useMutation({
    mutationFn: async (staffId: string) => {
      if (!selectedBookingForAssignment) throw new Error("No booking selected");
      await apiRequest("DELETE", `/api/bookings/${selectedBookingForAssignment.id}/staff-requests/${staffId}`, undefined);
    },
    onSuccess: () => {
      toast({ title: "Staff removed", description: "Staff member has been removed from this booking" });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      fetchAssignedStaff();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to remove staff assignment", variant: "destructive" });
    },
  });

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

  const form = useForm<UpdateEventBooking>({
    resolver: zodResolver(editingBooking ? updateEventBookingSchema : insertEventBookingSchema.extend({
      guestCount: insertEventBookingSchema.shape.guestCount.refine((val) => val > 0, {
        message: "Guest count must be greater than 0",
      }),
      pricePerPlate: insertEventBookingSchema.shape.pricePerPlate.refine((val) => val > 0, {
        message: "Price per plate must be greater than 0",
      }),
    })),
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
        .then((items: (BookingItem & { foodItem: FoodItem })[]) => {
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
    mutationFn: async (data: InsertEventBooking) => {
      const priceInRupees = Math.round(data.pricePerPlate);
      const response = await apiRequest("POST", "/api/bookings", { ...data, pricePerPlate: priceInRupees });
      return await response.json() as EventBooking;
    },
    onSuccess: async (booking: EventBooking) => {
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
        variant: "default"
      });
      setIsDialogOpen(false);
      form.reset();
      setSelectedItems([]);
    },
    onError: (error: any) => {
      toast({ 
        title: "Creation Failed", 
        description: error?.message || "Unable to create booking. Please check all required fields.",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEventBooking }) => {
      const updateData = { ...data };
      if (data.pricePerPlate !== undefined) {
        updateData.pricePerPlate = Math.round(data.pricePerPlate);
      }
      const response = await apiRequest("PATCH", `/api/bookings/${id}`, updateData);
      return await response.json() as EventBooking;
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
    onError: (error: any) => {
      toast({ 
        title: "Update Failed", 
        description: error?.message || "Unable to update booking. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/bookings/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ 
        title: "Deleted", 
        description: "Booking has been removed from the system",
        variant: "default"
      });
      setDeleteTargetId(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Delete Failed", 
        description: error?.message || "Unable to delete this booking. Please check if it's still in use.",
        variant: "destructive" 
      });
    },
  });

  const handleEdit = (booking: EventBooking) => {
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
      status: booking.status as "pending" | "confirmed" | "completed" | "cancelled",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteMutation.mutate(deleteTargetId);
    }
  };

  const onSubmit = (data: UpdateEventBooking) => {
    // Calculate totalAmount and advanceAmount before submitting
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
      const { status, ...insertData } = submissionData as InsertEventBooking & { status?: string };
      createMutation.mutate(insertData as InsertEventBooking);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingBooking(null);
    form.reset();
    setSelectedItems([]);
  };

  const addItem = (foodItemId: string) => {
    if (selectedItems.find(item => item.foodItemId === foodItemId)) {
      toast({ title: "Already added", description: "This item is already in the list", variant: "destructive" });
      return;
    }
    const guestCount = form.getValues("guestCount") || 1;
    setSelectedItems([...selectedItems, { foodItemId, quantity: guestCount }]);
  };

  const updateItemQuantity = (foodItemId: string, quantity: number) => {
    setSelectedItems(selectedItems.map(item =>
      item.foodItemId === foodItemId ? { ...item, quantity } : item
    ));
  };

  const removeItem = (foodItemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.foodItemId !== foodItemId));
  };

  const selectedFoodItems = selectedItems
    .map(item => {
      const foodItem = foodItems?.find(f => f.id === item.foodItemId);
      return foodItem ? { ...item, foodItem } : null;
    })
    .filter(Boolean) as (SelectedItem & { foodItem: FoodItem })[];

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
              variant={viewType === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewType("list")}
              className="rounded-r-none"
              data-testid="button-view-list"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewType === "calendar" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewType("calendar")}
              className="rounded-l-none"
              data-testid="button-view-calendar"
            >
              <CalendarDays className="w-4 h-4" />
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
                    <FormField
                      control={form.control}
                      name="servingBoysNeeded"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serving Boys Needed</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              placeholder="2" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 2)}
                              data-testid="input-serving-boys"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                  {editingBooking && (
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-booking-status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests (optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special dietary requirements or requests..." 
                            {...field}
                            value={field.value || ""}
                            data-testid="input-special-requests"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {editingBooking && companyInfo?.upiId && (
                    <div className="border-t pt-6 mt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="advancePaymentStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Advance Payment</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || "pending"}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-advance-payment">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="finalPaymentStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Final Payment</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || "pending"}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-final-payment">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                      <UPIPayment 
                        upiId={companyInfo.upiId}
                        totalAmount={Math.round((form.getValues("pricePerPlate") || 0) * (form.getValues("guestCount") || 1))}
                        bookingId={editingBooking.id}
                        clientName={form.getValues("clientName") || "Client"}
                      />
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Menu Items to Prepare</h3>
                    <div className="mb-3">
                      <label className="text-sm font-medium mb-2 block">Add Items:</label>
                      <Select onValueChange={addItem}>
                        <SelectTrigger data-testid="select-add-item">
                          <SelectValue placeholder="Select a food item to add" />
                        </SelectTrigger>
                        <SelectContent>
                          {(() => {
                            const groupedByCategory = foodItems
                              ?.filter(item => item.id && item.id.trim() !== '')
                              .reduce((acc, item) => {
                                const category = item.category || 'Other';
                                if (!acc[category]) acc[category] = [];
                                acc[category].push(item);
                                return acc;
                              }, {} as Record<string, FoodItem[]>) || {};
                            
                            return Object.entries(groupedByCategory).map(([category, items]) => (
                              <div key={category}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  {category}
                                </div>
                                {items.map((item) => (
                                  <SelectItem key={item.id} value={item.id} className="pl-8">
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </div>
                            ));
                          })()}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedFoodItems.length > 0 ? (
                      <div style={{ 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '6px', 
                        overflow: 'hidden' 
                      }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f8fafc' }}>
                              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Item</th>
                              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Category</th>
                              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Quantity</th>
                              <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedFoodItems.map((item) => (
                              <tr key={item.foodItemId} style={{ borderTop: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '12px' }}>{item.foodItem.name}</td>
                                <td style={{ padding: '12px' }}>{item.foodItem.category}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <button
                                      type="button"
                                      onClick={() => updateItemQuantity(item.foodItemId, Math.max(1, item.quantity - 1))}
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        padding: '0',
                                        backgroundColor: '#f1f5f9',
                                        color: '#475569',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      data-testid={`button-decrease-${item.foodItemId}`}
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => updateItemQuantity(item.foodItemId, parseInt(e.target.value) || 1)}
                                      style={{
                                        width: '60px',
                                        padding: '6px 8px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '4px',
                                        textAlign: 'center',
                                        fontSize: '14px'
                                      }}
                                      data-testid={`input-quantity-${item.foodItemId}`}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => updateItemQuantity(item.foodItemId, item.quantity + 1)}
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        padding: '0',
                                        backgroundColor: '#f1f5f9',
                                        color: '#475569',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      data-testid={`button-increase-${item.foodItemId}`}
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>
                                  <button
                                    type="button"
                                    onClick={() => removeItem(item.foodItemId)}
                                    style={{
                                      padding: '6px 12px',
                                      backgroundColor: '#fee2e2',
                                      color: '#dc2626',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      fontSize: '14px'
                                    }}
                                    data-testid={`button-remove-item-${item.foodItemId}`}
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p style={{ 
                        color: '#64748b', 
                        fontSize: '14px', 
                        fontStyle: 'italic',
                        textAlign: 'center',
                        padding: '20px'
                      }}>
                        No items selected. Add items from the dropdown above.
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleDialogClose}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-submit-booking"
                    >
                      {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <>
        {viewType === "calendar" ? (
          <div
            key="calendar"
          >
            {isLoading ? (
              <Card>
                <CardContent className="py-12">
                  <TableSkeleton rows={5} />
                </CardContent>
              </Card>
            ) : bookings && bookings.length > 0 ? (
              <BookingCalendar 
                bookings={bookings} 
                onSelectBooking={(booking) => handleEdit(booking)} 
              />
            ) : (
              <Card>
                <CardContent className="py-12">
                  <EmptyState
                    icon={<CalendarDays className="w-12 h-12 mx-auto text-muted-foreground" />}
                    title="No bookings yet"
                    description="Create your first booking to see it here."
                    actionLabel="Add Booking"
                    onAction={() => setIsDialogOpen(true)}
                    data_testid="empty-state-bookings"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div
            key="list"
          >
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>
                  {filteredBookings?.length || 0} of {bookings?.length || 0} bookings
                </CardDescription>
                <div className="mt-4 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search bookings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-bookings"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)} data-testid="select-sort-bookings">
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Event Date</SelectItem>
                        <SelectItem value="client">Client Name</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="amount">Total Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      data-testid="button-toggle-sort-order"
                      className="w-full sm:w-auto"
                    >
                      {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
                    </Button>
                    <Select value={statusFilter || "none"} onValueChange={(value) => setStatusFilter(value === "none" ? "" : value)} data-testid="select-status-filter">
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground">From Date</label>
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        data-testid="input-date-from"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-muted-foreground">To Date</label>
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        data-testid="input-date-to"
                      />
                    </div>
                    {(statusFilter || dateFrom || dateTo) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setStatusFilter("");
                          setDateFrom("");
                          setDateTo("");
                        }}
                        data-testid="button-clear-filters"
                        className="sm:mt-auto"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <TableSkeleton rows={5} />
                ) : filteredBookings && filteredBookings.length > 0 ? (
                  <>
                    {/* Mobile Card View */}
                    <div className="block md:hidden space-y-3 max-h-[600px] overflow-y-auto">
                      {filteredBookings.map((booking) => (
                        <div key={booking.id} className="p-3 border border-border rounded-lg space-y-2" data-testid={`card-booking-mobile-${booking.id}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-sm">{booking.clientName}</p>
                              <p className="text-xs text-muted-foreground">{booking.contactEmail}</p>
                            </div>
                            <Badge variant={statusColors[booking.status]} className="text-xs">
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="text-xs space-y-1">
                            <p><span className="text-muted-foreground">Event:</span> {booking.eventType} • {booking.eventDate}</p>
                            <p><span className="text-muted-foreground">Guests:</span> {booking.guestCount} • <span className="font-semibold">₹{(booking.pricePerPlate * booking.guestCount).toLocaleString('en-IN')}</span></p>
                            <div className="flex justify-between items-center px-4 py-2 bg-muted/30 rounded-md mb-2">
                            <span className="text-sm font-medium">Payment Status:</span>
                            <Badge variant={(booking.totalAmount || 0) <= ((booking.advancePaymentApprovalStatus === 'approved' ? (booking.advanceAmount || 0) : 0) + (booking.finalPaymentApprovalStatus === 'approved' ? ((booking.totalAmount || 0) - (booking.advanceAmount || 0)) : 0)) ? "default" : "secondary"}>
                              {(booking.totalAmount || 0) <= ((booking.advancePaymentApprovalStatus === 'approved' ? (booking.advanceAmount || 0) : 0) + (booking.finalPaymentApprovalStatus === 'approved' ? ((booking.totalAmount || 0) - (booking.advanceAmount || 0)) : 0)) ? "Paid" : "Unpaid"}
                            </Badge>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                              <Badge variant={booking.advancePaymentStatus === "paid" ? "default" : "secondary"} className="text-xs">
                                Adv: {booking.advancePaymentStatus}
                              </Badge>
                              <Badge variant={booking.finalPaymentStatus === "paid" ? "default" : "secondary"} className="text-xs">
                                Final: {booking.finalPaymentStatus}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex justify-between items-center px-4 py-2 bg-muted/30 rounded-md mb-2">
                            <span className="text-sm font-medium">Payment Status:</span>
                            <Badge variant={(booking.totalAmount || 0) <= ((booking.advancePaymentApprovalStatus === 'approved' ? (booking.advanceAmount || 0) : 0) + (booking.finalPaymentApprovalStatus === 'approved' ? ((booking.totalAmount || 0) - (booking.advanceAmount || 0)) : 0)) ? "default" : "secondary"}>
                              {(booking.totalAmount || 0) <= ((booking.advancePaymentApprovalStatus === 'approved' ? (booking.advanceAmount || 0) : 0) + (booking.finalPaymentApprovalStatus === 'approved' ? ((booking.totalAmount || 0) - (booking.advanceAmount || 0)) : 0)) ? "Paid" : "Unpaid"}
                            </Badge>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => { setSelectedBookingForAssignment(booking); setAssignmentModalOpen(true); }} data-testid={`button-assign-staff-mobile-${booking.id}`} title="Assign serving boys">
                              <Users className="w-3 h-3" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setLocation(`/admin/payment/${booking.id}`)} data-testid={`button-view-payment-mobile-${booking.id}`} title="View payment">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleEdit(booking)} data-testid={`button-edit-mobile-${booking.id}`} title="Edit">
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleDelete(booking.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-mobile-${booking.id}`} title="Delete">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto max-h-[600px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Event Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Guests</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Event Status</TableHead>
                            <TableHead>Payments</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredBookings.map((booking) => (
                            <TableRow key={booking.id} data-testid={`row-booking-${booking.id}`}>
                              <TableCell>
                                <div>
                                  <p className="font-semibold">{booking.clientName}</p>
                                  <p className="text-sm text-muted-foreground">{booking.contactEmail}</p>
                                </div>
                              </TableCell>
                              <TableCell>{booking.eventType}</TableCell>
                              <TableCell>{booking.eventDate}</TableCell>
                              <TableCell>{booking.guestCount}</TableCell>
                              <TableCell className="font-semibold">
                                ₹{(booking.pricePerPlate * booking.guestCount).toLocaleString('en-IN')}
                              </TableCell>
                              <TableCell>
                                <Badge variant={statusColors[booking.status]}>
                                  {booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs">
                                <div className="flex gap-1 flex-col">
                                  <Badge variant={booking.advancePaymentStatus === "paid" ? "default" : "secondary"}>
                                    Adv: {booking.advancePaymentStatus}
                                  </Badge>
                                  <Badge variant={booking.finalPaymentStatus === "paid" ? "default" : "secondary"}>
                                    Final: {booking.finalPaymentStatus}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedBookingForAssignment(booking);
                                      setAssignmentModalOpen(true);
                                    }}
                                    data-testid={`button-assign-staff-${booking.id}`}
                                    title="Assign serving boys to this event"
                                  >
                                    <Users className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setLocation(`/admin/payment/${booking.id}`)}
                                    data-testid={`button-view-payment-${booking.id}`}
                                    title="View payment page"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(booking)}
                                    data-testid={`button-edit-${booking.id}`}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(booking.id)}
                                    disabled={deleteMutation.isPending}
                                    data-testid={`button-delete-${booking.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                
                ) : bookings && bookings.length > 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No bookings match your search</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No bookings yet</p>
                    <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-first-booking">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Booking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </>

      <Dialog open={assignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
          <DialogContent data-testid="dialog-assign-staff">
            <DialogHeader>
              <DialogTitle>Assign Serving Boys</DialogTitle>
              <DialogDescription>
                {selectedBookingForAssignment && `Event: ${selectedBookingForAssignment.clientName} - ${selectedBookingForAssignment.eventType}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {assignedStaff.length > 0 && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">Already Assigned:</p>
                  <div className="space-y-2">
                    {assignedStaff.map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between gap-2 text-sm text-green-800 dark:text-green-200">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-600"></span>
                          {staff.name} - {staff.role}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Remove ${staff.name} from this booking?`)) {
                              removeStaffAssignment.mutate(staff.id);
                            }
                          }}
                          disabled={removeStaffAssignment.isPending}
                          data-testid={`button-remove-staff-${staff.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                <p className="text-sm font-semibold">Available Staff:</p>
                {staffList && staffList.length > 0 ? (
                  staffList
                    .filter(staff => staff.role === 'serving_boy')
                    .map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">{staff.name}</p>
                          <p className="text-sm text-muted-foreground">{staff.phone}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => sendStaffAssignment.mutate(staff.id)}
                          disabled={sendStaffAssignment.isPending || assignedStaff.some(s => s.id === staff.id)}
                          data-testid={`button-assign-${staff.id}`}
                        >
                          {assignedStaff.some(s => s.id === staff.id) ? "Assigned" : "Assign"}
                        </Button>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No serving boys found. Add staff first.</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete Booking"
        description="Are you sure you want to delete this booking? This action cannot be undone and will remove all associated booking data."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
