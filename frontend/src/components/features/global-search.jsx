import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Calendar, User, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import "@/schema";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "booking" | "staff";
  idtring;
  titletring;
  subtitletring;
  status?tring;
}

interface GlobalSearchProps {
  className?tring;
}

export function GlobalSearch({ className }lobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const [, setLocation] = useLocation();

  const { dataookings } = useQuery<EventBooking[]>({
    queryKey"/api/bookings"],
  });

  const { datataffList } = useQuery<Staff[]>({
    queryKey"/api/staff"],
  });

  const resultsearchResult[] = [];

  if (query.length >= 2) {
    const lowerQuery = query.toLowerCase();

    bookings?.forEach((booking) => {
      if (
        booking.clientName.toLowerCase().includes(lowerQuery) ||
        booking.eventType.toLowerCase().includes(lowerQuery) ||
        booking.contactEmail.toLowerCase().includes(lowerQuery) ||
        booking.contactPhone.includes(query)
      ) {
        results.push({
          type: "booking",
          idooking.id,
          titleooking.clientName,
          subtitle: `${booking.eventType} - ${booking.eventDate}`,
          statusooking.status,
        });
      }
    });

    staffList?.forEach((staff) => {
      if (
        staff.name.toLowerCase().includes(lowerQuery) ||
        staff.phone.includes(query) ||
        staff.role.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: "staff",
          idtaff.id,
          titletaff.name,
          subtitle: `${staff.role} - ${staff.phone}`,
        });
      }
    });
  }

  useEffect(() => {
    const handleKeyDown = (eeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSelect = (resultearchResult) => {
    setOpen(false);
    setQuery("");
    if (result.type === "booking") {
      setLocation("/admin/bookings");
    } else {
      setLocation("/admin/staff");
    }
  };

  const statusColorsecord<string, string> = {
    pending: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
    confirmed: "bg-green-500/20 text-green-700 dark:text-green-400",
    completed: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
    cancelled: "bg-red-500/20 text-red-700 dark:text-red-400",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn("relative gap-2 text-muted-foreground", className)}
          data-testid="button-global-search"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bookings and staff..."
              className="pl-10 pr-10"
              data-testid="input-global-search"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setQuery("")}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="p-4 pt-2">
          {query.length < 2 ? (
            <div className="text-sm text-muted-foreground text-center py-8 animate-in fade-in duration-300">
              Type at least 2 characters to search
            </div>
          ) esults.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8 animate-in fade-in duration-300">
              No results found for "{query}"
            </div>
          ) : (
            <div className="space-y-1 max-h-[300px] overflow-y-auto animate-in fade-in duration-300">
              {results.slice(0, 10).map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 p-3 rounded-md text-left hover-elevate active-elevate-2"
                  data-testid={`search-result-${result.type}-${result.id}`}
                >
                  <div className="shrink-0">
                    {result.type === "booking" ? (
                      <Calendar className="w-4 h-4 text-primary" />
                    ) : (
                      <User className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{result.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.subtitle}
                    </p>
                  </div>
                  {result.status && (
                    <Badge
                      variant="secondary"
                      className={cn("shrink-0 text-xs", statusColors[result.status])}
                    >
                      {result.status}
                    </Badge>
                  )}
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {result.type === "booking" ? "Booking" : "Staff"}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
