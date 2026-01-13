import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, X, User, Phone, Send, Loader2, Calendar } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";

export function CartDrawer() {
  const { toast } = useToast();
  const { cartItems, removeFromCart, updateQuantity, totalItems, clearCart, globalGuests, updateGlobalGuests } = useCart();
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({ name: "", phone: "", eventDate: "", specialRequests: "" });

  const { data: companyInfo } = useQuery({
    queryKey: ["/api/company-info"],
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      const json = await response.json();
      const booking = json.data || json;
      const bookingId = booking.id || booking._id;

      if (cartItems.length > 0 && bookingId) {
        const items = cartItems.map(item => ({
          bookingId: bookingId,
          foodItemId: item.id,
          quantity: item.quantity
        }));
        await apiRequest("POST", `/api/bookings/${bookingId}/items`, items);
      }
      return json;
    },
    onSuccess: () => {
      toast({
        title: "Booking Request Sent",
        description: "Your details have been shared with our admin. Initiating call...",
      });
      setShowContactDialog(false);
      clearCart();
      
      // Navigate to call using the company phone number or a fallback
      const phoneToCall = companyInfo?.phoneNumber || "1234567890";
      window.location.href = `tel:${phoneToCall}`;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send booking request. Please try calling us.",
        variant: "destructive",
      });
    }
  });

  const handleContact = () => {
    if (!customerDetails.name || !customerDetails.phone || !customerDetails.eventDate) return;
    
    // Create the booking record in the database
    const bookingData = {
      clientName: customerDetails.name,
      contactPhone: customerDetails.phone,
      contactEmail: "customer@example.com", // Placeholder since we don't ask for it
      eventType: "Inquiry from Website",
      eventDate: customerDetails.eventDate,
      guestCount: globalGuests || 1,
      pricePerPlate: 0,
      servingBoysNeeded: 0,
      specialRequests: customerDetails.specialRequests || "",
      status: "pending"
    };

    bookingMutation.mutate(bookingData);
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative rounded-full w-12 h-12 bg-background/50 backdrop-blur-md border-primary/20 hover:bg-primary hover:text-white transition-all duration-300">
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
              <p className="text-muted-foreground">Add some delicious items from our menu to get started!</p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-6 py-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="h-20 w-20 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
                        <img 
                          src={item.imageUrl || "https://images.unsplash.com/photo-1547573854-74d2a71d0826?q=80&w=200&auto=format&fit=crop"} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
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
              
              <div className="pt-6 space-y-4">
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
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <a href="tel:1234567890" className="text-primary font-bold hover:underline">Call</a>
                      <span className="text-muted-foreground/30">|</span>
                      <a href="mailto:events@elite-catering.com" className="text-primary font-bold hover:underline">Email</a>
                    </div>
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
              Please provide your details so we can assist you with your booking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 px-1">
                <User size={16} className="text-primary" />
                Your Name
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
                Phone Number
              </label>
              <Input
                placeholder="Enter your phone number"
                value={customerDetails.phone}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
                className="rounded-xl h-12 border-primary/20 focus:ring-primary/20"
              />
            </div>
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

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2 px-1">
                <Send size={16} className="text-primary" />
                Other Requests
              </label>
              <Input
                placeholder="Any special requests or details?"
                value={customerDetails.specialRequests}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, specialRequests: e.target.value }))}
                className="rounded-xl h-12 border-primary/20 focus:ring-primary/20"
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
              disabled={!customerDetails.name || !customerDetails.phone || !customerDetails.eventDate || bookingMutation.isPending}
              onClick={handleContact}
              className="w-full h-12 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold"
            >
              {bookingMutation.isPending ? (
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
