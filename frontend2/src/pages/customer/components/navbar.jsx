import { useState } from "react";
import { Link } from "wouter";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Menu, X, ChevronRight, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import branding from "@/lib/branding.json";

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
      <nav className="fixed left-4 right-4 top-4 z-50 rounded-lg border border-zinc-200/80 bg-white/95 shadow-lg shadow-zinc-900/5 backdrop-blur-xl transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950/92 dark:shadow-black/25">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setView("home"); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shadow-emerald-900/20">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-playfair text-lg font-bold text-zinc-950 transition-colors dark:text-white">
                {companyName || branding.companyName}
              </span>
              <span className="hidden text-[10px] font-jakarta font-bold uppercase tracking-[0.18em] text-amber-600 sm:block">
                Catering Service
              </span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 text-sm font-jakarta font-semibold text-zinc-500 dark:text-zinc-400 md:flex">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="relative py-2 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-amber-500 after:transition-all hover:text-zinc-950 hover:after:w-full dark:hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
            <ThemeToggle />
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md p-2 text-zinc-600 transition-colors hover:bg-white hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white md:hidden"
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
          </div>
        </div>
      </nav>
      
      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-16" />
    </>
  );
}
