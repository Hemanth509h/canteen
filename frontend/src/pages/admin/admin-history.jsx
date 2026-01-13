import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Calendar, User, IndianRupee, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/features/loading-spinner";

export default function AdminHistory() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["/api/bookings"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const completedBookings = bookings?.filter(b => b.status === "completed") || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="w-8 h-8 text-primary" />
            Booking History
          </h1>
          <p className="text-muted-foreground mt-1">
            View all completed past events and their details.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {completedBookings.length === 0 ? (
          <Card className="border-dashed py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No completed bookings found</h3>
              <p className="text-muted-foreground max-w-sm">
                Once a booking is marked as "Completed" in the bookings manager, it will appear here in the permanent history record.
              </p>
            </CardContent>
          </Card>
        ) : (
          completedBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="border-l-4 border-green-500 h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                          Completed
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">#{booking.id?.slice(-8)}</span>
                      </div>
                      <CardTitle className="text-xl">{booking.clientName}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(booking.eventDate), "PPP")}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                      <p className="text-2xl font-bold text-primary flex items-center justify-end">
                        <IndianRupee className="w-5 h-5" />
                        {booking.totalAmount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border/50">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Event Type
                      </p>
                      <p className="font-semibold">{booking.eventType}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" /> Guest Count
                      </p>
                      <p className="font-semibold">{booking.guestCount} People</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Advance Status
                      </p>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {booking.advancePaymentStatus === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Final Status
                      </p>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {booking.finalPaymentStatus === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col md:flex-row gap-4 justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Contact Details</p>
                      <p className="text-sm">{booking.contactEmail} | {booking.contactPhone}</p>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      Completed on {format(new Date(booking.createdAt), "PPP")}
                    </p>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
