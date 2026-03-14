import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  Search, Calendar, MapPin, User, Clock, Mail, Phone, Utensils,
  ChevronDown, ChevronUp, ArrowLeft, BookOpen, CheckCircle,
  XCircle, AlertCircle, HelpCircle
} from "lucide-react";

/* ─── Status config ──────────────────────────────────────────────────────── */
const STATUS = {
  pending:   { icon: AlertCircle, color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/30" },
  confirmed: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  completed: { icon: CheckCircle, color: "text-sky-400",    bg: "bg-sky-400/10",    border: "border-sky-400/30" },
  cancelled: { icon: XCircle,     color: "text-rose-400",   bg: "bg-rose-400/10",   border: "border-rose-400/30" },
};
function getStatus(s) { return STATUS[(s || "").toLowerCase()] || STATUS.pending; }

/* ─── BookingMenu accordion ──────────────────────────────────────────────── */
function BookingMenu({ bookingId }) {
  const [open, setOpen] = useState(false);
  const { data: items, isLoading } = useQuery({
    queryKey: ["/api/bookings", bookingId, "items"],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${bookingId}/items`);
      if (!res.ok) return [];
      const json = await res.json();
      const rawItems = json.data || json;
      const foodRes = await fetch("/api/food-items");
      const foodJson = await foodRes.json();
      const foodItems = foodJson.data || foodJson;
      return rawItems.map((item) => ({
        ...item,
        foodItem: foodItems.find((f) => f.id === item.foodItemId),
      }));
    },
    enabled: open,
  });

  return (
    <div className="mt-5 pt-5 border-t border-zinc-800">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-sm font-jakarta font-semibold text-amber-400 hover:text-amber-300 transition-colors"
      >
        <span className="flex items-center gap-2"><Utensils size={15} /> View Booked Menu</span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {open && (
        <div className="mt-4 space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
          ) : items?.length ? (
            items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <div>
                  <p className="font-jakarta font-semibold text-sm text-white">{item.foodItem?.name || "Unknown Item"}</p>
                  <p className="text-xs text-zinc-400 font-jakarta">{item.foodItem?.category}</p>
                </div>
                <span className="text-xs font-jakarta font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
                  {item.quantity} guests
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-center text-zinc-500 italic py-3 font-jakarta">No menu items selected yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Booking Card ───────────────────────────────────────────────────────── */
function BookingCard({ booking }) {
  const id = booking.id || booking._id;
  const { icon: StatusIcon, color, bg, border } = getStatus(booking.status);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-200 group">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
        {/* Main info */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-jakarta font-bold border capitalize", bg, border, color)}>
              <StatusIcon size={12} /> {booking.status}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono bg-zinc-800 px-2 py-0.5 rounded-md">#{id?.slice(-8)}</span>
          </div>

          <h3 className="text-xl font-playfair font-bold text-white group-hover:text-amber-400 transition-colors">
            {booking.eventType}
          </h3>

          <div className="grid sm:grid-cols-2 gap-2.5 text-sm">
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar size={14} className="text-amber-500 shrink-0" />
              <span className="font-jakarta">
                {new Date(booking.eventDate).toLocaleDateString("en-US", { dateStyle: "long" })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <User size={14} className="text-amber-500 shrink-0" />
              <span className="font-jakarta">{booking.guestCount} Guests</span>
            </div>
            {booking.address && (
              <div className="flex items-center gap-2 text-zinc-400 sm:col-span-2">
                <MapPin size={14} className="text-amber-500 shrink-0" />
                <span className="font-jakarta">{booking.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* ID block */}
        <div className="md:text-right md:pl-6 md:border-l md:border-zinc-800">
          <p className="text-[10px] text-zinc-500 font-jakarta uppercase tracking-widest mb-1">Booking ID</p>
          <p className="font-mono font-bold text-white text-base">{id?.slice(-12)}</p>
        </div>
      </div>

      <BookingMenu bookingId={id} />
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function CustomerDashboard() {
  const [identifier, setIdentifier] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data: bookings, isLoading, isError, isFetching } = useQuery({
    queryKey: ["/api/bookings/search", submitted],
    queryFn: async () => {
      if (!submitted) return [];
      const isEmail = submitted.includes("@");
      const param = isEmail ? `email=${encodeURIComponent(submitted)}` : `phone=${encodeURIComponent(submitted)}`;
      const res = await fetch(`/api/bookings/search?${param}`);
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      if (json.data?.length) localStorage.setItem("customer_identifier", submitted);
      return json.data || [];
    },
    enabled: !!submitted,
  });

  useEffect(() => {
    const saved = localStorage.getItem("customer_identifier");
    if (saved) { setIdentifier(saved); setSubmitted(saved); }
  }, []);

  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(identifier.trim()); };
  const handleSignOut = () => { localStorage.removeItem("customer_identifier"); setIdentifier(""); setSubmitted(""); };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/6 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors font-jakarta text-sm font-medium">
              <ArrowLeft size={16} /> Back to Home
            </button>
          </Link>
          <span className="font-playfair font-bold text-base text-white">My Bookings</span>
          {submitted ? (
            <button onClick={handleSignOut} className="text-xs font-jakarta font-semibold text-zinc-400 hover:text-rose-400 transition-colors">
              Sign Out
            </button>
          ) : <div className="w-20" />}
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Hero text */}
        <div className="text-center mb-12">
          <p className="text-amber-400 text-xs font-jakarta font-bold uppercase tracking-[0.3em] mb-4">Booking Portal</p>
          <h1 className="text-4xl sm:text-5xl font-playfair font-bold text-white mb-4">Track Your Bookings</h1>
          <p className="text-zinc-400 font-jakarta max-w-md mx-auto">
            Enter your phone or email to view all your event bookings.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-12 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="relative flex-1">
            {identifier.includes("@")
              ? <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              : <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />}
            <input
              placeholder="Phone number or email address"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-500 font-jakarta text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
          </div>
          <button
            type="submit"
            className="h-12 px-7 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-jakarta font-bold text-sm flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-amber-500/20 shrink-0"
          >
            <Search size={16} /> Find Bookings
          </button>
        </form>

        {/* Loading */}
        {(isLoading || isFetching) && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <Skeleton className="h-5 w-32 bg-zinc-800" />
                <Skeleton className="h-7 w-64 bg-zinc-800" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-40 bg-zinc-800" />
                  <Skeleton className="h-4 w-32 bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isFetching && (
          <div className="text-center py-16 text-rose-400 font-jakarta">
            Something went wrong. Please try again or contact us directly.
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isFetching && submitted && bookings?.length === 0 && (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
            <BookOpen size={48} className="mx-auto mb-4 text-zinc-700" />
            <h3 className="text-xl font-playfair font-bold text-white mb-2">No Bookings Found</h3>
            <p className="text-zinc-400 font-jakarta text-sm mb-6">
              No bookings found for <span className="text-white font-semibold">{submitted}</span>.
            </p>
            <Link href="/">
              <button className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-jakarta font-bold text-sm transition-all hover:scale-105">
                Browse Our Menu
              </button>
            </Link>
          </div>
        )}

        {/* Bookings list */}
        {!isLoading && !isFetching && bookings && bookings.length > 0 && (
          <div className="space-y-5">
            <p className="text-sm text-zinc-500 font-jakarta">
              <span className="text-white font-semibold">{bookings.length}</span> booking{bookings.length !== 1 ? "s" : ""} found
            </p>
            {bookings.map((b) => <BookingCard key={b.id || b._id} booking={b} />)}
          </div>
        )}
      </main>
    </div>
  );
}
