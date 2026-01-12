import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function CartDrawer() {
  const { cartItems, removeFromCart, updateQuantity, totalItems, clearCart } = useCart();

  return (
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
          <SheetTitle className="flex items-center gap-2 text-2xl font-poppins font-bold">
            <ShoppingCart className="text-primary" />
            Your Cart
          </SheetTitle>
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
                        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-md hover:bg-background"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus size={12} />
                          </Button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-md hover:bg-background"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="pt-6 space-y-4">
              <Separator />
              <div className="flex justify-between items-center px-2">
                <span className="text-muted-foreground font-medium">Total Items</span>
                <span className="font-bold text-lg">{totalItems}</span>
              </div>
              <SheetFooter className="flex-col sm:flex-col gap-3">
                <Button className="w-full h-12 text-lg font-bold rounded-xl bg-[#22c55e] hover:bg-[#16a34a]" onClick={() => alert('Order feature coming soon!')}>
                  Proceed to Order
                </Button>
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
  );
}
