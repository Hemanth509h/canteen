import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import {
  Search, Calendar, MapPin, User, Clock, Mail, Utensils,
  ChevronDown, ChevronUp, ArrowLeft, Sparkles, BookOpen, Phone
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const statusColors = {
  pending:   "text-amber-400 border-amber-400/30 bg-amber-400/10",
  confirmed: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  completed: "text-sky-400 border-sky-400/30 bg-sky-400/10",
  cancelled: "text-rose-400 border-rose-400/30 bg-rose-400/10",
};

const BookingMenu = ({ bookingId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ["/api/bookings", bookingId, "items"],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${bookingId}/items`);
      if (!res.ok) return [];
      const json = await res.json();
      const items = json.data || json;
      return Promise.all(
        items.map(async (item) => {
          const foodRes = await fetch(`/api/food-items`);
          const foodJson = await foodRes.json();
          const foodItems = foodJson.data || foodJson;
          const foodItem = foodItems.find((f) => f.id === item.foodItemId);
          return { ...item, foodItem };
        })
      );
    },
    enabled: isOpen,
  });

  return (
    <div className="mt-5 pt-5 border-t border-border/40">
      <button
        className="w-full flex items-center justify-between text-sm font-jakarta font-semibold text-primary hover:text-primary/80 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2">
          <Utensils className="w-4 h-4" />
          View Selected Menu
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <LoadingSpinner size="sm" />
            </div>
          ) : items?.length > 0 ? (
            items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-4 py-3 bg-secondary/30 rounded-xl border border-border/30"
              >
                <div>
                  <p className="font-jakarta font-semibold text-sm">{item.foodItem?.name || "Unknown Item"}</p>
                  <p className="text-xs text-muted-foreground font-jakarta">{item.foodItem?.category}</p>
                </div>
                <Badge variant="outline" className="text-xs font-jakarta font-bold border-primary/30 text-primary">
                  {item.quantity} Guests
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-center text-muted-foreground italic py-3 font-jakarta">
              No menu items selected yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default function CustomerHomeDashboard() {
  const [identifier, setIdentifier] = useState("");
  const [searchIdentifier, setSearchIdentifier] = useState("");

  const { data: bookings, isLoading, isError } = useQuery({
    queryKey: ["/api/bookings/search", searchIdentifier],
    queryFn: async () => {
      if (!searchIdentifier) return [];
      const isEmail = searchIdentifier.includes("@");
      const param = isEmail
        ? `email=${encodeURIComponent(searchIdentifier)}`
        : `phone=${encodeURIComponent(searchIdentifier)}`;
      const res = await fetch(`/api/bookings/search?${param}`);
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        localStorage.setItem("customer_identifier", searchIdentifier);
      }
      return json.data || [];
    },
    enabled: !!searchIdentifier,
  });

  useEffect(() => {
    const saved = localStorage.getItem("customer_identifier");
    if (saved) {
      setIdentifier(saved);
      setSearchIdentifier(saved);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("customer_identifier");
    setIdentifier("");
    setSearchIdentifier("");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchIdentifier(identifier);
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/6 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Top nav */}
      <header className="relative z-10 border-b border-border/40 bg-card/60 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-jakarta text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-playfair font-bold text-base">My Bookings</span>
          </div>
          {searchIdentifier && (
            <button
              onClick={handleLogout}
              className="text-xs font-jakarta font-semibold text-muted-foreground hover:text-destructive transition-colors"
            >
              Sign Out
            </button>
          )}
          {!searchIdentifier && <div className="w-20" />}
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-14">
        {/* Page heading */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-primary/40" />
            <span className="text-primary text-xs uppercase tracking-[0.25em] font-jakarta font-semibold">Booking Portal</span>
            <div className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-primary/40" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-playfair font-bold mb-3">Track Your Bookings</h1>
          <p className="text-muted-foreground font-jakarta max-w-md mx-auto text-base leading-relaxed">
            Enter your phone number or email address to view all your event bookings.
          </p>
        </div>

        {/* Search card */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 mb-10 shadow-gold">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              {identifier.includes("@") ? (
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              ) : (
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              )}
              <Input
                placeholder="Phone number or email address"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="pl-11 h-13 rounded-xl border-border/60 bg-background font-jakarta focus:ring-2 focus:ring-primary/20 h-12"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="rounded-xl px-8 h-12 font-jakarta font-bold bg-primary text-primary-foreground shadow-gold hover:shadow-gold-lg hover:bg-primary/90 transition-all"
            >
              <Search className="mr-2 w-4 h-4" />
              Find Bookings
            </Button>
          </form>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <LoadingSpinner size="lg" className="text-primary" />
            <p className="text-muted-foreground font-jakarta text-sm italic">Searching for your bookings...</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-20">
            <p className="text-destructive font-jakarta font-medium">Failed to find bookings. Please try again or contact us.</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && searchIdentifier && bookings?.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-border/50 rounded-2xl">
            <BookOpen className="w-14 h-14 mx-auto mb-4 text-muted-foreground/25" />
            <h3 className="text-xl font-playfair font-bold mb-2">No Bookings Found</h3>
            <p className="text-muted-foreground font-jakarta text-sm">
              We couldn't find any bookings for <span className="text-foreground font-semibold">{searchIdentifier}</span>.
            </p>
            <Link href="/">
              <Button className="mt-6 rounded-xl font-jakarta font-bold bg-primary text-primary-foreground shadow-gold hover:bg-primary/90">
                Browse Our Menu
              </Button>
            </Link>
          </div>
        )}

        {/* Booking cards */}
        {!isLoading && bookings && bookings.length > 0 && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground font-jakarta mb-2">
              Found <span className="text-foreground font-semibold">{bookings.length}</span> booking{bookings.length !== 1 ? "s" : ""}
            </p>
            {bookings.map((booking) => {
              const id = booking.id || booking._id;
              const statusKey = (booking.status || "pending").toLowerCase();
              return (
                <div
                  key={id}
                  className="bg-card border border-border/50 rounded-2xl p-6 sm:p-8 hover:border-primary/25 hover:shadow-gold transition-all duration-300 group"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    {/* Left: details */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] uppercase font-jakarta font-bold tracking-wider px-3 py-1 rounded-full",
                            statusColors[statusKey] || statusColors.pending
                          )}
                        >
                          {booking.status}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground font-mono bg-secondary/40 px-2 py-0.5 rounded-md">
                          #{id?.slice(-8)}
                        </span>
                      </div>

                      <h3 className="text-xl font-playfair font-bold group-hover:text-primary transition-colors">
                        {booking.eventType}
                      </h3>

                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                          <Calendar className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-jakarta">
                            {new Date(booking.eventDate).toLocaleDateString("en-US", { dateStyle: "long" })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                          <User className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-jakarta">{booking.guestCount} Guests</span>
                        </div>
                        {booking.address && (
                          <div className="flex items-center gap-2.5 text-muted-foreground sm:col-span-2">
                            <MapPin className="w-4 h-4 text-primary shrink-0" />
                            <span className="font-jakarta">{booking.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: booking ID block */}
                    <div className="flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-border/30 pt-5 md:pt-0 md:pl-8 min-w-[130px]">
                      <p className="text-[10px] uppercase tracking-widest font-jakarta font-semibold text-muted-foreground mb-1">
                        Booking ID
                      </p>
                      <p className="text-base font-mono font-bold text-foreground">{id?.slice(-12)}</p>
                    </div>
                  </div>

                  <BookingMenu bookingId={id} />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
