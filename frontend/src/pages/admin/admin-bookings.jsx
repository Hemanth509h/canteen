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
import { Plus, Pencil, Trash2, CalendarDays, Printer, Search, Eye, RefreshCw, List, DollarSign, Users, CreditCard, X } from "lucide-react";
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
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isMenuEditDialogOpen, setIsMenuEditDialogOpen] = useState(false);
  const [isMenuViewDialogOpen, setIsMenuViewDialogOpen] = useState(false);
  const [menuEditingBooking, setMenuEditingBooking] = useState(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const { data: bookings = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const { data: foodItems = [] } = useQuery({
    queryKey: ["/api/food-items"],
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ["/api/staff"],
  });

  const filteredBookings = (bookings || []).filter((booking) => {
    const matchesSearch = (booking.clientName || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (booking.eventType || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (booking.contactEmail || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (booking.status || "").toLowerCase().includes(debouncedSearch.toLowerCase());
    
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
      compareValue = (a.status || "").localeCompare(b.status || "");
    } else if (sortBy === "amount") {
      compareValue = (a.totalAmount || 0) - (b.totalAmount || 0);
    } else if (sortBy === "client") {
      compareValue = (a.clientName || "").localeCompare(b.clientName || "");
    }
    
    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  const debouncedFoodSearch = useDebouncedValue(foodSearchQuery, 300);

  const getCategories = () => {
    const categories = new Set((foodItems || []).map(item => item.category).filter(Boolean));
    return Array.from(categories).sort();
  };

  const filteredFoodItems = (foodItems || []).filter((item) => {
    const matchesSearch = (item.name || "").toLowerCase().includes(debouncedFoodSearch.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
      apiRequest("GET", `/api/bookings/${editingBooking.id}/items`)
        .then(res => res.json())
        .then((response) => {
          const items = response.data || response;
          if (Array.isArray(items)) {
            setSelectedItems(items.map(item => ({
              foodItemId: item.foodItemId,
              quantity: item.quantity
            })));
          }
        })
        .catch(err => console.error("Failed to fetch booking items:", err));
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
    onSuccess: async (response) => {
      const booking = response.data;
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
      return apiRequest("PATCH", `/api/bookings/${id}`, updateData);
    },
    onSuccess: async (_booking, variables) => {
      // Refresh after update
      await queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      
      if (selectedItems.length > 0) {
        const items = selectedItems.map(item => ({
          bookingId: variables.id,
          foodItemId: item.foodItemId,
          quantity: item.quantity
        }));
        // Use a standard fetch or apiRequest that handle the JSON properly
        await apiRequest("POST", `/api/bookings/${variables.id}/items`, items);
        await queryClient.invalidateQueries({ queryKey: ["/api/bookings", variables.id, "items"] });
      }
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
    // Clean up special requests if they contain the "Selected Menu:" string
    let cleanedSpecialRequests = booking.specialRequests || "";
    if (cleanedSpecialRequests.includes("Selected Menu:")) {
      cleanedSpecialRequests = cleanedSpecialRequests.split("Selected Menu:")[0].trim();
    }
    
    form.reset({
      clientName: booking.clientName || "",
      eventDate: booking.eventDate ? new Date(booking.eventDate).toISOString().split('T')[0] : "",
      eventType: booking.eventType || "",
      guestCount: booking.guestCount || 0,
      pricePerPlate: booking.pricePerPlate || 0,
      contactEmail: booking.contactEmail || "",
      contactPhone: booking.contactPhone || "",
      specialRequests: cleanedSpecialRequests,
      status: booking.status || "pending",
    });
    setIsDialogOpen(true);
  };

  const handleViewMenu = (booking) => {
    setMenuEditingBooking(booking);
    setSelectedItems([]); // Clear immediately
    // Fetch current items for this booking
    apiRequest("GET", `/api/bookings/${booking.id}/items`)
      .then(res => res.json())
      .then((response) => {
        const items = response.data || response;
        if (Array.isArray(items)) {
          // Use a Map to ensure unique food items by ID
          const uniqueItemsMap = new Map();
          items.forEach(item => {
            const foodId = item.foodItemId;
            if (!uniqueItemsMap.has(foodId)) {
              uniqueItemsMap.set(foodId, {
                foodItemId: foodId,
                quantity: item.quantity
              });
            } else {
              const existing = uniqueItemsMap.get(foodId);
              existing.quantity = Math.max(existing.quantity, item.quantity);
            }
          });
          setSelectedItems(Array.from(uniqueItemsMap.values()));
        }
      })
      .catch(err => console.error("Failed to fetch booking items:", err));
    setIsMenuViewDialogOpen(true);
  };

  const handleEditMenu = (booking) => {
    setMenuEditingBooking(booking);
    setSelectedItems([]); // Clear immediately
    apiRequest("GET", `/api/bookings/${booking.id}/items`)
      .then(res => res.json())
      .then((response) => {
        const items = response.data || response;
        if (Array.isArray(items)) {
          // Use a Map to ensure unique food items by ID
          const uniqueItemsMap = new Map();
          items.forEach(item => {
            const foodId = item.foodItemId;
            if (!uniqueItemsMap.has(foodId)) {
              uniqueItemsMap.set(foodId, {
                foodItemId: foodId,
                quantity: item.quantity
              });
            } else {
              const existing = uniqueItemsMap.get(foodId);
              existing.quantity = Math.max(existing.quantity, item.quantity);
            }
          });
          setSelectedItems(Array.from(uniqueItemsMap.values()));
        }
      })
      .catch(err => console.error("Failed to fetch booking items:", err));
    setIsMenuEditDialogOpen(true);
  };

  const saveMenuMutation = useMutation({
    mutationFn: async ({ id, items }) => {
      return apiRequest("POST", `/api/bookings/${id}/items`, items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Menu Updated", description: "Menu items have been updated successfully" });
      setIsMenuEditDialogOpen(false);
      setMenuEditingBooking(null);
      setSelectedItems([]);
    },
    onError: (error) => {
      toast({ title: "Update Failed", description: error?.message || "Unable to update menu", variant: "destructive" });
    }
  });

  const handleSaveMenu = () => {
    if (menuEditingBooking) {
      const items = selectedItems.map(item => ({
        bookingId: menuEditingBooking.id,
        foodItemId: item.foodItemId,
        quantity: menuEditingBooking.guestCount || 1
      }));
      saveMenuMutation.mutate({ id: menuEditingBooking.id, items });
    }
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
    const guestCount = parseInt(data.guestCount) || 0;
    const pricePerPlate = parseInt(data.pricePerPlate) || 0;
    const totalAmount = guestCount * pricePerPlate;
    const advanceAmount = Math.round(totalAmount * 0.5);

    const submissionData = {
      ...data,
      guestCount,
      pricePerPlate,
      totalAmount,
      advanceAmount,
      advancePaymentStatus: editingBooking ? (data.advancePaymentStatus || editingBooking.advancePaymentStatus || "pending") : "pending",
      finalPaymentStatus: editingBooking ? (data.finalPaymentStatus || editingBooking.finalPaymentStatus || "pending") : "pending",
      advancePaymentApprovalStatus: editingBooking ? (data.advancePaymentApprovalStatus || editingBooking.advancePaymentApprovalStatus || "pending") : "pending",
      finalPaymentApprovalStatus: editingBooking ? (data.finalPaymentApprovalStatus || editingBooking.finalPaymentApprovalStatus || "pending") : "pending",
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
    form.reset({
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
    });
    setSelectedItems([]);
  };

  const handleAddNew = () => {
    setEditingBooking(null);
    form.reset({
      clientName: "",
      eventDate: "",
      eventType: "",
      guestCount: 0,
      pricePerPlate: 0,
      contactEmail: "",
      contactPhone: "",
      specialRequests: "",
      status: "pending",
    });
    setSelectedItems([]);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground" style={{ fontFamily: 'Poppins, sans-serif' }}>
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
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) handleDialogClose();
            setIsDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew} data-testid="button-add-booking">
                <Plus className="w-4 h-4 mr-2" />
                Add Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBooking ? "Edit Booking" : "New Booking"}</DialogTitle>
                <DialogDescription>
                  Enter details for the event booking request.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="clientName" render={({ field }) => (
                      <FormItem><FormLabel>Client Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="eventType" render={({ field }) => (
                      <FormItem><FormLabel>Event Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="eventDate" render={({ field }) => (
                      <FormItem><FormLabel>Event Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="guestCount" render={({ field }) => (
                      <FormItem><FormLabel>Guest Count</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="pricePerPlate" render={({ field }) => (
                      <FormItem><FormLabel>Price Per Plate (₹)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="contactPhone" render={({ field }) => (
                      <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="contactEmail" render={({ field }) => (
                      <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
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
                    <FormItem><FormLabel>Special Requests</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <DialogFooter>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {(createMutation.isPending || updateMutation.isPending) && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
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
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10">Loading bookings...</TableCell></TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No bookings found</TableCell></TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="font-bold">{booking.clientName}</div>
                      <div className="text-xs text-muted-foreground">{booking.contactPhone}</div>
                    </TableCell>
                    <TableCell>
                      <div>{booking.eventType}</div>
                      <div className="text-xs text-muted-foreground">
                        {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-IN') : "TBD"} • {booking.guestCount} Guests
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase text-muted-foreground w-12">Advance:</span>
                          <Badge variant={booking.advancePaymentStatus === "paid" ? "default" : "secondary"} className="text-[10px] px-1 py-0">
                            {booking.advancePaymentStatus === "paid" ? "Paid" : "Pending"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase text-muted-foreground w-12">Final:</span>
                          <Badge variant={booking.finalPaymentStatus === "paid" ? "default" : "secondary"} className="text-[10px] px-1 py-0">
                            {booking.finalPaymentStatus === "paid" ? "Paid" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[booking.status] || "secondary"}>{booking.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewMenu(booking)}>
                        <List className="h-4 w-4 mr-1" /> Show Menu
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setLocation(`/admin/bookings/payment/${booking._id || booking.id}`)}>
                        <CreditCard className="h-4 w-4 mr-1" /> View Payment
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(booking)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(booking._id || booking.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isMenuViewDialogOpen} onOpenChange={setIsMenuViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Menu - {menuEditingBooking?.clientName}</DialogTitle>
            <DialogDescription>
              Menu items selected for this event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItems.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-muted-foreground">Selected Items ({selectedItems.length})</div>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map(si => {
                    const item = foodItems.find(f => f.id === si.foodItemId);
                    return (
                      <Badge key={si.foodItemId} variant="secondary" className="pl-2 pr-3 py-2 flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex-shrink-0 overflow-hidden">
                          <img src={item?.imageUrl || ""} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold max-w-[150px] truncate">{item?.name}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">Guests: {si.quantity}</span>
                        </div>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No items selected for this menu.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMenuViewDialogOpen(false)}>Close</Button>
            <Button onClick={() => {
              setIsMenuViewDialogOpen(false);
              handleEditMenu(menuEditingBooking);
            }}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMenuEditDialogOpen} onOpenChange={setIsMenuEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Menu - {menuEditingBooking?.clientName}</DialogTitle>
            <DialogDescription>
              Add, remove or update items for this event's menu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-base font-bold">Menu Items</div>
              <div className="flex gap-2">
                <Select onValueChange={(val) => setSelectedCategory(val)} value={selectedCategory}>
                  <SelectTrigger className="w-[150px] h-8">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto z-[9999]">
                    <SelectItem value="all">All Categories</SelectItem>
                    {getCategories().map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input 
                    placeholder="Search food..." 
                    className="h-8 pl-7 w-[150px]"
                    value={foodSearchQuery}
                    onChange={(e) => setFoodSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto p-1 border rounded-md">
              {filteredFoodItems.map((item) => {
                const isSelected = selectedItems.some(si => si.foodItemId === item.id);
                return (
                  <div 
                    key={item.id}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                      isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="h-8 w-8 rounded bg-secondary flex-shrink-0 overflow-hidden">
                        <img src={item.imageUrl || ""} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{item.category}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className="h-7 w-7 p-0 rounded-full"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedItems(prev => prev.filter(si => si.foodItemId !== item.id));
                        } else {
                          setSelectedItems(prev => [...prev, { foodItemId: item.id, quantity: menuEditingBooking?.guestCount || 1 }]);
                        }
                      }}
                    >
                      {isSelected ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                    </Button>
                  </div>
                );
              })}
            </div>

            {selectedItems.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-muted-foreground">Selected Items ({selectedItems.length})</div>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map(si => {
                    const item = foodItems.find(f => f.id === si.foodItemId);
                    return (
                      <Badge key={si.foodItemId} variant="secondary" className="pl-2 pr-3 py-2 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex-shrink-0 overflow-hidden">
                          <img src={item?.imageUrl || ""} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold max-w-[150px] truncate">{item?.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium">Guests:</span>
                            <div className="flex items-center gap-1">
                              <Button 
                                type="button"
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6 rounded-md border-primary/20 p-0"
                                onClick={() => setSelectedItems(prev => prev.map(p => p.foodItemId === si.foodItemId ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p))}
                              >
                                <span className="text-sm font-bold">-</span>
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={si.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1;
                                  setSelectedItems(prev => prev.map(p => p.foodItemId === si.foodItemId ? { ...p, quantity: val } : p));
                                }}
                                className="h-7 w-12 text-center text-xs font-bold bg-background border-primary/20 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <Button 
                                type="button"
                                variant="outline" 
                                size="icon" 
                                className="h-6 w-6 rounded-md border-primary/20 p-0"
                                onClick={() => setSelectedItems(prev => prev.map(p => p.foodItemId === si.foodItemId ? { ...p, quantity: p.quantity + 1 } : p))}
                              >
                                <span className="text-sm font-bold">+</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 p-0 hover:bg-transparent ml-2 text-destructive"
                          onClick={() => setSelectedItems(prev => prev.filter(p => p.foodItemId !== si.foodItemId))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMenuDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMenu} disabled={saveMenuMutation.isPending}>
              {saveMenuMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Update Menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Booking"
        description="Are you sure you want to delete this booking? This action cannot be undone."
      />
    </div>
  );
}
