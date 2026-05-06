import { ChevronRight } from "lucide-react";

export default function Hero({ companyName, tagline }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #92400e 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/15 dark:bg-amber-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-400/10 dark:bg-orange-500/15 rounded-full blur-[100px]" />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/40 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-jakarta font-semibold tracking-widest uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
          Premium Catering Service
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-playfair font-bold text-zinc-900 dark:text-white leading-[1.05] mb-6 transition-colors">
          {companyName || "Elite Catering"}
        </h1>

        <p className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 font-jakarta font-light max-w-2xl mx-auto mb-12 leading-relaxed transition-colors">
          {tagline || "Crafting unforgettable culinary experiences for your most cherished occasions."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-jakarta font-bold text-base transition-all duration-200 hover:scale-105 shadow-lg shadow-amber-500/25"
          >
            Explore Menu <ChevronRight size={18} />
          </button>
          <button
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-amber-500 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 font-jakarta font-semibold text-base transition-all duration-200 bg-white dark:bg-transparent"
          >
            Book an Event
          </button>
        </div>

        <div className="flex items-center justify-center gap-8 mt-16 pt-12 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
          {[
            { value: "15+", label: "Years Experience" },
            { value: "500+", label: "Events Catered" },
            { value: "98%", label: "Happy Clients" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-playfair font-bold text-amber-600 dark:text-amber-400">{stat.value}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500 font-jakarta mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-600">
        <span className="text-xs font-jakarta tracking-widest uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-zinc-400 dark:from-zinc-600 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
