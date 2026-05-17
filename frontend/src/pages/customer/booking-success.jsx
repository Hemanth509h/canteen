import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, Phone, CalendarCheck } from "lucide-react";
import { Link } from "wouter";
import branding from "@/lib/branding.json";

export default function BookingSuccess() {
  const companyInfo = branding;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full bg-card p-8 rounded-[2rem] shadow-2xl border border-primary/10 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 size={48} className="animate-bounce" />
        </div>
        
        <h1 className="text-3xl font-poppins font-bold text-foreground mb-4">
          Booking Request Sent!
        </h1>
        
        <p className="text-muted-foreground mb-8 text-lg">
          Thank you for choosing <span className="font-bold text-primary">{companyInfo?.companyName || "Sai Canteens"}</span>. 
          Your details have been successfully received and our team will get in touch with you shortly.
        </p>

        <div className="bg-secondary/50 rounded-2xl p-4 mb-8 flex items-center justify-center gap-3 text-sm font-medium text-left">
          <CalendarCheck className="text-primary w-6 h-6 flex-shrink-0" />
          <span>We'll review your request and confirm availability via email/phone.</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/">
            <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105">
              <Home size={18} />
              Back to Home
            </Button>
          </Link>
          
          <Button 
            variant="outline"
            className="w-full h-12 rounded-xl border-primary/20 hover:bg-primary/5 font-bold flex items-center justify-center gap-2 transition-transform hover:scale-105"
            onClick={() => {
              const phoneToCall = companyInfo?.phone || companyInfo?.contactPhone || companyInfo?.phoneNumber || "";
              if (phoneToCall) {
                window.location.href = `tel:${phoneToCall.replace(/\D/g, "")}`;
              }
            }}
          >
            <Phone size={18} />
            Call Us Now
          </Button>
        </div>
      </div>
    </div>
  );
}
