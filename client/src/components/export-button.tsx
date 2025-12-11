import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { EventBooking } from "@shared/schema";

interface ExportButtonProps {
  bookings: EventBooking[];
  filename?: string;
}

export function ExportButton({ bookings, filename = "bookings" }: ExportButtonProps) {
  const { toast } = useToast();

  const exportToCSV = () => {
    if (bookings.length === 0) {
      toast({ title: "No data", description: "No bookings to export", variant: "destructive" });
      return;
    }

    const headers = [
      "Client Name",
      "Event Date",
      "Event Type",
      "Guest Count",
      "Price Per Plate",
      "Total Amount",
      "Status",
      "Contact Email",
      "Contact Phone",
      "Advance Payment",
      "Final Payment",
      "Special Requests",
      "Created At",
    ];

    const rows = bookings.map((booking) => [
      booking.clientName,
      booking.eventDate,
      booking.eventType,
      booking.guestCount.toString(),
      booking.pricePerPlate.toString(),
      (booking.guestCount * booking.pricePerPlate).toString(),
      booking.status,
      booking.contactEmail,
      booking.contactPhone,
      booking.advancePaymentStatus,
      booking.finalPaymentStatus,
      booking.specialRequests || "",
      booking.createdAt,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({ title: "Export successful", description: "CSV file downloaded" });
  };

  const exportToExcel = () => {
    if (bookings.length === 0) {
      toast({ title: "No data", description: "No bookings to export", variant: "destructive" });
      return;
    }

    const headers = [
      "Client Name",
      "Event Date",
      "Event Type",
      "Guest Count",
      "Price Per Plate",
      "Total Amount",
      "Status",
      "Contact Email",
      "Contact Phone",
      "Advance Payment",
      "Final Payment",
      "Special Requests",
      "Created At",
    ];

    const rows = bookings.map((booking) => [
      booking.clientName,
      booking.eventDate,
      booking.eventType,
      booking.guestCount,
      booking.pricePerPlate,
      booking.guestCount * booking.pricePerPlate,
      booking.status,
      booking.contactEmail,
      booking.contactPhone,
      booking.advancePaymentStatus,
      booking.finalPaymentStatus,
      booking.specialRequests || "",
      booking.createdAt,
    ]);

    let tableHtml = "<table>";
    tableHtml += "<tr>" + headers.map((h) => `<th>${h}</th>`).join("") + "</tr>";
    rows.forEach((row) => {
      tableHtml += "<tr>" + row.map((cell) => `<td>${cell}</td>`).join("") + "</tr>";
    });
    tableHtml += "</table>";

    const blob = new Blob(
      [
        `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="UTF-8"></head><body>${tableHtml}</body></html>`,
      ],
      { type: "application/vnd.ms-excel" }
    );

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.xls`;
    link.click();

    toast({ title: "Export successful", description: "Excel file downloaded" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" data-testid="button-export-bookings">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV} data-testid="menu-export-csv">
          <FileText className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel} data-testid="menu-export-excel">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
