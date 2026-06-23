import { Instagram, Facebook, Twitter, MapPin, Phone, Clock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Reveal } from "@/components/layout/reveal";
import { useSiteContent } from "@/lib/site-content";

export default function Footer({ setView }) {
  const [, navigate] = useLocation();
  const { branding } = useSiteContent();
  
  const companyName = branding?.companyName;
  const tagline = branding?.tagline;
  const phone = branding?.phoneNumber || branding?.phone || branding?.contactPhone;
  const logoSrc = branding?.logoUrl || "/leaf_logo.svg";

  return (
    <footer id="contact" className="bg-zinc-900 dark:bg-zinc-950 text-zinc-400 py-16 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-zinc-800">
          <Reveal delay={100}>
            <div className="flex items-center gap-2.5 mb-4">
              {logoSrc && <img src={logoSrc} alt="logo" className="w-8 h-8" />}
              <span className="font-playfair font-bold text-white text-lg">{companyName}</span>
            </div>
            <p className="font-jakarta text-sm leading-relaxed italic">
              "{tagline}"
            </p>
            <div className="flex gap-3 mt-5">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-full border border-zinc-700 hover:border-amber-500 hover:text-amber-400 transition-colors flex items-center justify-center">
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={200}>
            <p className="font-jakarta font-bold text-white text-sm uppercase tracking-widest mb-4">Navigate</p>
            <div className="flex flex-col gap-3 text-sm font-jakarta">
              <Link href="/" className="text-left hover:text-amber-400 transition-colors">Home</Link>
              <Link href="/#menu" className="text-left hover:text-amber-400 transition-colors">Menu</Link>
              <Link href="/about-us" className="text-left hover:text-amber-400 transition-colors">About Us</Link>
              <Link href="/gallery" className="text-left hover:text-amber-400 transition-colors">Event Gallery</Link>
              <button
                onClick={() => {
                  if (setView) {
                    setView("bookings");
                  } else {
                    navigate("/");
                  }
                }}
                className="text-left hover:text-amber-400 transition-colors"
              >
                My Bookings
              </button>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <p className="font-jakarta font-bold text-white text-sm uppercase tracking-widest mb-4">Contact</p>
            <div className="flex flex-col gap-3 text-sm font-jakarta">
              {branding?.address && (
                <span className="flex items-start gap-2"><MapPin size={14} className="text-amber-500 mt-0.5 shrink-0" />{branding.address}</span>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <Phone size={14} className="text-amber-500 shrink-0" />{phone}
                </a>
              )}
              <span className="flex items-center gap-2"><Clock size={14} className="text-amber-500 shrink-0" />Mon – Sun: 9AM – 10PM</span>
            </div>
          </Reveal>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-jakarta">
          <p>© 2025 {companyName}. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/privacy-policy" className="text-zinc-400 hover:text-amber-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-zinc-400 hover:text-amber-400 transition-colors">Terms & Conditions</Link>
          </div>
          {phone && (
            <a href={`tel:${phone.replace(/\D/g, "")}`} className="flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors">
              <Phone size={13} /> Call Us Now
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
