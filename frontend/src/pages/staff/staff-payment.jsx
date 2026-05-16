import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UPIPayment } from "@/components/features/upi-payment";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Camera,
  Users,
  Calendar,
  MapPin,
  Utensils,
  RefreshCw,
  ChefHat,
  CreditCard,
  IndianRupee,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function StaffPaymentPage() {
  const params = useParams();
  let bookingId = params.bookingId;

  // Handle composite IDs like {bookingId}-{type}-{timestamp}
  if (bookingId && bookingId.includes("-")) {
    const candidate = bookingId.split("-")[0];
    if (candidate.length === 24 && /^[a-f0-9]{24}$/.test(candidate)) {
      bookingId = candidate;
    }
  }

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [advanceFile, setAdvanceFile] = useState(null);
  const [finalFile, setFinalFile] = useState(null);
  const [advancePreview, setAdvancePreview] = useState(null);
  const [finalPreview, setFinalPreview] = useState(null);
  const [staffName, setStaffName] = useState("");

  useEffect(() => {
    const session = localStorage.getItem("staff_session");
    if (!session) {
      setLocation("/staff/login");
      return;
    }
    setStaffName(JSON.parse(session)?.name || "");
  }, [setLocation]);

  const { data: companyInfo } = useQuery({ queryKey: ["/api/company-info"] });

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["/api/bookings", bookingId],
    queryFn: async () => {
      if (!bookingId) throw new Error("No booking ID");
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (!res.ok) throw new Error("Failed to fetch booking");
      return res.json();
    },
    enabled: !!bookingId,
  });

  const booking = response?.data || response;

  const uploadMutation = useMutation({
    mutationFn: async (type) => {
      const file = type === "advance" ? advanceFile : finalFile;
      if (!file) throw new Error("No file selected");
      if (file.size > 50 * 1024 * 1024) throw new Error("File too large (max 50MB)");

      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Upload timed out")), 60000);
        reader.onload = async () => {
          clearTimeout(timeout);
          try {
            const base64 = reader.result;
            await apiRequest("PATCH", `/api/bookings/${bookingId}`, {
              [type === "advance" ? "advancePaymentScreenshot" : "finalPaymentScreenshot"]: base64,
              [type === "advance" ? "advancePaymentStatus" : "finalPaymentStatus"]: "paid",
              [type === "advance" ? "advancePaymentApprovalStatus" : "finalPaymentApprovalStatus"]: "pending",
            });
            resolve("success");
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => { clearTimeout(timeout); reject(new Error("Failed to read file")); };
        reader.readAsDataURL(file);
      });
    },
    onSuccess: (_, type) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/assignments"] });
      toast({ title: "Screenshot uploaded!", description: `${type === "advance" ? "Advance" : "Final"} payment is now pending admin approval.` });
      if (type === "advance") { setAdvanceFile(null); setAdvancePreview(null); }
      else { setFinalFile(null); setFinalPreview(null); }
    },
    onError: (err) => toast({ title: "Upload failed", description: err.message, variant: "destructive" }),
  });

  const handleFile = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const setFile = type === "advance" ? setAdvanceFile : setFinalFile;
    const setPreview = type === "advance" ? setAdvancePreview : setFinalPreview;
    setFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result);
    reader.readAsDataURL(file);
  };

  // ─── Guard: no bookingId ──────────────────────────────────────────────────
  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-lg font-semibold">No Booking ID</p>
            <Button className="w-full" onClick={() => setLocation("/staff/dashboard")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20 p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (isError || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-lg font-semibold">Booking Not Found</p>
            <Button className="w-full" onClick={() => setLocation("/staff/dashboard")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Payment calculations ─────────────────────────────────────────────────
  const totalAmount = Number(booking.totalAmount) || 0;
  const advanceAmount = Number(booking.advanceAmount) || Math.ceil(totalAmount * 0.5);
  const finalAmount = totalAmount - advanceAmount;

  const advancePaid =
    booking.advancePaymentStatus === "paid" &&
    booking.advancePaymentApprovalStatus === "approved";
  const finalPaid =
    booking.finalPaymentStatus === "paid" &&
    booking.finalPaymentApprovalStatus === "approved";
  const advanceUploaded =
    booking.advancePaymentStatus === "paid" &&
    booking.advancePaymentApprovalStatus === "pending";
  const finalUploaded =
    booking.finalPaymentStatus === "paid" &&
    booking.finalPaymentApprovalStatus === "pending";

  const amountCollected = (advancePaid ? advanceAmount : 0) + (finalPaid ? finalAmount : 0);
  const balanceAmount = Math.max(totalAmount - amountCollected, 0);
  const paymentProgress = totalAmount > 0 ? Math.min(Math.round((amountCollected / totalAmount) * 100), 100) : 0;
  const allPaid = advancePaid && finalPaid;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/staff/dashboard")} className="gap-2 text-muted-foreground">
            <ArrowLeft size={16} />
            Dashboard
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <ChefHat size={14} className="text-primary" />
            </div>
            <span className="font-semibold text-sm truncate">{staffName}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId] })}
            title="Refresh"
          >
            <RefreshCw size={15} />
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Booking summary hero */}
        <Card className="border-0 shadow-md bg-white dark:bg-slate-900 overflow-hidden">
          <div className={`h-1.5 ${allPaid ? "bg-emerald-500" : advancePaid ? "bg-blue-500" : "bg-amber-500"}`} />
          <CardHeader className="pb-3 pt-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl">{booking.eventType}</CardTitle>
                <p className="text-muted-foreground text-sm mt-0.5">{booking.clientName}</p>
              </div>
              <Badge
                className={
                  allPaid
                    ? "bg-emerald-600 hover:bg-emerald-600"
                    : advanceUploaded || finalUploaded
                    ? "bg-blue-600 hover:bg-blue-600"
                    : ""
                }
              >
                {allPaid
                  ? "Fully Paid"
                  : advanceUploaded || finalUploaded
                  ? "Under Review"
                  : advancePaid
                  ? "Advance Paid"
                  : "Payment Pending"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pb-5">
            {/* Details row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} className="text-primary shrink-0" />
                <span className="truncate">{format(new Date(booking.eventDate), "d MMM yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users size={14} className="text-primary shrink-0" />
                <span>{booking.guestCount} guests</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Utensils size={14} className="text-primary shrink-0" />
                <span>₹{booking.pricePerPlate}/plate</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={14} className="text-primary shrink-0" />
                <span className="truncate">{booking.eventLocation || "TBD"}</span>
              </div>
            </div>

            {/* Amount tiles */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted/40 p-3 text-center border">
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-lg font-bold">₹{totalAmount.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center border border-emerald-200/60">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">Collected</p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">₹{amountCollected.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3 text-center border border-amber-200/60">
                <p className="text-xs text-amber-700 dark:text-amber-400 mb-1">Balance</p>
                <p className="text-lg font-bold text-amber-700 dark:text-amber-400">₹{balanceAmount.toLocaleString("en-IN")}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Payment progress</span>
                <span>{paymentProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${paymentProgress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Advance Payment Card ─────────────────────────────────────── */}
        <PaymentSection
          step={1}
          title="Advance Payment"
          subtitle={`50% · ₹${advanceAmount.toLocaleString("en-IN")}`}
          amount={advanceAmount}
          isPaid={advancePaid}
          isUploaded={advanceUploaded}
          screenshot={booking.advancePaymentScreenshot}
          file={advanceFile}
          preview={advancePreview}
          companyInfo={companyInfo}
          bookingId={bookingId}
          clientName={booking.clientName}
          paymentType="advance"
          isSubmitting={uploadMutation.isPending}
          onFileChange={(e) => handleFile(e, "advance")}
          onClear={() => { setAdvanceFile(null); setAdvancePreview(null); }}
          onSubmit={() => uploadMutation.mutate("advance")}
        />

        {/* ── Final Payment Card (unlocked after advance approved) ──────── */}
        {advancePaid && (
          <PaymentSection
            step={2}
            title="Final Payment"
            subtitle={`Remaining balance · ₹${finalAmount.toLocaleString("en-IN")}`}
            amount={finalAmount}
            isPaid={finalPaid}
            isUploaded={finalUploaded}
            screenshot={booking.finalPaymentScreenshot}
            file={finalFile}
            preview={finalPreview}
            companyInfo={companyInfo}
            bookingId={bookingId}
            clientName={booking.clientName}
            paymentType="final"
            isSubmitting={uploadMutation.isPending}
            onFileChange={(e) => handleFile(e, "final")}
            onClear={() => { setFinalFile(null); setFinalPreview(null); }}
            onSubmit={() => uploadMutation.mutate("final")}
          />
        )}

        {allPaid && (
          <Card className="border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
            <CardContent className="flex items-center gap-4 py-5">
              <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-full">
                <CheckCircle size={24} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-300">All Payments Confirmed!</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">This booking is fully settled. Great work!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

// ── Reusable payment section sub-component ────────────────────────────────────
function PaymentSection({
  step, title, subtitle, amount, isPaid, isUploaded,
  screenshot, file, preview, companyInfo, bookingId,
  clientName, paymentType, isSubmitting,
  onFileChange, onClear, onSubmit,
}) {
  return (
    <Card className={isPaid ? "border-emerald-300 dark:border-emerald-800" : "border-border"}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                isPaid ? "bg-emerald-600" : "bg-primary"
              }`}
            >
              {isPaid ? <CheckCircle size={18} /> : step}
            </div>
            <div>
              <CardTitle className="text-base leading-tight">{title}</CardTitle>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <Badge variant={isPaid ? "default" : "secondary"} className={isPaid ? "bg-emerald-600 hover:bg-emerald-600" : ""}>
            {isPaid ? "Approved" : isUploaded ? "Under Review" : "Pending"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!isPaid && !isUploaded ? (
          <div className="space-y-5">
            {companyInfo?.upiId && (
              <div className="p-4 bg-muted/30 rounded-xl border border-dashed">
                <UPIPayment
                  upiId={companyInfo.upiId}
                  totalAmount={amount}
                  bookingId={bookingId}
                  clientName={clientName}
                  paymentType={paymentType}
                />
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-muted-foreground" />
                <Label className="font-semibold">Upload Payment Screenshot</Label>
              </div>
              <p className="text-sm text-muted-foreground">After making the payment, upload a screenshot as proof.</p>
              {preview && (
                <div className="relative w-full max-w-xs mx-auto animate-in fade-in">
                  <img src={preview} alt="Preview" className="w-full rounded-xl border-2 shadow-md" />
                  <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={onClear}>
                    Change
                  </Button>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  disabled={isSubmitting}
                  className="flex-1 cursor-pointer"
                />
                <Button onClick={onSubmit} disabled={!file || isSubmitting} className="gap-2 shrink-0">
                  <Upload size={15} />
                  {isSubmitting ? "Uploading…" : "Submit Payment"}
                </Button>
              </div>
            </div>
          </div>
        ) : isUploaded ? (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 p-4 flex items-start gap-3">
              <Clock size={18} className="text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-200">Waiting for Admin Approval</p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">
                  Screenshot received. The admin will review and confirm it shortly.
                </p>
              </div>
            </div>
            {screenshot && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Uploaded Screenshot</p>
                <img src={screenshot} alt="Payment proof" className="rounded-xl border shadow-sm w-full max-w-xs" />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 p-4 flex items-start gap-3">
              <CheckCircle size={18} className="text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-800 dark:text-emerald-200">Payment Approved ✓</p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">
                  This payment has been verified and confirmed by admin.
                </p>
              </div>
            </div>
            {screenshot && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Payment Proof</p>
                <img src={screenshot} alt="Payment proof" className="rounded-xl border shadow-sm w-full max-w-xs" />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
