import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Users, UtensilsCrossed } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "@/schema";

interface ExportButtonProps {
  bookings?ventBooking[];
  foodItems?oodItem[];
  staff?taff[];
  filename?tring;
  type?: "bookings" | "food" | "staff" | "all";
}

export function ExportButton({ 
  bookings = [], 
  foodItems = [], 
  staff = [],
  filename = "export", 
  type = "bookings" 
}xportButtonProps) {
  const { toast } = useToast();

  const exportBookingsToExcel = () => {
    if (bookings.length === 0) {
      toast({ title: "No data", description: "No bookings to export", variant: "destructive" });
      return;
    }

    const data = bookings.map((booking) => ({
      "Client Name"ooking.clientName,
      "Event Date"ooking.eventDate,
      "Event Type"ooking.eventType,
      "Guest Count"ooking.guestCount,
      "Price Per Plate"ooking.pricePerPlate,
      "Total Amount"ooking.totalAmount || booking.guestCount * booking.pricePerPlate,
      "Status"ooking.status,
      "Contact Email"ooking.contactEmail,
      "Contact Phone"ooking.contactPhone,
      "Advance Payment"ooking.advancePaymentStatus,
      "Final Payment"ooking.finalPaymentStatus,
      "Special Requests"ooking.specialRequests || "",
      "Created At"ooking.createdAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    
    // Auto-size columns
    const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
    worksheet["!cols"] = colWidths;

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${filename}_bookings_${new Date().toISOString().split("T")[0]}.xlsx`);

    toast({ title: "Export successful", description: "Bookings exported to Excel" });
  };

  const exportFoodItemsToExcel = () => {
    if (foodItems.length === 0) {
      toast({ title: "No data", description: "No food items to export", variant: "destructive" });
      return;
    }

    const data = foodItems.map((item) => ({
      "Name"tem.name,
      "Description"tem.description,
      "Category"tem.category,
      "Price"tem.price || "",
      "Rating"tem.rating || "",
      "Dietary Tags"tem.dietaryTags?.join(", ") || "",
      "Image URL"tem.imageUrl || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Food Items");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${filename}_food_items_${new Date().toISOString().split("T")[0]}.xlsx`);

    toast({ title: "Export successful", description: "Food items exported to Excel" });
  };

  const exportStaffToExcel = () => {
    if (staff.length === 0) {
      toast({ title: "No data", description: "No staff to export", variant: "destructive" });
      return;
    }

    const data = staff.map((member) => ({
      "Name"ember.name,
      "Role"ember.role,
      "Phone"ember.phone,
      "Created At"ember.createdAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${filename}_staff_${new Date().toISOString().split("T")[0]}.xlsx`);

    toast({ title: "Export successful", description: "Staff list exported to Excel" });
  };

  const exportAllToExcel = () => {
    const workbook = XLSX.utils.book_new();
    let hasData = false;

    if (bookings.length > 0) {
      hasData = true;
      const bookingData = bookings.map((booking) => ({
        "Client Name"ooking.clientName,
        "Event Date"ooking.eventDate,
        "Event Type"ooking.eventType,
        "Guest Count"ooking.guestCount,
        "Price Per Plate"ooking.pricePerPlate,
        "Total Amount"ooking.totalAmount || booking.guestCount * booking.pricePerPlate,
        "Status"ooking.status,
        "Advance Payment"ooking.advancePaymentStatus,
        "Final Payment"ooking.finalPaymentStatus,
      }));
      const ws = XLSX.utils.json_to_sheet(bookingData);
      XLSX.utils.book_append_sheet(workbook, ws, "Bookings");
    }

    if (foodItems.length > 0) {
      hasData = true;
      const foodData = foodItems.map((item) => ({
        "Name"tem.name,
        "Category"tem.category,
        "Price"tem.price || "",
        "Dietary Tags"tem.dietaryTags?.join(", ") || "",
      }));
      const ws = XLSX.utils.json_to_sheet(foodData);
      XLSX.utils.book_append_sheet(workbook, ws, "Food Items");
    }

    if (staff.length > 0) {
      hasData = true;
      const staffData = staff.map((member) => ({
        "Name"ember.name,
        "Role"ember.role,
        "Phone"ember.phone,
      }));
      const ws = XLSX.utils.json_to_sheet(staffData);
      XLSX.utils.book_append_sheet(workbook, ws, "Staff");
    }

    if (!hasData) {
      toast({ title: "No data", description: "No data to export", variant: "destructive" });
      return;
    }

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${filename}_all_data_${new Date().toISOString().split("T")[0]}.xlsx`);

    toast({ title: "Export successful", description: "All data exported to Excel" });
  };

  const exportToCSV = () => {
    if (bookings.length === 0) {
      toast({ title: "No data", description: "No bookings to export", variant: "destructive" });
      return;
    }

    const headers = [
      "Client Name", "Event Date", "Event Type", "Guest Count",
      "Price Per Plate", "Total Amount", "Status", "Contact Email",
      "Contact Phone", "Advance Payment", "Final Payment", "Special Requests"
    ];

    const rows = bookings.map((booking) => [
      booking.clientName,
      booking.eventDate,
      booking.eventType,
      booking.guestCount.toString(),
      booking.pricePerPlate.toString(),
      (booking.totalAmount || booking.guestCount * booking.pricePerPlate).toString(),
      booking.status,
      booking.contactEmail,
      booking.contactPhone,
      booking.advancePaymentStatus,
      booking.finalPaymentStatus,
      booking.specialRequests || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${filename}_${new Date().toISOString().split("T")[0]}.csv`);

    toast({ title: "Export successful", description: "CSV file downloaded" });
  };

  if (type === "bookings") {
    return (
      
        <DropdownMenuTrigger asChild>
          <Button variant="outline" data-testid="button-export-bookings">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={exportBookingsToExcel} data-testid="menu-export-excel">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export as Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportToCSV} data-testid="menu-export-csv">
            <FileText className="w-4 h-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (type === "food") {
    return (
      <Button variant="outline" onClick={exportFoodItemsToExcel} data-testid="button-export-food">
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    );
  }

  if (type === "staff") {
    return (
      <Button variant="outline" onClick={exportStaffToExcel} data-testid="button-export-staff">
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    );
  }

  return (
    
      <DropdownMenuTrigger asChild>
        <Button variant="outline" data-testid="button-export-all">
          <Download className="w-4 h-4 mr-2" />
          Export Reports
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAllToExcel} data-testid="menu-export-all">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export All Data
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportBookingsToExcel} data-testid="menu-export-bookings-only">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Bookings Only
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportFoodItemsToExcel} data-testid="menu-export-food-only">
          <UtensilsCrossed className="w-4 h-4 mr-2" />
          Food Items Only
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportStaffToExcel} data-testid="menu-export-staff-only">
          <Users className="w-4 h-4 mr-2" />
          Staff Only
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
