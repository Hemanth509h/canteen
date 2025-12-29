import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Calendar, RefreshCw } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function ChefPrintout() {
  const [selectedDate, setSelectedDate] = useState("");

  const { data: groupedBookings, isLoading, isRefetching } = useQuery({
    queryKey: ["/api/chef-printout"],
  });

  const dates = groupedBookings ? Object.keys(groupedBookings).filter(d => d).sort() : [];
  const activeDate = selectedDate || dates[0] || "";
  const bookingsForDate = activeDate ? groupedBookings[activeDate] || [] : [];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Chef Preparation Menu</CardTitle>
          <p className="text-muted-foreground">{activeDate}</p>
        </CardHeader>
      </Card>

      <div className="flex justify-between items-center gap-4">
        <Select value={activeDate} onValueChange={setSelectedDate}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select date" /></SelectTrigger>
          <SelectContent>{dates.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" />Print</Button>
      </div>

      <div className="space-y-4">
        {bookingsForDate.map((booking, idx) => (
          <Card key={booking.id}>
            <CardHeader><CardTitle>Event {idx + 1}: {booking.clientName} ({booking.guestCount} guests)</CardTitle></CardHeader>
            <CardContent>
              <ul className="list-disc pl-5">
                {booking.items.map(item => <li key={item.id}>{item.foodItem.name} x {item.quantity}</li>)}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
