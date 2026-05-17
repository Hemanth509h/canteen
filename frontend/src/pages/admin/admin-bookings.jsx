import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { Plus, Pencil, Trash2, CalendarDays, Printer, Search, Eye, RefreshCw, List, DollarSign, Users, CreditCard, X, Loader2, Mail } from "lucide-react";
import { insertEventBookingSchema, updateEventBookingSchema } from "@/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ExportButton } from "@/components/features/export-button";
import { TableSkeleton } from "@/components/features/loading-spinner";
import { ConfirmDialog } from "@/components/features/confirm-dialog";
import { printElement } from "@/lib/print-utils";
import localMenuItems from "@/lib/menu.json";

const statusColors = {
  pending: "secondary",
  confirmed: "default",
  completed: "default",
  cancelled: "destructive",
};

export default function EventBookingsManager() {
  const menuPrintRef = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isPreparingMenuPrint, setIsPreparingMenuPrint] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedBookingForAssignment, setSelectedBookingForAssignment] = useState(null);
  const [staffAssignments, setStaffAssignments] = useState([]);
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
    queryFn: async () => {
      try {
        const res = await fetch("/api/food-items");
        if (!res.ok) throw new Error("Food API unavailable");
        const json = await res.json();
        return json.data || json || localMenuItems;
      } catch {
        return localMenuItems;
      }
    },
    placeholderData: localMenuItems,
  });

  const { data: staffList = [] } = useQuery({
    queryKey: ["/api/staff"],
  });

  const [statusUpdateTimestamps, setStatusUpdateTimestamps] = useState({});

  useEffect(() => {
    const savedTimestamps = localStorage.getItem("booking_status_timestamps");
    if (savedTimestamps) {
      try {
        setStatusUpdateTimestamps(JSON.parse(savedTimestamps));
      } catch (e) {
        console.error("Failed to parse timestamps", e);
      }
    }
  }, []);

  const filteredBookings = (bookings || []).filter((booking) => {
    const matchesSearch = (booking.clientName || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (booking.eventType || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (booking.contactEmail || "").toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (booking.status || "").toLowerCase().includes(debouncedSearch.toLowerCase());
    
    // If searching, show all matches regardless of status or timing
    if (debouncedSearch) return matchesSearch;

    const matchesStatusFilter = !statusFilter || booking.status === statusFilter;
    if (!matchesStatusFilter) return false;

    // Keep Event Bookings focused on active work. Completed/cancelled records
    // remain available from History, or by explicitly filtering/searching here.
    if (!statusFilter && ["cancelled", "completed"].includes(booking.status)) {
      return false;
    }
    
    const bookingDate = new Date(booking.eventDate);
    const matchesDateFrom = !dateFrom || bookingDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || bookingDate <= new Date(dateTo);
    
    return matchesSearch && matchesDateFrom && matchesDateTo;
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
    return '';
  };

  const getBookingId = (booking) => booking?._id || booking?.id;

  const unwrapApiResponse = async (response) => {
    const json = await response.json();
    return json?.success && json.data !== undefined ? json.data : json;
  };

  const fetchStaffAssignments = async (booking = selectedBookingForAssignment) => {
    const bookingId = getBookingId(booking);
    if (!bookingId) return;
    try {
      const res = await apiRequest("GET", `/api/bookings/${bookingId}/staff`);
      const assignments = await unwrapApiResponse(res);
      const nextAssignments = Array.isArray(assignments) ? assignments : [];
      setStaffAssignments(nextAssignments);
      return nextAssignments;
    } catch (error) {
      try {
        const fallbackRes = await apiRequest("GET", `/api/bookings/${bookingId}/assigned-staff`);
        const assigned = await unwrapApiResponse(fallbackRes);
        const nextAssignments = (Array.isArray(assigned) ? assigned : []).map((staff) => ({
          id: `${bookingId}-${staff.id || staff._id}`,
          bookingId,
          staffId: staff.id || staff._id,
          role: staff.role,
          status: "accepted",
          staff,
        }));
        setStaffAssignments(nextAssignments);
        return nextAssignments;
      } catch (fallbackError) {
        console.error("Failed to fetch staff assignments:", fallbackError);
        setStaffAssignments([]);
        return [];
      }
    }
  };

  useEffect(() => {
    if (assignmentModalOpen && selectedBookingForAssignment) {
      fetchStaffAssignments();
    }
  }, [assignmentModalOpen, selectedBookingForAssignment]);

  const form = useForm({
    resolver: zodResolver(editingBooking ? updateEventBookingSchema : insertEventBookingSchema),
    defaultValues: {
      clientName: "",
      eventDate: "",
      eventType: "",
      mealType: "",
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
    } else {
      setSelectedItems([]);
    }
  }, [editingBooking]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const priceInRupees = Math.round(data.pricePerPlate);
      const items = selectedItems.map(item => ({
        foodItemId: item.foodItemId,
        quantity: item.quantity
      }));
      const response = await apiRequest("POST", "/api/bookings", { ...data, pricePerPlate: priceInRupees, items });
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
      // Record timestamp for specific status changes
      if (variables.data.status && ["cancelled", "completed"].includes(variables.data.status)) {
        const newTimestamps = { ...statusUpdateTimestamps, [variables.id]: Date.now() };
        setStatusUpdateTimestamps(newTimestamps);
        localStorage.setItem("booking_status_timestamps", JSON.stringify(newTimestamps));
      }

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

  const sendUpdateMailMutation = useMutation({
    mutationFn: async ({ id, message }) => {
      const response = await apiRequest("POST", `/api/bookings/${id}/send-update`, { message });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send update email");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Booking details have been sent to the customer.",
      });
      setIsMessageModalOpen(false);
      setCustomMessage("");
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const assignStaffMutation = useMutation({
    mutationFn: async ({ bookingId, staffId, role }) => {
      const response = await apiRequest("POST", `/api/bookings/${bookingId}/staff`, {
        staffId,
        role,
        status: "accepted",
      });
      return unwrapApiResponse(response);
    },
    onSuccess: async (assignment, variables) => {
      const assignments = await fetchStaffAssignments();
      if (assignments.length === 0 && assignment?.staffId) {
        const staff = staffList.find((member) => String(member.id || member._id) === String(variables.staffId));
        setStaffAssignments([{
          ...assignment,
          staffId: assignment.staffId || variables.staffId,
          staff,
          status: assignment.status || "accepted",
        }]);
      }
      toast({
        title: "Staff Assigned",
        description: "Staff member has been assigned to this booking.",
      });
    },
    onError: (error) => {
      toast({
        title: "Assignment Failed",
        description: error?.message || "Unable to assign staff.",
        variant: "destructive",
      });
    },
  });

  const removeStaffAssignmentMutation = useMutation({
    mutationFn: async ({ bookingId, staffId }) => {
      const response = await apiRequest("DELETE", `/api/bookings/${bookingId}/staff/${staffId}`);
      return unwrapApiResponse(response);
    },
    onSuccess: async () => {
      await fetchStaffAssignments();
      toast({
        title: "Staff Removed",
        description: "Staff assignment has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Remove Failed",
        description: error?.message || "Unable to remove staff assignment.",
        variant: "destructive",
      });
    },
  });

  const recordStaffWorkMutation = useMutation({
    mutationFn: async ({ staffId, bookingId, amount, notes }) => {
      const response = await apiRequest("POST", "/api/staff-payments", {
        staffId,
        bookingId,
        amount: amount || 0,
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "cash",
        notes: notes || "Work recorded from booking",
        status: "pending",
      });
      return unwrapApiResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-payments"] });
      toast({
        title: "Work Recorded",
        description: "Staff work has been recorded for payment.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to record staff work.",
        variant: "destructive",
      });
    },
  });

  const { data: staffPayments = [] } = useQuery({
    queryKey: ["/api/staff-payments"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/staff-payments");
      return unwrapApiResponse(res);
    },
  });

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedBookingForMessage, setSelectedBookingForMessage] = useState(null);
  const [customMessage, setCustomMessage] = useState("");

  const openMessageModal = (booking) => {
    setSelectedBookingForMessage(booking);
    setCustomMessage("");
    setIsMessageModalOpen(true);
  };

  const handleSendUpdateMail = () => {
    if (!selectedBookingForMessage) return;
    sendUpdateMailMutation.mutate({ 
      id: selectedBookingForMessage._id || selectedBookingForMessage.id, 
      message: customMessage 
    });
  };

  const openAssignmentModal = (booking) => {
    if (String(booking.status || "").toLowerCase() !== "confirmed") {
      toast({
        title: "Confirm Booking First",
        description: "Staff can be assigned after the event booking is confirmed.",
        variant: "destructive",
      });
      return;
    }
    setSelectedBookingForAssignment(booking);
    setStaffAssignments([]);
    setAssignmentModalOpen(true);
  };

  const isBookingConfirmed = (booking) => String(booking?.status || "").toLowerCase() === "confirmed";


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
      mealType: booking.mealType || "",
      guestCount: booking.guestCount || 0,
      pricePerPlate: booking.pricePerPlate || 0,
      contactEmail: booking.contactEmail || "",
      contactPhone: booking.contactPhone || "",
      servingBoysNeeded: booking.servingBoysNeeded || 2,
      eventLocation: booking.eventLocation || "",
      specialRequests: cleanedSpecialRequests,
      status: booking.status || "pending",
    });
    setIsDialogOpen(true);
  };

  const handlePrintMenu = async () => {
    setIsPreparingMenuPrint(true);
    await printElement(menuPrintRef.current);
    setIsPreparingMenuPrint(false);
  };

  const handleViewMenu = (booking) => {
    // Get the most up-to-date booking info from the list
    const latestBooking = bookings.find(b => b.id === booking.id) || booking;
    setMenuEditingBooking(latestBooking);
    setSelectedItems([]); // Clear immediately
    // Fetch current items for this booking
    apiRequest("GET", `/api/bookings/${latestBooking.id}/items`)
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
                quantity: item.quantity // Use the quantity from database
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
    // Get the most up-to-date booking info from the list
    const latestBooking = bookings.find(b => b.id === booking.id) || booking;
    setMenuEditingBooking(latestBooking);
    setSelectedItems([]); // Clear immediately
    apiRequest("GET", `/api/bookings/${latestBooking.id}/items`)
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
                quantity: item.quantity // Use the quantity from database
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

  const handleSaveMenu = async () => {
    if (menuEditingBooking) {
      // Find the latest version of this booking from the bookings list to get updated booking ID
      const latestBooking = bookings.find(b => b.id === menuEditingBooking.id) || menuEditingBooking;
      
      const items = selectedItems.map(item => ({
        bookingId: latestBooking.id,
        foodItemId: item.foodItemId,
        quantity: item.quantity // Use the individual item's quantity (allows overrides)
      }));
      
      await saveMenuMutation.mutateAsync({ id: latestBooking.id, items });
      // Invalidate both bookings and chef printout queries to ensure everything is updated
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chef-printout"] });
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
      servingBoysNeeded: parseInt(data.servingBoysNeeded) || 0,
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
      eventType: "",
      mealType: "",
      eventDate: "",
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
      mealType: "",
      guestCount: 0,
      pricePerPlate: 0,
      servingBoysNeeded: 2,
      contactEmail: "",
      contactPhone: "",
      eventLocation: "",
      specialRequests: "",
      status: "pending",
    });
    setSelectedItems([]);
    setIsDialogOpen(true);
  };

  const selectedBookingId = getBookingId(selectedBookingForAssignment);
  const assignedStaffIds = new Set(staffAssignments.map((assignment) => String(assignment.staffId)));
  const availableStaff = staffList.filter((member) => !assignedStaffIds.has(String(member.id || member._id)));
  const assignedStaffCount = staffAssignments.length;
  const requiredStaffCount = selectedBookingForAssignment?.servingBoysNeeded || 0;
  const groupedMenuByCategory = {};
  selectedItems.forEach(si => {
    const item = foodItems.find(f => f.id === si.foodItemId);
    if (!item) return;
    const cat = item.category || "Other";
    if (!groupedMenuByCategory[cat]) {
      groupedMenuByCategory[cat] = [];
    }
    groupedMenuByCategory[cat].push({
      ...si,
      name: item.name
    });
  });

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
                    <FormField control={form.control} name="mealType" render={({ field }) => (
                      <FormItem><FormLabel>Meal Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select meal" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Breakfast">Breakfast</SelectItem>
                            <SelectItem value="Lunch">Lunch</SelectItem>
                            <SelectItem value="Dinner">Dinner</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
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
                    <FormField control={form.control} name="servingBoysNeeded" render={({ field }) => (
                      <FormItem><FormLabel>Staff Needed</FormLabel><FormControl><Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="contactPhone" render={({ field }) => (
                      <FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="contactEmail" render={({ field }) => (
                      <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="eventLocation" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Event Location</FormLabel>
                        <FormControl><Input placeholder="Event venue or address" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
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
                      <div>{booking.eventType} {booking.mealType && <Badge variant="outline" className="ml-1 text-[10px] h-4 px-1">{booking.mealType}</Badge>}</div>
                      <div className="text-xs text-muted-foreground">
                        {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-IN') : "TBD"} • {booking.guestCount} Guests
                      </div>
                      {booking.eventLocation && (
                        <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 italic">
                          📍 {booking.eventLocation}
                        </div>
                      )}
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openMessageModal(booking)}
                        disabled={sendUpdateMailMutation.isPending}
                        title="Send Update Mail to Customer"
                      >
                        {sendUpdateMailMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4 mr-1" />
                        )}
                        Send Mail
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewMenu(booking)}>
                        <List className="h-4 w-4 mr-1" /> Show Menu
                      </Button>
                      {isBookingConfirmed(booking) && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => setLocation(`/admin/bookings/payment/${booking._id || booking.id}`)}>
                            <CreditCard className="h-4 w-4 mr-1" /> View Payment
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openAssignmentModal(booking)}>
                            <Users className="h-4 w-4 mr-1" /> {String(booking.status).toLowerCase() === "completed" ? "Track Attendance" : "Assign Staff"}
                          </Button>
                        </>
                      )}
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
        <DialogContent className="w-[min(94vw,720px)] max-w-none overflow-hidden p-0">
          <div className="max-h-[78vh] overflow-y-auto bg-background">
            <div className="space-y-5 p-5 sm:p-6 print:bg-white print:p-8">
            <DialogHeader>
              <DialogTitle className="pr-8 leading-tight">View Menu - {menuEditingBooking?.clientName}</DialogTitle>
              <DialogDescription>
                Menu items selected for this event.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Client</p>
                  <p className="mt-1 truncate font-semibold">{menuEditingBooking?.clientName || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Guests</p>
                  <p className="mt-1 font-semibold">{menuEditingBooking?.guestCount || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Items</p>
                  <p className="mt-1 font-semibold">{selectedItems.length}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
            {selectedItems.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-muted-foreground">Selected Items ({selectedItems.length})</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selectedItems.map(si => {
                    const item = foodItems.find(f => f.id === si.foodItemId);
                    return (
                      <div key={si.foodItemId} className="flex min-w-0 items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                          {String(item?.name || "M").slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{item?.name || "Menu item"}</p>
                          <p className="text-xs text-muted-foreground">Guests: {si.quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed py-10 text-center text-muted-foreground">
                No items selected for this menu.
              </div>
            )}
            </div>
            </div>
          </div>
          <DialogFooter className="gap-2 border-t bg-card p-4 sm:p-4">
            <Button variant="outline" onClick={() => setIsMenuViewDialogOpen(false)}>Close</Button>
            <Button variant="outline" onClick={handlePrintMenu} disabled={isPreparingMenuPrint}>
              {isPreparingMenuPrint ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Printer className="h-4 w-4 mr-2" />
              )}
              {isPreparingMenuPrint ? 'Preparing...' : 'Print'}
            </Button>
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

      <div className="fixed left-[-10000px] top-0 bg-white p-8 text-black" style={{ width: "210mm", boxSizing: "border-box" }}>
        <div ref={menuPrintRef} className="space-y-6">
          <div className="border-b-4 border-blue-600 pb-5">
            <h1 className="text-3xl font-bold text-gray-900">Event Menu</h1>
            <p className="mt-1 text-sm text-gray-600">{menuEditingBooking?.clientName || "N/A"}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-lg border bg-gray-50 p-4 text-sm">
            <div>
              <p className="text-xs font-bold uppercase text-gray-500">Client</p>
              <p className="mt-1 font-semibold text-gray-900">{menuEditingBooking?.clientName || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-gray-500">Guests</p>
              <p className="mt-1 font-semibold text-gray-900">{menuEditingBooking?.guestCount || 0}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-gray-500">Items</p>
              <p className="mt-1 font-semibold text-gray-900">{selectedItems.length}</p>
            </div>
          </div>

          {Object.keys(groupedMenuByCategory).length > 0 ? (
            <div className="columns-1 md:columns-2 gap-6">
              {Object.entries(groupedMenuByCategory).map(([category, items]) => (
                <div key={category} className="overflow-hidden rounded-lg border mb-6 break-inside-avoid">
                  <div className="bg-gray-900 px-4 py-3">
                    <h2 className="text-lg font-bold text-white">{category}</h2>
                  </div>
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-100">
                      <tr className="border-b">
                        <th className="w-12 p-3 text-left text-gray-900">#</th>
                        <th className="p-3 text-left text-gray-900">Item</th>
                        <th className="w-20 p-3 text-center text-gray-900">Guests</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={item.foodItemId} className="border-b last:border-0">
                          <td className="p-3 text-gray-600">{idx + 1}</td>
                          <td className="p-3 font-semibold text-gray-900">{item.name}</td>
                          <td className="p-3 text-center font-bold text-gray-900">{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed py-10 text-center text-gray-500">
              No items selected for this menu.
            </div>
          )}
        </div>
      </div>

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
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-secondary text-[10px] font-bold text-muted-foreground">
                        {String(item.name || "M").slice(0, 1).toUpperCase()}
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
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                          {String(item?.name || "M").slice(0, 1).toUpperCase()}
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
            <Button variant="outline" onClick={() => setIsMenuEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMenu} disabled={saveMenuMutation.isPending}>
              {saveMenuMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Update Menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assignmentModalOpen} onOpenChange={setAssignmentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{String(selectedBookingForAssignment?.status).toLowerCase() === "completed" ? "Staff Attendance & Work" : "Assign Staff"} - {selectedBookingForAssignment?.clientName}</DialogTitle>
            <DialogDescription>
              {String(selectedBookingForAssignment?.status).toLowerCase() === "completed" 
                ? "Verify staff who worked at this event to record their work for payment."
                : "Staff can be assigned after the booking is confirmed."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Event</p>
                <p className="mt-1 font-semibold">{selectedBookingForAssignment?.eventType || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</p>
                <p className="mt-1 font-semibold">
                  {selectedBookingForAssignment?.eventDate ? new Date(selectedBookingForAssignment.eventDate).toLocaleDateString("en-IN") : "TBD"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Assigned</p>
                <p className="mt-1 font-semibold">{assignedStaffCount}{requiredStaffCount ? ` / ${requiredStaffCount}` : ""}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-muted-foreground">
                {String(selectedBookingForAssignment?.status).toLowerCase() === "completed" ? "Staff Who Worked" : "Assigned Staff"}
              </div>
              {staffAssignments.length > 0 ? (
                <div className="space-y-2">
                  {staffAssignments.map((assignment) => {
                    const staff = assignment.staff;
                    const bookingId = getBookingId(selectedBookingForAssignment);
                    const staffId = assignment.staffId;
                    
                    // Check if work is already recorded
                    const hasWorkRecord = staffPayments.some(p => 
                      String(p.staffId) === String(staffId) && 
                      String(p.bookingId) === String(bookingId)
                    );

                    const isCompleted = String(selectedBookingForAssignment?.status).toLowerCase() === "completed";

                    return (
                      <div key={assignment.id || assignment.staffId} className="flex items-center justify-between rounded-lg border p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{staff?.name || "Unknown Staff"}</p>
                          <p className="text-xs capitalize text-muted-foreground">{assignment.role || staff?.role || "staff"} • {assignment.status}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            hasWorkRecord ? (
                              <Badge variant="success" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                                Work Recorded
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => recordStaffWorkMutation.mutate({ 
                                  staffId, 
                                  bookingId,
                                  notes: `Work done for ${selectedBookingForAssignment.eventType} at ${selectedBookingForAssignment.eventLocation}`
                                })}
                                disabled={recordStaffWorkMutation.isPending}
                              >
                                {recordStaffWorkMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Record Work"}
                              </Button>
                            )
                          )}
                          {!isCompleted && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive h-8 w-8"
                              disabled={removeStaffAssignmentMutation.isPending}
                              onClick={() => removeStaffAssignmentMutation.mutate({ bookingId: selectedBookingId, staffId: assignment.staffId })}
                              title="Remove staff"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                  No staff assigned yet.
                </div>
              )}
            </div>

            {String(selectedBookingForAssignment?.status).toLowerCase() !== "completed" && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-muted-foreground">Available Staff</div>
                {availableStaff.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {availableStaff.map((staff) => {
                      const staffId = staff.id || staff._id;
                      return (
                        <div key={staffId} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{staff.name}</p>
                            <p className="text-xs capitalize text-muted-foreground">{staff.role} • {staff.phone}</p>
                          </div>
                          <Button
                            size="sm"
                            disabled={assignStaffMutation.isPending || !selectedBookingId}
                            onClick={() => assignStaffMutation.mutate({ bookingId: selectedBookingId, staffId, role: staff.role })}
                          >
                            {assignStaffMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                    All available staff are assigned to this booking.
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignmentModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Update Email</DialogTitle>
            <DialogDescription>
              Include a custom message for {selectedBookingForMessage?.clientName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <Textarea
                id="message"
                className="min-h-[120px]"
                placeholder="Type your message here..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                This message will appear at the top of the booking details email.
              </p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Status to be sent</p>
              <Badge>{selectedBookingForMessage?.status || "Pending"}</Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSendUpdateMail} disabled={sendUpdateMailMutation.isPending}>
              {sendUpdateMailMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Email
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
