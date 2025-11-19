import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EventBooking, FoodItem, BookingItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Calendar } from "lucide-react";

interface BookingWithItems extends EventBooking {
  items: (BookingItem & { foodItem: FoodItem })[];
}

type GroupedBookings = Record<string, BookingWithItems[]>;

export default function ChefPrintout() {
  const [selectedDate, setSelectedDate] = useState<string>("");

  const { data: groupedBookings, isLoading } = useQuery<GroupedBookings>({
    queryKey: ["/api/chef-printout"],
  });

  const dates = groupedBookings 
    ? Object.keys(groupedBookings).filter(date => date && date.trim() !== '').sort() 
    : [];
  const activeDate = selectedDate || dates[0] || "";
  const bookingsForDate = activeDate && groupedBookings ? groupedBookings[activeDate] || [] : [];

  const combinedItems: Record<string, { 
    name: string; 
    category: string; 
    totalQuantity: number;
    members: number;
  }> = {};

  let totalMembers = 0;

  bookingsForDate.forEach(booking => {
    totalMembers += booking.guestCount;
    
    booking.items.forEach(item => {
      if (combinedItems[item.foodItemId]) {
        combinedItems[item.foodItemId].totalQuantity += item.quantity;
      } else {
        combinedItems[item.foodItemId] = {
          name: item.foodItem?.name || "Unknown Item",
          category: item.foodItem?.category || "Unknown",
          totalQuantity: item.quantity,
          members: booking.guestCount
        };
      }
    });
  });

  const combinedItemsArray = Object.entries(combinedItems).map(([id, data]) => ({
    id,
    ...data
  }));

  const groupedByCategory: Record<string, typeof combinedItemsArray> = {};
  combinedItemsArray.forEach(item => {
    if (!groupedByCategory[item.category]) {
      groupedByCategory[item.category] = [];
    }
    groupedByCategory[item.category].push(item);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-page {
            max-width: none !important;
            margin: 0 !important;
            padding: 0.5in !important;
          }
          .print-header {
            background: none !important;
            border: none !important;
            padding-bottom: 1rem !important;
          }
        }
        @page {
          margin: 0.5in;
        }
      `}</style>

      <div className="print-page max-w-6xl mx-auto p-6 space-y-6">
        <Card className="print-header">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl">Chef Preparation Sheet</CardTitle>
            <p className="text-muted-foreground">Event Menu Planning & Preparation Guide</p>
          </CardHeader>
        </Card>

        {dates.length > 0 && (
          <div className="no-print flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={activeDate} onValueChange={setSelectedDate}>
                <SelectTrigger className="w-[200px]" data-testid="select-date">
                  <SelectValue placeholder="Select a date" />
                </SelectTrigger>
                <SelectContent>
                  {dates.map(date => (
                    <SelectItem key={date} value={date}>
                      {date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handlePrint} 
              variant="default"
              data-testid="button-print"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print This Sheet
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading chef printout data...
          </div>
        ) : !activeDate ? (
          <div className="text-center py-12 text-muted-foreground">
            No bookings found. Create some confirmed bookings to see the chef printout.
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Daily Summary - {activeDate}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Events
                    </p>
                    <p className="text-3xl font-bold">{bookingsForDate.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Guests
                    </p>
                    <p className="text-3xl font-bold">{totalMembers}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Unique Dishes
                    </p>
                    <p className="text-3xl font-bold">{combinedItemsArray.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Events for {activeDate}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookingsForDate.map((booking, idx) => (
                  <div key={booking.id} className="p-4 rounded-md border bg-card space-y-2">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <span className="font-semibold">
                        Event {idx + 1}: {booking.clientName} - {booking.eventType}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {booking.guestCount} guests
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Contact: {booking.contactPhone} | {booking.contactEmail}
                    </p>
                    {booking.specialRequests && (
                      <p className="text-sm text-muted-foreground italic">
                        Special Requests: {booking.specialRequests}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {Object.keys(groupedByCategory).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No menu items have been selected for these bookings.
                <br />
                Please edit the bookings and add menu items.
              </div>
            ) : (
              <>
                {Object.entries(groupedByCategory).map(([category, items]) => (
                  <Card key={category} className="break-inside-avoid">
                    <CardHeader className="bg-primary text-primary-foreground rounded-t-md">
                      <CardTitle>{category}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr className="border-b">
                              <th className="text-left p-3 font-semibold w-[10%]">#</th>
                              <th className="text-left p-3 font-semibold w-[50%]">Dish Name</th>
                              <th className="text-center p-3 font-semibold w-[20%]">Quantity to Prepare</th>
                              <th className="text-center p-3 font-semibold w-[20%]">For Guests</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, idx) => (
                              <tr key={item.id} className="border-b last:border-0 hover-elevate">
                                <td className="p-3">{idx + 1}</td>
                                <td className="p-3 font-medium">{item.name}</td>
                                <td className="p-3 text-center font-bold text-primary text-lg">
                                  {item.totalQuantity}
                                </td>
                                <td className="p-3 text-center text-muted-foreground">
                                  {totalMembers} guests
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="bg-green-50 dark:bg-green-950 border-green-500">
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                      Total items to prepare: {combinedItemsArray.length} unique dishes
                      <br />
                      Serving: {totalMembers} guests across {bookingsForDate.length} event(s)
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
