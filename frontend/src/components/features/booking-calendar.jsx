import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import "@/schema";
import { cn } from "@/lib/utils";

interface BookingCalendarProps {
  bookingsventBooking[];
  onSelectBooking?: (bookingventBooking) => void;
}

const statusColorsecord<string, string> = {
  pending: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
  confirmed: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  completed: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
  cancelled: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
};

export function BookingCalendar({ bookings, onSelectBooking }ookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOfWeek = useMemo(() => {
    return startOfMonth(currentMonth).getDay();
  }, [currentMonth]);

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, EventBooking[]>();
    bookings.forEach((booking) => {
      const dateKey = booking.eventDate.split("T")[0];
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)?.push(booking);
    });
    return map;
  }, [bookings]);

  const selectedDateBookings = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return bookingsByDate.get(dateKey) || [];
  }, [selectedDate, bookingsByDate]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Booking Calendar</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            data-testid="button-prev-month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            data-testid="button-next-month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ lengthirstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayBookings = bookingsByDate.get(dateKey) || [];
            const hasBookings = dayBookings.length > 0;
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "aspect-square p-1 rounded-md text-sm relative transition-colors",
                  "hover-elevate active-elevate-2",
                  !isSameMonth(day, currentMonth) && "text-muted-foreground/50",
                  isToday(day) && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                  isSelected && "bg-primary text-primary-foreground",
                  hasBookings && !isSelected && "bg-primary/10"
                )}
                data-testid={`calendar-day-${dateKey}`}
              >
                <span className="font-medium">{format(day, "d")}</span>
                {hasBookings && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayBookings.slice(0, 3).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isSelected ? "bg-primary-foreground" : "bg-primary"
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <div className="mt-4 pt-4 border-t animate-in fade-in duration-300">
            <h4 className="text-sm font-medium mb-3">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </h4>
            {selectedDateBookings.length > 0 ? (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {selectedDateBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className={cn(
                      "p-3 rounded-md border cursor-pointer transition-colors animate-in fade-in duration-300",
                      "hover-elevate"
                    )}
                    onClick={() => onSelectBooking?.(booking)}
                    data-testid={`calendar-booking-${booking.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{booking.clientName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {booking.eventType} - {booking.guestCount} guests
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 text-xs", statusColors[booking.status])}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No bookings on this date
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
