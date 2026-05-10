import { Link } from "wouter";
import { Instagram, Facebook, Twitter, Lock, MapPin, Phone, Clock } from "lucide-react";

export default function Footer({ companyInfo, logoSrc, setView }) {
  return (
    <footer id="contact" className="bg-zinc-900 dark:bg-zinc-950 text-zinc-400 py-16 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              {logoSrc && <img src={logoSrc} alt="logo" className="w-8 h-8" />}
              <span className="font-playfair font-bold text-white text-lg">{companyInfo?.companyName || "Ome Caterings"}</span>
            </div>
            <p className="font-jakarta text-sm leading-relaxed italic">
              "{companyInfo?.tagline || "Exceptional Food for Unforgettable Events"}"
            </p>
            <div className="flex gap-3 mt-5">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-full border border-zinc-700 hover:border-amber-500 hover:text-amber-400 transition-colors flex items-center justify-center">
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-jakarta font-bold text-white text-sm uppercase tracking-widest mb-4">Navigate</p>
            <div className="flex flex-col gap-3 text-sm font-jakarta">
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="text-left hover:text-amber-400 transition-colors">Home</button>
              <button onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })} className="text-left hover:text-amber-400 transition-colors">Menu</button>
              <button onClick={() => setView("bookings")} className="text-left hover:text-amber-400 transition-colors">My Bookings</button>
              <Link href="/admin/login" className="hover:text-amber-400 transition-colors flex items-center gap-2">
                <Lock size={12} /> Admin Portal
              </Link>
            </div>
          </div>

          <div>
            <p className="font-jakarta font-bold text-white text-sm uppercase tracking-widest mb-4">Contact</p>
            <div className="flex flex-col gap-3 text-sm font-jakarta">
              {companyInfo?.address && (
                <span className="flex items-start gap-2"><MapPin size={14} className="text-amber-500 mt-0.5 shrink-0" />{companyInfo.address}</span>
              )}
              {companyInfo?.phoneNumber && (
                <a href={`tel:${companyInfo.phoneNumber}`} className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <Phone size={14} className="text-amber-500 shrink-0" />{companyInfo.phoneNumber}
                </a>
              )}
              <span className="flex items-center gap-2"><Clock size={14} className="text-amber-500 shrink-0" />Mon – Sun: 9AM – 10PM</span>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-jakarta">
          <p>© 2025 {companyInfo?.companyName || "Ome Caterings"}. All rights reserved.</p>
          {companyInfo?.phoneNumber && (
            <a href={`tel:${companyInfo.phoneNumber.replace(/\D/g, "")}`} className="flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors">
              <Phone size={13} /> Call Us Now
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
