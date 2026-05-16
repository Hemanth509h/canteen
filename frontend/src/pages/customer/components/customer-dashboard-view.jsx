import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, Mail, Phone, BookOpen, ArrowLeft, 
  AlertCircle, CheckCircle, XCircle, Calendar, 
  Utensils, ChevronUp, ChevronDown,
  Loader2, LogIn
} from "lucide-react";
import localMenuItems from "@/lib/menu.json";
import { apiRequest, apiUrl } from "@/lib/queryClient";

const STATUS = {
  pending: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30" },
  confirmed: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  completed: { icon: CheckCircle, color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/30" },
  cancelled: { icon: XCircle, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/30" },
};
function getStatus(s) { return STATUS[(s || "").toLowerCase()] || STATUS.pending; }

function BookingMenu({ bookingId }) {
  const [open, setOpen] = useState(false);
  const { data: items, isLoading } = useQuery({
    queryKey: ["/api/bookings", bookingId, "items"],
    queryFn: async () => {
      const res = await fetch(apiUrl(`/api/bookings/${bookingId}/items`));
      if (!res.ok) return [];
      const json = await res.json();
      const rawItems = json.data || json;
      let foodItems = localMenuItems;
      try {
        const foodRes = await fetch(apiUrl("/api/food-items"));
        if (foodRes.ok) {
          const foodJson = await foodRes.json();
          foodItems = foodJson.data || foodJson || localMenuItems;
        }
      } catch {
        foodItems = localMenuItems;
      }
      return rawItems.map((item) => ({
        ...item,
        foodItem: foodItems.find((f) => f.id === item.foodItemId),
      }));
    },
    enabled: open,
  });

  return (
    <div className="mt-5 pt-5 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
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
              <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 transition-colors">
                <div>
                  <p className="font-jakarta font-semibold text-sm text-zinc-900 dark:text-white">{item.foodItem?.name || "Unknown Item"}</p>
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

function BookingCard({ booking }) {
  const id = booking.id || booking._id;
  const { icon: StatusIcon, color, bg, border } = getStatus(booking.status);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 group">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
        {/* Main info */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-jakarta font-bold border capitalize", bg, border, color)}>
              <StatusIcon size={12} /> {booking.status}
            </span>
            <span className="text-[11px] text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">#{id?.slice(-8)}</span>
          </div>

          <h3 className="text-xl font-playfair font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {booking.eventType}
          </h3>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Calendar size={14} className="text-amber-500 shrink-0" />
              <span className="font-jakarta">
                {new Date(booking.eventDate).toLocaleDateString("en-US", { dateStyle: "long" })}
              </span>
            </div>
            {booking.totalAmount && (
              <div className="mt-2 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 w-fit">
                <span className="text-xs font-jakarta font-bold text-zinc-500 uppercase tracking-widest">Total Cost:</span>
                <span className="text-lg font-playfair font-bold text-amber-600 dark:text-amber-400">
                  ₹{booking.totalAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>


        {/* ID block */}
        <div className="md:text-right md:pl-6 md:border-l md:border-zinc-200 dark:border-zinc-800 flex flex-col justify-between items-end gap-4 transition-colors">
          <div>
            <p className="text-[10px] text-zinc-500 font-jakarta uppercase tracking-widest mb-1">Booking ID</p>
            <p className="font-mono font-bold text-zinc-900 dark:text-white text-base">{id?.slice(-12)}</p>
          </div>
          <Link href={`/payment/${id}`}>
            <button className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-jakarta font-bold text-sm transition-all hover:scale-105 shadow-md shadow-amber-500/20 w-full md:w-auto text-center">
              Payment Page
            </button>
          </Link>
        </div>
      </div>


      <BookingMenu bookingId={id} />
    </div>
  );
}

export default function CustomerDashboardView({ onBack }) {
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [loginStep, setLoginStep] = useState("email");
  const [customerSession, setCustomerSession] = useState(null);

  const { data: bookings, isLoading, isError, isFetching } = useQuery({
    queryKey: ["/api/customer/bookings", customerSession?.token],
    queryFn: async () => {
      if (!customerSession?.token) return [];
      const res = await fetch(apiUrl("/api/customer/bookings"), {
        headers: {
          Authorization: `Bearer ${customerSession.token}`,
        },
      });
      if (res.status === 401) {
        localStorage.removeItem("customer_session");
        setCustomerSession(null);
        throw new Error("Session expired");
      }
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!customerSession?.token,
  });

  const requestCodeMutation = useMutation({
    mutationFn: async (identifier) => {
      const res = await apiRequest("POST", "/api/customer/login/request-code", { identifier });
      return res.json();
    },
    onSuccess: (response) => {
      const result = response.data || response;
      if (result.codeSent === false) return;
      if (result.directLogin) {
        const session = {
          token: result.token,
          phone: result.phone,
          identifier: result.identifier || result.phone,
        };
        localStorage.setItem("customer_session", JSON.stringify(session));
        localStorage.setItem("customer_identifier", session.identifier);
        setCustomerSession(session);
        return;
      }
      setLoginStep("code");
      setCode("");
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async ({ email, code }) => {
      const res = await apiRequest("POST", "/api/customer/login/verify", { email, code });
      return res.json();
    },
    onSuccess: (response) => {
      const session = response.data || response;
      localStorage.setItem("customer_session", JSON.stringify(session));
      localStorage.setItem("customer_identifier", session.email || session.identifier);
      setCustomerSession(session);
    },
  });

  useEffect(() => {
    const savedSession = localStorage.getItem("customer_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed?.token && (parsed?.email || parsed?.phone)) {
          setCustomerSession(parsed);
          setIdentifier(parsed.email || parsed.phone || parsed.identifier || "");
          return;
        }
      } catch {
        localStorage.removeItem("customer_session");
      }
    }

    const savedIdentifier = localStorage.getItem("customer_identifier");
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
    }
  }, []);

  const handleRequestCode = (e) => {
    e.preventDefault();
    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) return;
    requestCodeMutation.mutate(trimmedIdentifier);
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    const email = identifier.trim().toLowerCase();
    verifyCodeMutation.mutate({ email, code: code.trim() });
  };

  const handleSignOut = async () => {
    if (customerSession?.token) {
      try {
        await fetch(apiUrl("/api/customer/logout"), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${customerSession.token}`,
          },
        });
      } catch {
        // The local session should still be cleared if the network request fails.
      }
    }
    localStorage.removeItem("customer_session");
    localStorage.removeItem("customer_identifier");
    setCustomerSession(null);
    setIdentifier("");
    setCode("");
    setLoginStep("email");
  };

  const loginError = requestCodeMutation.error || verifyCodeMutation.error;
  const loginMessage = requestCodeMutation.data?.data?.codeSent === false
    ? requestCodeMutation.data.data.message
    : null;
  const isSubmittingLogin = requestCodeMutation.isPending || verifyCodeMutation.isPending;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/6 rounded-full blur-[100px]" />
      </div>

      <header className="sticky top-4 mx-4 z-20 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md rounded-2xl transition-all duration-300">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-zinc-500 hover:text-amber-500 transition-colors font-jakarta text-sm font-medium">
            <ArrowLeft size={16} /> Back to Home
          </button>
          <span className="font-playfair font-bold text-base text-zinc-900 dark:text-white">My Bookings</span>
          {customerSession ? (
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
          <h1 className="text-4xl sm:text-5xl font-playfair font-bold text-zinc-900 dark:text-white mb-4 transition-colors">Track Your Bookings</h1>
          <p className="text-zinc-400 font-jakarta max-w-md mx-auto">
            Sign in with the email or mobile number used for your booking to view your event details.
          </p>
        </div>

        {!customerSession && (
          <div className="mb-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 transition-colors">
            {loginStep === "email" ? (
              <form onSubmit={handleRequestCode} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  {identifier.includes("@") ? (
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  ) : (
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  )}
                  <input
                    type="text"
                    placeholder="Email or mobile number used for booking"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-500 font-jakarta text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingLogin}
                  className="h-12 px-7 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-950 font-jakarta font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg shadow-amber-500/20 shrink-0"
                >
                  {requestCodeMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                  Continue
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <LogIn size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      inputMode="numeric"
                      placeholder="Enter 6 digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-500 font-jakarta text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingLogin || code.length !== 6}
                    className="h-12 px-7 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-950 font-jakarta font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg shadow-amber-500/20 shrink-0"
                  >
                    {verifyCodeMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    View Bookings
                  </button>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs font-jakarta text-zinc-500">
                  <span>Code sent to {identifier.trim().toLowerCase()}</span>
                  <button type="button" onClick={() => setLoginStep("email")} className="font-semibold text-amber-500 hover:text-amber-400">
                    Change Login
                  </button>
                </div>
              </form>
            )}

            {loginError && (
              <p className="mt-3 text-sm text-rose-400 font-jakarta">
                {loginError.message || "Unable to sign in. Please try again."}
              </p>
            )}
            {loginMessage && (
              <p className="mt-3 text-sm text-rose-400 font-jakarta">
                {loginMessage}
              </p>
            )}
          </div>
        )}

        {/* Loading */}
        {(isLoading || isFetching) && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 transition-colors">
                <Skeleton className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800" />
                <Skeleton className="h-7 w-64 bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-40 bg-zinc-200 dark:bg-zinc-800" />
                  <Skeleton className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800" />
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
        {!isLoading && !isFetching && customerSession && bookings?.length === 0 && (
          <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl transition-colors">
            <BookOpen size={48} className="mx-auto mb-4 text-zinc-700" />
            <h3 className="text-xl font-playfair font-bold text-zinc-900 dark:text-white mb-2">No Bookings Found</h3>
            <p className="text-zinc-400 font-jakarta text-sm mb-6">
              No bookings found for <span className="text-zinc-900 dark:text-white font-semibold">{customerSession.email || customerSession.phone}</span>.
            </p>
            <button onClick={onBack} className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-jakarta font-bold text-sm transition-all hover:scale-105">
              Browse Our Menu
            </button>
          </div>
        )}

        {/* Bookings list */}
        {!isLoading && !isFetching && bookings && bookings.length > 0 && (
          <div className="space-y-5">
            <p className="text-sm text-zinc-500 font-jakarta">
              <span className="text-zinc-900 dark:text-white font-semibold">{bookings.length}</span> booking{bookings.length !== 1 ? "s" : ""} found
            </p>
            {[...bookings].reverse().map((b) => <BookingCard key={b.id || b._id} booking={b} />)}
          </div>
        )}
      </main>
    </div>
  );
}
