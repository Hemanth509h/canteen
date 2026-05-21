import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, X, User, Phone, Send, Loader2, Calendar, Mail, MapPin, Tag, UtensilsCrossed } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import branding from "@/lib/branding.json";
import { sendBookingEmails } from "@/lib/resend-email";

export function CartDrawer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { cartItems, removeFromCart, updateQuantity, totalItems, clearCart, globalGuests, updateGlobalGuests, addToCart } = useCart();
  const [customItemName, setCustomItemName] = useState("");
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({ 
    name: "", 
    phone: "", 
    email: "", 
    eventDate: "", 
    eventType: "Wedding",
    mealType: "Lunch",
    eventLocation: "",
    specialRequests: "" 
  });
  const hasContactMethod = Boolean(customerDetails.phone.trim() || customerDetails.email.trim());

  const companyInfo = branding;

  useEffect(() => {
    const savedIdentifier = localStorage.getItem("customer_identifier");
    if (savedIdentifier) {
      const isEmail = savedIdentifier.includes("@");
      setCustomerDetails(prev => ({
        ...prev,
        [isEmail ? "email" : "phone"]: savedIdentifier
      }));
    }
  }, [showContactDialog]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContact = async () => {
    if (!customerDetails.name || !hasContactMethod || !customerDetails.eventDate) return;

    setIsSubmitting(true);

    const booking = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      clientName: customerDetails.name,
      eventType: customerDetails.eventType,
      eventDate: customerDetails.eventDate,
      guestCount: globalGuests,
      mealType: customerDetails.mealType,
      eventLocation: customerDetails.eventLocation,
      contactEmail: customerDetails.email,
      contactPhone: customerDetails.phone,
      specialRequests: customerDetails.specialRequests,
      companyName: companyInfo?.companyName || companyInfo?.name || "Sai Caterers",
      adminEmail: import.meta.env.VITE_ADMIN_EMAIL || companyInfo?.contactEmail || companyInfo?.email,
      items: cartItems.map(item => ({
        foodItemId: item.id,
        quantity: item.quantity,
        name: item.name,
        category: item.category || "Custom Request"
      }))
    };

    try {
      const { customerEmailSuccess } = await sendBookingEmails(booking, window.location.origin);

      if (customerDetails.email.trim()) {
        localStorage.setItem("customer_identifier", customerDetails.email.trim().toLowerCase());
      } else if (customerDetails.phone.trim()) {
        localStorage.setItem("customer_identifier", customerDetails.phone.trim());
      }

      setShowContactDialog(false);
      clearCart();
      setLocation("/booking-success");
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Something went wrong while sending your request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCustomItem = () => {
    if (!customItemName.trim()) return;
    addToCart({
      id: `custom-${Date.now()}`,
      name: customItemName.trim(),
      category: "Custom Request",
      price: 0,
      image: "https://images.unsplash.com/photo-1547573854-74d2a71d0826?q=80&w=800&auto=format&fit=crop"
    });
    setCustomItemName("");
  };

  const isLoggedIn = !!localStorage.getItem("customer_identifier");

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button id="cart-drawer-button" variant="outline" size="icon" className="relative rounded-full w-12 h-12 bg-white text-black shadow-2xl hover:scale-110 transition-transform duration-300 border-none flex items-center justify-center">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-primary text-white border-2 border-background">
                {totalItems}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader className="pb-4">
            <div className="flex flex-col gap-4">
              <SheetTitle className="flex items-center gap-2 text-2xl font-poppins font-bold">
                <ShoppingCart className="text-primary" />
                Your Cart
              </SheetTitle>
              <SheetDescription className="sr-only">
                Review your items and complete your booking request.
              </SheetDescription>

              {cartItems.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                  <span className="text-sm font-medium whitespace-nowrap">No. of Guests:</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg border-primary/20"
                      onClick={() => updateGlobalGuests(Math.max(1, globalGuests - 1))}
                    >
                      <span className="text-lg font-bold">-</span>
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={globalGuests}
                      onChange={(e) => updateGlobalGuests(parseInt(e.target.value) || 1)}
                      className="h-9 w-16 text-center font-bold bg-background border-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg border-primary/20"
                      onClick={() => updateGlobalGuests(globalGuests + 1)}
                    >
                      <span className="text-lg font-bold">+</span>
                    </Button>
                  </div>
                  <span className="text-xs text-muted-foreground italic">(Applies to all)</span>
                </div>
              )}
            </div>
          </SheetHeader>

          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart size={40} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Cart is empty</h3>
              <p className="text-muted-foreground mb-6">Add some delicious items from our menu to get started!</p>
              <SheetTrigger asChild>
                <Button
                  className="rounded-xl px-8 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg"
                  onClick={() => {
                    const menu = document.getElementById('menu');
                    if (menu) menu.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore Menus
                </Button>
              </SheetTrigger>
              <div className="w-full mt-4 bg-background p-4 rounded-xl border border-primary/20">
                <p className="text-sm font-bold mb-2">Want something not on the menu?</p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="E.g., Vegan Pasta..." 
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomItem()}
                    className="h-10 border-primary/20 focus-visible:ring-primary/20"
                  />
                  <Button onClick={handleAddCustomItem} className="h-10 px-4 bg-primary hover:bg-primary/90 font-bold">
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-6 py-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-bold text-muted-foreground">
                        {String(item.name || "M").slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{item.category}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Guests:</span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 rounded-md border-primary/20"
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              >
                                <span className="text-sm font-bold">-</span>
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                className="h-7 w-12 text-center text-xs font-bold bg-secondary/30 border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 rounded-md border-primary/20"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <span className="text-sm font-bold">+</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="pt-4 px-2">
                <div className="bg-secondary/30 p-3 rounded-xl border border-primary/10">
                  <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Add Custom Request</p>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Dish name not on menu..." 
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomItem()}
                      className="h-9 text-sm border-primary/20 bg-background"
                    />
                    <Button onClick={handleAddCustomItem} size="sm" className="h-9 px-3 bg-primary hover:bg-primary/90 font-bold">
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <Separator />
                <div className="flex justify-between items-center px-2 text-sm text-muted-foreground">
                  <span>Unique Items</span>
                  <span className="font-bold text-foreground">{totalItems}</span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-muted-foreground font-medium">Total Guests</span>
                  <span className="font-bold text-lg">{globalGuests}</span>
                </div>
                <SheetFooter className="flex-col sm:flex-col gap-3">
                  <Button
                    className="w-full h-12 text-lg font-bold rounded-xl bg-[#22c55e] hover:bg-[#16a34a]"
                    onClick={() => setShowContactDialog(true)}
                  >
                    Proceed to Contact
                  </Button>



                  <div className="pt-2 pb-2 text-center space-y-2">
                    <p className="text-xs text-muted-foreground italic">Need help? Contact us directly:</p>
                    {(branding.phone || branding.contactPhone || branding.email || branding.contactEmail) && (
                      <div className="flex items-center justify-center gap-4 text-sm">
                        {(branding.phone || branding.contactPhone) && (
                          <a href={`tel:${String(branding.phone || branding.contactPhone).replace(/\D/g, "")}`} className="text-primary font-bold hover:underline">Call</a>
                        )}
                        {(branding.phone || branding.contactPhone) && (branding.email || branding.contactEmail) && (
                          <span className="text-muted-foreground/30">|</span>
                        )}
                        {(branding.email || branding.contactEmail) && (
                          <a href={`mailto:${branding.email || branding.contactEmail}`} className="text-primary font-bold hover:underline">Email</a>
                        )}
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" className="w-full text-muted-foreground" onClick={clearCart}>
                    <Trash2 size={16} className="mr-2" />
                    Clear Cart
                  </Button>
                </SheetFooter>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-md rounded-[1.5rem] p-6 bg-card border-none shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-poppins font-bold text-primary flex items-center gap-2">
              <Send className="w-6 h-6" />
              Complete Your Booking
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Please provide your details so we can assist you with your booking. Phone or email is enough.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2 px-1">
                  <User size={16} className="text-primary" />
                  Client Name
                </label>
                <Input
                  placeholder="Enter your full name"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                  className="rounded-xl h-12 border-primary/20 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2 px-1">
                  <Phone size={16} className="text-primary" />
                  Mobile Number
                </label>
                <Input
                  placeholder="Enter your mobile number"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                  className="rounded-xl h-12 border-primary/20 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2 px-1">
                    <Tag size={16} className="text-primary" />
                    Event Type
                  </label>
                  <Select 
                    value={customerDetails.eventType} 
                    onValueChange={(v) => setCustomerDetails(prev => ({ ...prev, eventType: v }))}
                  >
                    <SelectTrigger className="rounded-xl h-12 border-primary/20 focus:ring-primary/20">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wedding">Wedding</SelectItem>
                      <SelectItem value="Corporate Event">Corporate Event</SelectItem>
                      <SelectItem value="Birthday Party">Birthday Party</SelectItem>
                      <SelectItem value="Anniversary">Anniversary</SelectItem>
                      <SelectItem value="Engagement">Engagement</SelectItem>
                      <SelectItem value="Conference">Conference</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2 px-1">
                    <UtensilsCrossed size={16} className="text-primary" />
                    Meal Type
                  </label>
                  <Select 
                    value={customerDetails.mealType} 
                    onValueChange={(v) => setCustomerDetails(prev => ({ ...prev, mealType: v }))}
                  >
                    <SelectTrigger className="rounded-xl h-12 border-primary/20 focus:ring-primary/20">
                      <SelectValue placeholder="Select meal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                      <SelectItem value="Lunch">Lunch</SelectItem>
                      <SelectItem value="Dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2 px-1">
                    <Calendar size={16} className="text-primary" />
                    Event Date
                  </label>
                  <Input
                    type="date"
                    value={customerDetails.eventDate}
                    onChange={(e) => setCustomerDetails(prev => ({ ...prev, eventDate: e.target.value }))}
                    className="rounded-xl h-12 border-primary/20 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2 px-1">
                  <MapPin size={16} className="text-primary" />
                  Event Location
                </label>
                <Input
                  placeholder="Where is the event taking place?"
                  value={customerDetails.eventLocation}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, eventLocation: e.target.value }))}
                  className="rounded-xl h-12 border-primary/20 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2 px-1">
                  <Mail size={16} className="text-primary" />
                  Email Address
                </label>
                <Input
                  placeholder="Enter your email address"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                  className="rounded-xl h-12 border-primary/20 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 px-1">
                <Send size={16} className="text-primary" />
                Other Requests
              </label>
              <Textarea
                placeholder="Any special requests or details?"
                value={customerDetails.specialRequests}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, specialRequests: e.target.value }))}
                className="rounded-xl min-h-[80px] border-primary/20 focus:ring-primary/20"
              />
            </div>
          </div>

          <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowContactDialog(false)}
              className="w-full h-12 rounded-xl border-primary/20"
            >
              Cancel
            </Button>
            <Button
              disabled={!customerDetails.name || !hasContactMethod || !customerDetails.eventDate || isSubmitting}
              onClick={handleContact}
              className="w-full h-12 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Confirm Booking Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
