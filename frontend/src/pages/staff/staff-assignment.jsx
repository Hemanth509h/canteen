import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Calendar, Users, MapPin } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function StaffAssignment() {
  const { token } = useParams();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/staff-requests", token],
    enabled: !!token,
  });
  
  const currentStatus = data?.request.status ?? 'pending';
  const hasResponded = currentStatus === 'accepted' || currentStatus === 'rejected';

  const updateMutation = useMutation({
    mutationFn: async (status) => {
      const response = await apiRequest("PATCH", `/api/staff-requests/${token}`, { status });
      return response.json();
    },
    onSuccess: async (responseData) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/staff-requests", token] });
      if (responseData.status === "accepted") {
        toast({
          title: "Accepted!",
          description: "You've been assigned to this event. Thank you!",
        });
      } else {
        toast({
          title: "Rejected",
          description: "You've rejected this assignment request.",
        });
      }
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "Failed to update your response. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Link</CardTitle>
            <CardDescription>
            This assignment link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { request, booking, staff } = data;
  const eventDate = new Date(booking.eventDate);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-2xl">Event Assignment Request</CardTitle>
          <CardDescription>
            {hasResponded ? "Your response has been recorded." : "Please review the event details below and accept or reject this assignment."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Staff Info */}
          <div className="border-b pb-4">
            <p className="text-sm text-muted-foreground mb-2">Assigned to:</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary text-lg">{staff.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-semibold text-lg">{staff.name}</p>
                <p className="text-sm text-muted-foreground">{staff.role}</p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Event Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">{eventDate.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-semibold">{booking.guestCount} people</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 sm:col-span-2">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Event Type</p>
                  <p className="font-semibold">{booking.eventType}</p>
                </div>
              </div>
            </div>

            {booking.clientName && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Client Name</p>
                <p className="font-semibold">{booking.clientName}</p>
              </div>
            )}

            {booking.specialRequests && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Special Requests</p>
                <p className="font-semibold">{booking.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Status Badge */}
          {hasResponded && (
            <div className={`p-4 rounded-lg border ${currentStatus === 'accepted' ? 'bg-primary/10 border-primary/20' : 'bg-muted border-muted-foreground/20'}`}>
              <div className="flex items-center gap-2">
                {currentStatus === 'accepted' ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className={`font-semibold ${currentStatus === 'accepted' ? 'text-primary' : 'text-muted-foreground'}`}>Response Recorded</p>
                  <p className={`text-sm ${currentStatus === 'accepted' ? 'text-primary/80' : 'text-muted-foreground'}`}>
                    {currentStatus === "accepted"
                      ? "You've accepted this assignment. Thank you!"
                      : "You've rejected this assignment."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!hasResponded && (
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => updateMutation.mutate("rejected")}
                disabled={updateMutation.isPending}
                className="flex-1"
                data-testid="button-reject-assignment"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => updateMutation.mutate("accepted")}
                disabled={updateMutation.isPending}
                className="flex-1"
                data-testid="button-accept-assignment"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? "Processing..." : "Accept"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
