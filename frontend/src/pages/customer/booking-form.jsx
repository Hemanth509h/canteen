import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertEventBookingSchema } from "@/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ChevronLeft, Search, Check, Plus, Minus, Ticket, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function BookingForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState([]);
  const [userCode, setUserCode] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    eventDetails: ""
  });

  const { data: foodItems = [] } = useQuery({
    queryKey: ["/api/food-items"],
  });

  const form = useForm({
    resolver: zodResolver(insertEventBookingSchema),
    defaultValues: {
      clientName: "",
      eventDate: "",
      eventType: "",
      guestCount: 1,
      pricePerPlate: 500,
      servingBoysNeeded: 2,
      contactEmail: "",
      contactPhone: "",
      specialRequests: "",
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async (code) => {
      const response = await fetch(`/api/codes/verify?code=${code}`);
      if (!response.ok) throw new Error("Invalid or used code");
      return await response.json();
    },
    onSuccess: () => {
      setIsCodeVerified(true);
      toast({ title: "Code Verified", description: "You can now proceed with your booking." });
    },
    onError: (error) => {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/code-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        let err = { error: "Failed to submit request" };
        try {
          err = await res.json();
        } catch (e) {
          // Not JSON
        }
        throw new Error(err.error || "Failed to submit request");
      }
      const result = await res.json();
      return result.data || result;
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "We'll review your request and contact you shortly.",
      });
      setShowRequestForm(false);
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
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
        status: "pending",
      };

      const response = await apiRequest("POST", "/api/bookings", submissionData);
      const bookingResponse = await response.json();
      const booking = bookingResponse.data;

      if (selectedItems.length > 0) {
        const items = selectedItems.map(item => ({
          bookingId: booking.id,
          foodItemId: item.foodItemId,
          quantity: item.quantity
        }));
        await apiRequest("POST", `/api/bookings/${booking.id}/items`, items);
      }

      await apiRequest("POST", "/api/codes/use", { code: userCode });
      return booking;
    },
    onSuccess: () => {
      toast({ title: "Booking Successful", description: "Your booking has been created." });
      setLocation("/");
    },
    onError: (error) => {
      toast({ title: "Booking Failed", description: error.message, variant: "destructive" });
    },
  });

  const getCategories = () => {
    const categories = new Set((foodItems || []).map(item => item.category).filter(Boolean));
    return Array.from(categories).sort();
  };

  const filteredFoodItems = (foodItems || []).filter((item) => {
    const matchesSearch = (item.name || "").toLowerCase().includes(foodSearchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectItem = (item, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, { foodItemId: item.id, quantity: form.getValues("guestCount") || 1, name: item.name }]);
    } else {
      setSelectedItems(selectedItems.filter(si => si.foodItemId !== item.id));
    }
  };

  const updateQuantity = (itemId, delta) => {
    setSelectedItems(selectedItems.map(si => 
      si.foodItemId === itemId ? { ...si, quantity: Math.max(1, si.quantity + delta) } : si
    ));
  };

  if (!isCodeVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          {!showRequestForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Enter Access Code</CardTitle>
                <CardDescription>Enter the code provided by the admin to book your event.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input 
                  placeholder="Enter your code" 
                  value={userCode} 
                  onChange={(e) => setUserCode(e.target.value)}
                />
                <Button className="w-full" onClick={() => verifyCodeMutation.mutate(userCode)} disabled={verifyCodeMutation.isPending}>
                  {verifyCodeMutation.isPending ? "Verifying..." : "Verify Code"}
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
                </div>
                <Button variant="outline" className="w-full gap-2" onClick={() => setShowRequestForm(true)}>
                  <Ticket className="w-4 h-4" /> Request Access Code
                </Button>
                <div className="text-center text-sm text-muted-foreground mt-2">
                  Need a code? Request one above.
                </div>
                <Button variant="ghost" className="w-full" onClick={() => setLocation("/")}>Back to Home</Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Ticket className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Request User Code</CardTitle>
                <CardDescription>Enter your details below to request a code.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); requestMutation.mutate(requestData); }} className="space-y-4">
                  <div className="space-y-2">
                    <Input placeholder="Full Name" required value={requestData.customerName} onChange={(e) => setRequestData({...requestData, customerName: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Email" type="email" required value={requestData.customerEmail} onChange={(e) => setRequestData({...requestData, customerEmail: e.target.value})} />
                    <Input placeholder="Phone" type="tel" required value={requestData.customerPhone} onChange={(e) => setRequestData({...requestData, customerPhone: e.target.value})} />
                  </div>
                  <Textarea placeholder="Event Details..." className="min-h-[100px]" value={requestData.eventDetails} onChange={(e) => setRequestData({...requestData, eventDetails: e.target.value})} />
                  <Button type="submit" className="w-full gap-2" disabled={requestMutation.isPending}>
                    <Send className="w-4 h-4" /> {requestMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => setShowRequestForm(false)}>Back to Verification</Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => setLocation("/")} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-poppins font-bold">Event Booking</CardTitle>
            <CardDescription>Please provide the details for your upcoming event.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="clientName" render={({ field }) => (
                    <FormItem><FormLabel>Your Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="eventDate" render={({ field }) => (
                    <FormItem><FormLabel>Event Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField control={form.control} name="eventType" render={({ field }) => (
                    <FormItem><FormLabel>Event Type</FormLabel><FormControl><Input placeholder="Wedding, Corporate, etc." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="guestCount" render={({ field }) => (
                    <FormItem><FormLabel>Guest Count</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="pricePerPlate" render={({ field }) => (
                    <FormItem><FormLabel>Price per Plate (₹)</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="contactEmail" render={({ field }) => (
                    <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="contactPhone" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="+91 12345 67890" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <div className="border-t pt-8">
                  <h3 className="text-xl font-bold mb-4">Select Food Items</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search food..." value={foodSearchQuery} onChange={(e) => setFoodSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {getCategories().map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1">
                    {filteredFoodItems.map(item => {
                      const selected = selectedItems.find(si => si.foodItemId === item.id);
                      return (
                        <div key={item.id} className={cn("flex items-center justify-between p-4 border rounded-xl transition-all", selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50")}>
                          <div className="flex items-center gap-3">
                            <div className={cn("w-5 h-5 rounded border flex items-center justify-center cursor-pointer", selected ? "bg-primary border-primary text-white" : "border-muted-foreground")} onClick={() => handleSelectItem(item, !selected)}>
                              {selected && <Check size={14} />}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{item.name}</p>
                              <Badge variant="outline" className="text-[10px] uppercase">{item.type}</Badge>
                            </div>
                          </div>
                          {selected && (
                            <div className="flex items-center gap-2">
                              <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, -1)}><Minus size={12} /></Button>
                              <span className="text-xs font-bold w-8 text-center">{selected.quantity}</span>
                              <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, 1)}><Plus size={12} /></Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <FormField control={form.control} name="specialRequests" render={({ field }) => (
                  <FormItem><FormLabel>Special Requests</FormLabel><FormControl><Textarea placeholder="Any specific requirements..." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="bg-secondary/20 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Estimated Total</p>
                    <p className="text-3xl font-poppins font-bold text-primary">₹{ (form.watch("guestCount") || 0) * (form.watch("pricePerPlate") || 0) }</p>
                  </div>
                  <Button type="submit" size="lg" className="px-12 h-14 text-lg font-bold" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Processing..." : "Confirm Booking"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
