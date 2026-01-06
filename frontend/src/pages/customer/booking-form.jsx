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
import { ChevronLeft, Search, Check, Plus, Minus, Ticket, Send, Key, RefreshCw, Calendar, Clock, MapPin, User, Info } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("selection");
  const [requestData, setRequestData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    eventDetails: ""
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: isCodeVerified,
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
    onSuccess: (data) => {
      setIsCodeVerified(true);
      toast({ title: "Code Verified", description: "Welcome to your client portal." });
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
        try { err = await res.json(); } catch (e) {}
        throw new Error(err.error || "Failed to submit request");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Request Submitted", description: "We'll review your request and contact you shortly." });
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

      const response = await apiRequest("POST", "/api/bookings", { ...submissionData, userCode });
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
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setActiveTab("list");
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
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-6">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="w-full max-w-md space-y-4 relative z-10">
          {!showRequestForm ? (
            <Card className="border-primary/20 shadow-2xl shadow-primary/10 backdrop-blur-sm bg-background/95">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
                  <Key className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-serif font-bold">Client Access</CardTitle>
                <CardDescription className="text-base">Enter your exclusive booking code to continue.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="e.g. ELITE-2024" 
                      className="pl-10 h-12 text-lg font-mono tracking-widest border-primary/20 focus:border-primary transition-colors uppercase"
                      value={userCode} 
                      onChange={(e) => setUserCode(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5" 
                  onClick={() => verifyCodeMutation.mutate(userCode)} 
                  disabled={verifyCodeMutation.isPending}
                >
                  {verifyCodeMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" /> Verifying...
                    </div>
                  ) : "Access Client Portal"}
                </Button>
                
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-primary/10" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-4 text-muted-foreground font-medium">New Client?</span></div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full h-12 gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all" 
                  onClick={() => setShowRequestForm(true)}
                >
                  <Ticket className="w-5 h-5 text-primary" /> Request Access Code
                </Button>
                
                <div className="flex flex-col gap-2 pt-2">
                  <Button variant="ghost" className="w-full hover:bg-secondary/80" onClick={() => setLocation("/")}>
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/20 shadow-2xl shadow-primary/10 backdrop-blur-sm bg-background/95">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <Ticket className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-serif font-bold">Request Access</CardTitle>
                <CardDescription className="text-base">Share your event details and we'll send a code.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={(e) => { e.preventDefault(); requestMutation.mutate(requestData); }} className="space-y-4">
                  <div className="space-y-2">
                    <Input 
                      placeholder="Full Name" 
                      required 
                      className="h-11 border-primary/10 focus:border-primary"
                      value={requestData.customerName} 
                      onChange={(e) => setRequestData({...requestData, customerName: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <Input 
                      placeholder="Email Address" 
                      type="email" 
                      required 
                      className="h-11 border-primary/10 focus:border-primary"
                      value={requestData.customerEmail} 
                      onChange={(e) => setRequestData({...requestData, customerEmail: e.target.value})} 
                    />
                    <Input 
                      placeholder="Phone Number" 
                      type="tel" 
                      required 
                      className="h-11 border-primary/10 focus:border-primary"
                      value={requestData.customerPhone} 
                      onChange={(e) => setRequestData({...requestData, customerPhone: e.target.value})} 
                    />
                  </div>
                  <Textarea 
                    placeholder="Tell us about your event (Date, Location, Guests)..." 
                    className="min-h-[120px] border-primary/10 focus:border-primary resize-none" 
                    value={requestData.eventDetails} 
                    onChange={(e) => setRequestData({...requestData, eventDetails: e.target.value})} 
                  />
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-bold gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" 
                    disabled={requestMutation.isPending}
                  >
                    {requestMutation.isPending ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    {requestMutation.isPending ? "Submitting..." : "Send Request"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full h-11" 
                    onClick={() => setShowRequestForm(false)}
                    type="button"
                  >
                    Back to Verification
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/")} size="icon" className="rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-serif font-bold">Client Portal</h1>
              <p className="text-muted-foreground text-sm">Welcome back! Manage your bookings and menu.</p>
            </div>
          </div>
          
        <div className="flex bg-secondary/50 p-1 rounded-xl w-fit border border-primary/10">
          <Button 
            variant={activeTab === "selection" ? "primary" : "ghost"} 
            className={cn("gap-2 px-6", activeTab === "selection" && "bg-primary text-white shadow-lg hover:text-white")}
            onClick={() => setActiveTab("selection")}
          >
            <Info className="w-4 h-4" /> Home
          </Button>
          <Button 
            variant={activeTab === "form" ? "primary" : "ghost"} 
            className={cn("gap-2 px-6", activeTab === "form" && "bg-primary text-white shadow-lg hover:text-white")}
            onClick={() => setActiveTab("form")}
          >
            <Calendar className="w-4 h-4" /> New Booking
          </Button>
          <Button 
            variant={activeTab === "list" ? "primary" : "ghost"} 
            className={cn("gap-2 px-6", activeTab === "list" && "bg-primary text-white shadow-lg hover:text-white")}
            onClick={() => setActiveTab("list")}
          >
            <Clock className="w-4 h-4" /> My Bookings
          </Button>
        </div>
      </div>

      {activeTab === "selection" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-12 fade-in">
          <Card className="group hover:border-primary/50 transition-all cursor-pointer overflow-hidden border-primary/10 shadow-xl" onClick={() => setActiveTab("form")}>
            <div className="h-2 bg-primary group-hover:h-3 transition-all" />
            <CardHeader className="text-center space-y-4 pt-8">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                <Calendar className="w-10 h-10 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-serif font-bold">New Booking</CardTitle>
                <CardDescription className="text-base mt-2">Ready for a new event? Choose your menu and lock in your date.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pb-8 text-center">
              <Button className="w-full h-12 text-lg font-bold gap-2">
                Start Booking <Plus className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>

          <Card className="group hover:border-primary/50 transition-all cursor-pointer overflow-hidden border-primary/10 shadow-xl" onClick={() => setActiveTab("list")}>
            <div className="h-2 bg-secondary group-hover:h-3 transition-all" />
            <CardHeader className="text-center space-y-4 pt-8">
              <div className="mx-auto w-20 h-20 bg-secondary/20 rounded-3xl flex items-center justify-center -rotate-3 group-hover:rotate-0 transition-transform">
                <Clock className="w-10 h-10 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-serif font-bold">My Bookings</CardTitle>
                <CardDescription className="text-base mt-2">View your scheduled events and track their current status.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pb-8 text-center">
              <Button variant="outline" className="w-full h-12 text-lg font-bold gap-2 border-primary/20">
                View History <ChevronLeft className="w-5 h-5 rotate-180" />
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : activeTab === "form" ? (
          <div className="fade-in">
            <Card className="border-primary/10 shadow-xl overflow-hidden">
              <div className="h-2 bg-primary" />
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Plus className="text-primary" /> Event Details
                </CardTitle>
                <CardDescription>Enter your event information below to create a new booking.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="clientName" render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="eventDate" render={({ field }) => (
                        <FormItem><FormLabel>Event Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="eventType" render={({ field }) => (
                        <FormItem><FormLabel>Event Type</FormLabel><FormControl><Input placeholder="Wedding, Corporate, etc." {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="guestCount" render={({ field }) => (
                        <FormItem><FormLabel>Guest Count</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
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

                    <div className="border-t border-primary/5 pt-8">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                        <Info className="w-5 h-5" /> Select Your Menu
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input placeholder="Search food..." value={foodSearchQuery} onChange={(e) => setFoodSearchQuery(e.target.value)} className="pl-9" />
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="border-primary/10"><SelectValue placeholder="Category" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {getCategories().map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto p-2 custom-scrollbar border rounded-2xl bg-secondary/20">
                        {filteredFoodItems.map(item => {
                          const selected = selectedItems.find(si => si.foodItemId === item.id);
                          return (
                            <div key={item.id} className={cn("flex flex-col p-4 border rounded-2xl transition-all group", selected ? "border-primary bg-primary/5 ring-1 ring-primary shadow-md" : "hover:border-primary/40 bg-card")}>
                              <div className="flex items-center justify-between mb-3">
                                <Badge variant="outline" className={cn("text-[10px] uppercase font-bold", item.type === 'Veg' ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50')}>
                                  {item.type}
                                </Badge>
                                <div className={cn("w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition-colors", selected ? "bg-primary border-primary text-white" : "border-muted-foreground group-hover:border-primary")} onClick={() => handleSelectItem(item, !selected)}>
                                  {selected ? <Check size={14} /> : <Plus size={14} />}
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-sm mb-1 leading-tight">{item.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{item.category}</p>
                              </div>
                              {selected && (
                                <div className="flex items-center justify-between mt-4 bg-white/80 dark:bg-black/20 p-2 rounded-xl border border-primary/10">
                                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></Button>
                                  <span className="text-sm font-bold w-12 text-center">{selected.quantity}</span>
                                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <FormField control={form.control} name="specialRequests" render={({ field }) => (
                      <FormItem><FormLabel>Special Requests</FormLabel><FormControl><Textarea placeholder="Any specific requirements for your menu or event..." className="min-h-[120px] resize-none" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />

                    <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="text-center md:text-left">
                        <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Items Selected</p>
                        <p className="text-2xl font-bold text-primary">{selectedItems.length} items</p>
                      </div>
                      <Button type="submit" size="lg" className="px-16 h-16 text-xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all" disabled={createMutation.isPending}>
                        {createMutation.isPending ? (
                          <div className="flex items-center gap-2"><RefreshCw className="animate-spin" /> Processing...</div>
                        ) : "Submit Booking Request"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
            {bookings.length === 0 ? (
              <Card className="col-span-full py-20 border-dashed">
                <CardContent className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">No Bookings Yet</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">You haven't made any event bookings yet. Start by creating a new one!</p>
                  </div>
                  <Button onClick={() => setActiveTab("form")} variant="outline" className="mt-4">
                    Create New Booking
                  </Button>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id} className="group border-primary/10 hover:border-primary/30 transition-all hover:shadow-lg overflow-hidden">
                  <div className={cn("h-1.5 w-full", 
                    booking.status === 'confirmed' ? 'bg-green-500' : 
                    booking.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
                  )} />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="font-bold uppercase tracking-tighter">
                        {booking.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" /> {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{booking.eventType}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(booking.eventDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1 p-3 bg-secondary/50 rounded-xl border border-primary/5">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Guests</p>
                        <p className="font-bold text-primary">{booking.guestCount}</p>
                      </div>
                      <div className="space-y-1 p-3 bg-secondary/50 rounded-xl border border-primary/5">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total</p>
                        <p className="font-bold text-primary">₹{booking.totalAmount}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground pt-2 border-t border-primary/5">
                      <User className="w-4 h-4" />
                      <span className="truncate">{booking.clientName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>Elite Catering Venue</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
