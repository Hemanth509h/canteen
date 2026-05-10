import { useState } from "react";
import { Link } from "wouter";
import { CartDrawer } from "@/components/features/cart-drawer";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Menu, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar({ companyName, logoSrc, setView }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Menu", id: "menu" },
    { label: "About", id: "about" },
    { label: "Contact", id: "contact" },
  ];

  const handleNavClick = (id) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav className="fixed top-4 left-4 right-4 z-50 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-md rounded-2xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setView("home"); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            {logoSrc && <img src={logoSrc} alt="logo" className="w-8 h-8 object-contain" />}
            <span className="font-playfair font-bold text-lg text-zinc-900 dark:text-white transition-colors">
              {companyName || "Ome Caterings"}
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-jakarta font-medium text-zinc-500 dark:text-zinc-400">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 transition-all group-hover:w-full" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button 
              onClick={() => setView("bookings")} 
              className="text-sm font-jakarta font-semibold text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors hidden sm:block"
            >
              My Bookings
            </button>
            <CartDrawer />
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={cn(
          "absolute top-[calc(100%+8px)] left-0 right-0 z-40 bg-white dark:bg-zinc-950 md:hidden border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl transition-all duration-300 ease-in-out origin-top",
          mobileMenuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"
        )}>
          <div className="flex flex-col p-6 gap-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              <p className="text-[10px] font-jakarta font-bold text-zinc-400 uppercase tracking-[0.2em] px-2">Navigation</p>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 text-base font-jakarta font-medium text-zinc-900 dark:text-white transition-colors"
                >
                  {item.label}
                  <ChevronRight size={16} className="text-zinc-400" />
                </button>
              ))}
            </div>
            
            <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
            
            <div className="space-y-4">
              <p className="text-[10px] font-jakarta font-bold text-zinc-400 uppercase tracking-[0.2em] px-2">Account</p>
              <button
                onClick={() => { setView("bookings"); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-base font-jakarta font-bold transition-colors"
              >
                My Bookings
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-16" />
    </>
  );
}

