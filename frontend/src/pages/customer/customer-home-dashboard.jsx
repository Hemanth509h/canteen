import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { Search, Calendar, MapPin, User, Clock, Mail } from "lucide-react";
import { Link } from "wouter";

export default function CustomerHome() {
  const [identifier, setIdentifier] = useState("");
  const [searchIdentifier, setSearchIdentifier] = useState("");

  const { data: bookings, isLoading, isError } = useQuery({
    queryKey: ["/api/bookings/search", searchIdentifier],
    queryFn: async () => {
      if (!searchIdentifier) return [];
      const isEmail = searchIdentifier.includes("@");
      const param = isEmail ? `email=${encodeURIComponent(searchIdentifier)}` : `phone=${encodeURIComponent(searchIdentifier)}`;
      const res = await fetch(`/api/bookings/search?${param}`);
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      
      // Save "login" state in localStorage
      if (json.data && json.data.length > 0) {
        localStorage.setItem("customer_identifier", searchIdentifier);
      }
      return json.data || [];
    },
    enabled: !!searchIdentifier,
  });

  useEffect(() => {
    const savedIdentifier = localStorage.getItem("customer_identifier");
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
      setSearchIdentifier(savedIdentifier);
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-poppins font-bold text-primary">My Bookings</h1>
          <div className="flex gap-2">
            {searchIdentifier && (
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            )}
            <Link href="/">
              <Button variant="ghost">Back to Home</Button>
            </Link>
          </div>
        </div>

        <Card className="p-6 mb-8 border-primary/20 bg-card/50 backdrop-blur-md">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              {identifier.includes("@") ? (
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              ) : (
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              )}
              <Input
                placeholder="Enter your phone number or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="pl-10 h-12 rounded-xl border-primary/20"
              />
            </div>
            <Button type="submit" size="lg" className="rounded-xl px-8 font-bold bg-primary hover:bg-primary/90 text-white">
              <Search className="mr-2 w-5 h-5" />
              Find Bookings
            </Button>
          </form>
        </Card>

        {isLoading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" className="text-primary" />
          </div>
        )}

        {isError && (
          <div className="text-center py-20 text-destructive font-medium">
            Failed to find bookings. Please try again or contact us.
          </div>
        )}

        {!isLoading && searchIdentifier && bookings?.length === 0 && (
          <Card className="p-12 text-center border-dashed border-2">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-xl font-bold mb-2">No Bookings Found</h3>
            <p className="text-muted-foreground">We couldn't find any bookings for {searchIdentifier}.</p>
          </Card>
        )}

        <div className="grid gap-6">
          {bookings?.map((booking) => (
            <Card key={booking.id || booking._id} className="p-6 hover:shadow-xl transition-all border-l-4 border-l-primary group">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize text-xs font-bold px-2 py-0.5 border-primary/30 text-primary">
                      {booking.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">#{booking.id?.slice(-8) || booking._id?.slice(-8)}</span>
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{booking.eventType}</h3>
                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {new Date(booking.eventDate).toLocaleDateString("en-US", { dateStyle: "long" })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      {booking.guestCount} Guests
                    </div>
                    {booking.address && (
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {booking.address}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6">
                  <p className="text-sm text-muted-foreground mb-1 font-medium">Booking ID</p>
                  <p className="text-lg font-mono font-bold text-foreground">{booking.id?.slice(-12) || booking._id?.slice(-12)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
