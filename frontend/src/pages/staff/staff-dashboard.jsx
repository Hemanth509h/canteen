import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut, CalendarDays, MapPin, Clock, ChefHat, CheckCircle2, RefreshCw, CreditCard, IndianRupee, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const STATUS_COLORS = {
  completed: "bg-emerald-500",
  confirmed: "bg-blue-500",
  pending: "bg-amber-500",
  cancelled: "bg-rose-500",
};

export default function StaffDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [staff, setStaff] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const session = localStorage.getItem("staff_session");
    if (!session) {
      setLocation("/staff/login");
      return;
    }
    setStaff(JSON.parse(session));
  }, [setLocation]);

  const { data: assignments = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["/api/staff/assignments"],
    queryFn: async () => {
      const session = JSON.parse(localStorage.getItem("staff_session"));
      if (!session) throw new Error("Not logged in");
      const res = await fetch("/api/staff/assignments", {
        headers: { Authorization: `Bearer ${session.id}` },
      });
      if (!res.ok) throw new Error("Failed to fetch assignments");
      const json = await res.json();
      return json.data || json;
    },
    enabled: !!staff,
    staleTime: 0,
  });

  const handleRefresh = () => {
    refetch();
    toast({ title: "Refreshed", description: "Assignment list updated." });
  };

  const handleLogout = () => {
    localStorage.removeItem("staff_session");
    queryClient.clear();
    setLocation("/staff/login");
  };

  if (!staff) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // An event is "past" if the booking status is "completed" OR the date has already passed
  const upcomingAssignments = assignments
    .filter((a) => {
      if (!a.booking) return false;
      if (a.booking.status === "completed" || a.booking.status === "cancelled") return false;
      return new Date(a.booking.eventDate) >= today;
    })
    .sort((a, b) => new Date(a.booking.eventDate) - new Date(b.booking.eventDate));

  const pastAssignments = assignments
    .filter((a) => {
      if (!a.booking) return false;
      if (a.booking.status === "completed" || a.booking.status === "cancelled") return true;
      return new Date(a.booking.eventDate) < today;
    })
    .sort((a, b) => new Date(b.booking.eventDate) - new Date(a.booking.eventDate));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      <header className="bg-white dark:bg-slate-950 border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <ChefHat size={20} />
            </div>
            <div>
              <h1 className="font-bold leading-none">Staff Portal</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Welcome, {staff.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Link href="/staff/payments">
              <Button variant="outline" size="sm" className="gap-2 border-primary/40 text-primary hover:bg-primary/10">
                <Wallet size={14} />
                <span className="hidden sm:inline">My Payments</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground gap-2">
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <CalendarDays size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingAssignments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{pastAssignments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm col-span-2 sm:col-span-1">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                <IndianRupee size={18} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="text-primary" size={20} />
            <h2 className="text-xl font-bold tracking-tight">Upcoming Assignments</h2>
            {upcomingAssignments.length > 0 && (
              <Badge className="ml-auto">{upcomingAssignments.length}</Badge>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : upcomingAssignments.length === 0 ? (
            <Card className="border-dashed shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted p-4 rounded-full mb-4">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium">You're all caught up!</p>
                <p className="text-sm text-muted-foreground mt-1">No upcoming event assignments.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {upcomingAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} isUpcoming />
              ))}
            </div>
          )}
        </section>

        {/* Past Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-muted-foreground" size={20} />
            <h2 className="text-xl font-bold tracking-tight text-muted-foreground">Past Events</h2>
            {pastAssignments.length > 0 && (
              <Badge variant="secondary" className="ml-auto">{pastAssignments.length}</Badge>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : pastAssignments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No past assignments yet.</p>
          ) : (
            <div className="space-y-3">
              {pastAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function AssignmentCard({ assignment, isUpcoming }) {
  const booking = assignment.booking;
  if (!booking) return null;

  const dateObj = new Date(booking.eventDate);
  const isCompleted = booking.status === "completed";
  const barColor = STATUS_COLORS[booking.status] || "bg-muted";

  return (
    <Card className={`overflow-hidden transition-all ${isUpcoming ? "hover:shadow-md border-primary/20" : "opacity-80"}`}>
      <div className={`h-1.5 ${barColor}`} />
      <CardHeader className="pb-3 pt-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{booking.eventType}</CardTitle>
            <CardDescription className="font-medium text-foreground mt-1 truncate">{booking.clientName}</CardDescription>
          </div>
          <div className="text-right shrink-0 bg-muted/50 rounded-lg p-2 text-center min-w-16">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              {format(dateObj, "EEE")}
            </p>
            <p className="text-lg font-bold leading-tight">{format(dateObj, "d")}</p>
            <p className="text-xs text-muted-foreground">{format(dateObj, "MMM yyyy")}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
          <MapPin size={14} className="shrink-0 text-primary/70" />
          <span className="truncate">{booking.eventLocation || "Location pending"}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/50 gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant={isCompleted ? "default" : "secondary"}
              className={`capitalize shadow-none text-xs ${isCompleted ? "bg-emerald-600 hover:bg-emerald-600" : ""}`}
            >
              {booking.status}
            </Badge>
            <span className="text-xs text-muted-foreground">{booking.guestCount} guests</span>
          </div>
          {booking.advancePaymentStatus !== "paid" && isUpcoming && (
            <Link href={`/staff/payment/${booking.id}`}>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7 border-primary/40 text-primary hover:bg-primary/10">
                <CreditCard size={12} />
                Payment
              </Button>
            </Link>
          )}
          {isCompleted && booking.finalPaymentStatus !== "paid" && (
            <Link href={`/staff/payment/${booking.id}`}>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7 border-emerald-500/40 text-emerald-600 hover:bg-emerald-50">
                <CreditCard size={12} />
                Final Payment
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
