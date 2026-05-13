import { ChevronRight } from "lucide-react";

export default function Hero({ companyName, tagline, description, heroImages, yearsExperience, eventsPerYear }) {
  const heroImage = heroImages?.[0] || "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1200&auto=format&fit=crop";
  const stats = [
    { value: `${Number(yearsExperience || 1)}+`, label: "Years Experience" },
    { value: `${Number(eventsPerYear || 50).toLocaleString("en-IN")}+`, label: "Events Catered" },
    { value: "98%", label: "Happy Clients" },
  ];

  return (
    <section className="relative overflow-hidden bg-[#fbfaf7] pt-28 text-zinc-950 transition-colors duration-300 dark:bg-zinc-950 dark:text-white sm:pt-32">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fffdf8_0%,#f8faf7_100%)] dark:bg-[linear-gradient(180deg,#09090b_0%,#11120f_100%)]" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 sm:px-8 sm:pb-16 lg:grid-cols-[0.9fr_1fr] lg:gap-14 lg:px-10">
        <div className="order-2 mx-auto w-full max-w-[460px] lg:order-1">
          <div className="relative px-4 pb-4">
            <div className="absolute left-0 top-8 h-[92%] w-[92%] rotate-[-3deg] rounded-lg border border-amber-200 bg-amber-100/70 dark:border-amber-500/20 dark:bg-amber-500/10" />
            <div className="absolute right-0 top-4 h-[94%] w-[94%] rotate-[2deg] rounded-lg border border-emerald-200 bg-emerald-100/70 dark:border-emerald-500/20 dark:bg-emerald-500/10" />
            <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white p-2 shadow-xl shadow-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30">
            <div className="relative aspect-[5/4] overflow-hidden rounded-md">
              <img
                src={heroImage}
                alt={`${companyName || "Catering"} food presentation`}
                className="h-full w-full object-cover"
                loading="eager"
                onError={(event) => {
                  event.currentTarget.src = "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1200&auto=format&fit=crop";
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-zinc-950/72 px-4 py-3 text-white backdrop-blur">
                <p className="text-xs font-jakarta font-semibold uppercase tracking-widest text-amber-200">Freshly prepared</p>
                <p className="mt-1 text-sm text-white/85">Breakfast, catering meals, sweets, and event menus.</p>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div className="order-1 mx-auto max-w-2xl text-center lg:order-2 lg:mx-0 lg:text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-jakarta font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Premium Catering Service
          </div>

          <h1 className="mb-4 text-5xl font-bold leading-[1.02] text-zinc-950 sm:text-6xl lg:text-7xl dark:text-white">
            {companyName || "Ome Caterings"}
          </h1>

          <p className="mb-3 text-lg font-jakarta font-semibold leading-relaxed text-emerald-800 sm:text-xl dark:text-emerald-200">
            {tagline || "Exceptional Food for Unforgettable Events"}
          </p>
          <p className="mb-8 text-sm leading-7 text-zinc-600 sm:text-base dark:text-zinc-300">
            {description || "Freshly prepared menus, reliable service, and event-ready catering for every gathering."}
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <button
              onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-7 py-3.5 text-base font-jakarta font-bold text-white shadow-lg shadow-amber-500/25 transition-all duration-200 hover:bg-amber-400"
            >
              Explore Menu <ChevronRight size={18} />
            </button>
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-7 py-3.5 text-base font-jakarta font-semibold text-zinc-900 shadow-sm transition-all duration-200 hover:border-amber-400 hover:text-amber-700 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:border-amber-300"
            >
              Book an Event
            </button>
          </div>

          <div className="mx-auto mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-zinc-900/10 pt-6 dark:border-white/15 lg:mx-0">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-playfair text-2xl font-bold text-amber-600 sm:text-3xl dark:text-amber-300">{stat.value}</div>
                <div className="mt-0.5 text-[11px] font-jakarta text-zinc-500 sm:text-xs dark:text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 h-px bg-zinc-900/10 dark:bg-white/10" />
    </section>
  );
}
