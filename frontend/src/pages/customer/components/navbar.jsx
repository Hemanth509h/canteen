import { Link } from "wouter";
import { CartDrawer } from "@/components/features/cart-drawer";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function Navbar({ companyName, logoSrc, setView }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setView("home")}>
          {logoSrc && <img src={logoSrc} alt="logo" className="w-8 h-8" />}
          <span className="font-playfair font-bold text-lg text-zinc-900 dark:text-white hidden sm:block transition-colors">
            {companyName || "Elite Catering"}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-jakarta font-medium text-zinc-500 dark:text-zinc-400">
          <button onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Menu</button>
          <button onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">About</button>
          <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Contact</button>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={() => setView("bookings")} className="text-sm font-jakarta font-semibold text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors hidden sm:block">My Bookings</button>
          <CartDrawer />
        </div>
      </div>
    </nav>
  );
}
