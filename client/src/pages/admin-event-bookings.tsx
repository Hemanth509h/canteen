import { useState } from "react";
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
import { Plus, Pencil, Trash2, CalendarDays } from "lucide-react";
import { insertEventBookingSchema, updateEventBookingSchema, type EventBooking, type InsertEventBooking, type UpdateEventBooking } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  confirmed: "default",
  completed: "default",
  cancelled: "destructive",
};

export default function EventBookingsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<EventBooking | null>(null);
  const { toast } = useToast();

  const { data: bookings, isLoading } = useQuery<EventBooking[]>({
    queryKey: ["/api/bookings"],
  });

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
      contactEmail: "",
      contactPhone: "",
      specialRequests: "",
      status: "pending",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertEventBooking) => {
      const priceInRupees = Math.round(data.pricePerPlate);
      return apiRequest("POST", "/api/bookings", { ...data, pricePerPlate: priceInRupees });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Success", description: "Booking created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create booking", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEventBooking }) => {
      const updateData = { ...data };
      if (data.pricePerPlate !== undefined) {
        updateData.pricePerPlate = Math.round(data.pricePerPlate);
      }
      return apiRequest("PATCH", `/api/bookings/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Success", description: "Booking updated successfully" });
      setIsDialogOpen(false);
      setEditingBooking(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update booking", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/bookings/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Success", description: "Booking deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete booking", variant: "destructive" });
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
      status: booking.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: UpdateEventBooking) => {
    if (editingBooking) {
      updateMutation.mutate({ id: editingBooking.id, data });
    } else {
      const { status, ...insertData } = data as InsertEventBooking & { status?: string };
      createMutation.mutate(insertData as InsertEventBooking);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingBooking(null);
    form.reset();
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Event Bookings
          </h2>
          <p className="text-muted-foreground">
            Manage upcoming and past event bookings
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-booking">
              <Plus className="w-4 h-4 mr-2" />
              Add Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBooking ? "Edit Booking" : "Add New Booking"}
              </DialogTitle>
              <DialogDescription>
                {editingBooking ? "Update booking details" : "Create a new event booking"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-3 gap-4">
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
                          data-testid="input-special-requests"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            {bookings?.length || 0} total bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Price/Plate</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
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
                      <TableCell>₹{booking.pricePerPlate.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="font-semibold">
                        ₹{(booking.pricePerPlate * booking.guestCount).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[booking.status]}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
  );
}
