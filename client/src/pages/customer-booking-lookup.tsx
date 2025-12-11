import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Search, Calendar, Users, Mail, Phone, FileText, CheckCircle, Clock, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import type { EventBooking } from "@shared/schema";

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bgColor: string; label: string }> = {
  pending: {
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    label: "Pending Confirmation",
  },
  confirmed: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10",
    label: "Confirmed",
  },
  completed: {
    icon: CheckCircle,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    label: "Completed",
  },
  cancelled: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10",
    label: "Cancelled",
  },
};

export default function CustomerBookingLookup() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"email" | "phone">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState<EventBooking | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({ title: "Required", description: "Please enter your email or phone number", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    setBooking(null);

    try {
      const params = new URLSearchParams();
      if (searchType === "email") {
        params.set("email", searchQuery.trim());
      } else {
        params.set("phone", searchQuery.replace(/\D/g, ""));
      }

      const response = await fetch(`/api/bookings/lookup?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setBooking(data);
        } else {
          setNotFound(true);
        }
      } else if (response.status === 404) {
        setNotFound(true);
      } else {
        throw new Error("Search failed");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to search for booking", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const StatusIcon = booking ? statusConfig[booking.status]?.icon || Clock : Clock;

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="container max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/">
            <Button variant="ghost" className="mb-6" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
              Check Your Booking
            </h1>
            <p className="text-muted-foreground">
              Enter your email or phone number to view your booking status
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find Your Booking
              </CardTitle>
              <CardDescription>
                We'll look up your most recent booking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={searchType === "email" ? "default" : "outline"}
                  onClick={() => setSearchType("email")}
                  className="flex-1"
                  data-testid="button-search-email"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button
                  variant={searchType === "phone" ? "default" : "outline"}
                  onClick={() => setSearchType("phone")}
                  className="flex-1"
                  data-testid="button-search-phone"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Phone
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">
                  {searchType === "email" ? "Email Address" : "Phone Number"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    type={searchType === "email" ? "email" : "tel"}
                    placeholder={searchType === "email" ? "your@email.com" : "9876543210"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    data-testid="input-booking-search"
                  />
                  <Button onClick={handleSearch} disabled={isLoading} data-testid="button-search-booking">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <Card className="border-destructive/50">
                <CardContent className="pt-6 text-center">
                  <XCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Booking Found</h3>
                  <p className="text-muted-foreground text-sm">
                    We couldn't find a booking with this {searchType}. Please check and try again, 
                    or contact us for assistance.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {booking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <CardTitle>Booking Details</CardTitle>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-sm px-3 py-1",
                        statusConfig[booking.status]?.bgColor,
                        statusConfig[booking.status]?.color
                      )}
                    >
                      <StatusIcon className="w-4 h-4 mr-2" />
                      {statusConfig[booking.status]?.label || booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div
                    className={cn(
                      "p-4 rounded-md",
                      statusConfig[booking.status]?.bgColor
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon className={cn("w-8 h-8", statusConfig[booking.status]?.color)} />
                      <div>
                        <p className={cn("font-semibold", statusConfig[booking.status]?.color)}>
                          {statusConfig[booking.status]?.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.status === "pending" && "Your booking is awaiting confirmation from our team."}
                          {booking.status === "confirmed" && "Your event is confirmed! We look forward to serving you."}
                          {booking.status === "completed" && "Thank you for choosing us! We hope you enjoyed our service."}
                          {booking.status === "cancelled" && "This booking has been cancelled. Contact us if you have questions."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Client Name</p>
                      <p className="font-medium">{booking.clientName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Event Type</p>
                      <p className="font-medium">{booking.eventType}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Event Date
                      </p>
                      <p className="font-medium">
                        {new Date(booking.eventDate).toLocaleDateString("en-IN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" /> Guest Count
                      </p>
                      <p className="font-medium">{booking.guestCount} guests</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Payment Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price per plate</span>
                        <span className="font-medium">₹{booking.pricePerPlate.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total amount</span>
                        <span className="font-semibold text-primary">
                          ₹{(booking.guestCount * booking.pricePerPlate).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant={booking.advancePaymentStatus === "paid" ? "default" : "secondary"}>
                        Advance: {booking.advancePaymentStatus === "paid" ? "Paid" : "Pending"}
                      </Badge>
                      <Badge variant={booking.finalPaymentStatus === "paid" ? "default" : "secondary"}>
                        Final: {booking.finalPaymentStatus === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Special Requests
                        </h4>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                          {booking.specialRequests}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
