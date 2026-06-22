import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import branding from "@/lib/branding.json";

export default function Hero({ companyName, tagline, description, heroImages, yearsExperience, eventsPerYear }) {
  const defaultImages = [
    "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547573854-74d2a71d0826?q=80&w=1200&auto=format&fit=crop"
  ];
  
  const imagesList = heroImages?.length
    ? [...heroImages, ...defaultImages].slice(0, 3)
    : defaultImages;
  
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imagesList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [imagesList.length]);

  const heroImage1 = imagesList[currentIndex];
  const heroImage2 = imagesList[(currentIndex + 1) % imagesList.length];
  const heroImage3 = imagesList[(currentIndex + 2) % imagesList.length];
  const stats = [
    { value: `${Number(yearsExperience || 1)}+`, label: "Years Experience" },
    { value: `${Number(eventsPerYear || 50).toLocaleString("en-IN")}+`, label: "Events Catered" },
    { value: "98%", label: "Happy Clients" },
  ];

  return (
    <section className="relative overflow-hidden bg-[#fbfaf7] pt-28 text-zinc-950 transition-colors duration-300 dark:bg-zinc-950 dark:text-white sm:pt-32">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fffdf8_0%,#f8faf7_100%)] dark:bg-[linear-gradient(180deg,#09090b_0%,#11120f_100%)]" />
      
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-[15%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-amber-500/10 blur-[100px] dot-float-1 dark:bg-amber-500/5" />
      <div className="absolute bottom-0 right-[15%] h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-500/10 blur-[120px] dot-float-2 dark:bg-emerald-500/5" />
      <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/5 blur-[80px] dot-float-3 dark:bg-orange-500/5" />
      <div className="absolute inset-0 grain-overlay opacity-30 dark:opacity-20" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 sm:px-8 sm:pb-16 lg:grid-cols-[0.9fr_1fr] lg:gap-14 lg:px-10">
        <div className="order-2 mx-auto w-full max-w-[460px] lg:order-1 fade-in hero-image-reveal" style={{ animationDelay: "400ms" }}>
          <div className="relative px-4 pb-8 sm:pb-4">
            {/* Dummy element to preserve aspect ratio layout */}
            <div className="pointer-events-none invisible relative rounded-lg p-2">
              <div className="aspect-[5/4] w-full"></div>
            </div>

            {imagesList.slice(0, 3).map((imgUrl, i) => {
              const positionIndex = (i - currentIndex + 3) % 3;
              const isFront = positionIndex === 0;

              return (
                <div
                  key={i}
                  className={`
                    absolute left-4 right-4 top-0 origin-center transition-all duration-1000 ease-in-out
                    rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900
                    ${isFront ? "z-20 scale-100 translate-x-0 translate-y-0 rotate-0 shadow-2xl shadow-zinc-900/20 dark:shadow-black/50" : ""}
                    ${positionIndex === 1 ? "z-10 scale-[0.92] -translate-x-[4%] translate-y-[10%] rotate-[-4deg] shadow-xl shadow-zinc-900/10 dark:shadow-black/30" : ""}
                    ${positionIndex === 2 ? "z-10 scale-[0.95] translate-x-[4%] translate-y-[5%] rotate-[3deg] shadow-xl shadow-zinc-900/10 dark:shadow-black/30" : ""}
                  `}
                >
                  <div className="relative aspect-[5/4] w-full overflow-hidden rounded-md">
                    <img
                      src={imgUrl}
                      alt={`${companyName || branding.companyName} food presentation`}
                      className={`h-full w-full object-cover transition-opacity duration-1000 ${isFront ? "opacity-100" : "opacity-70"}`}
                      loading={i === 0 ? "eager" : "lazy"}
                      onError={(event) => {
                        event.currentTarget.src = defaultImages[i] || defaultImages[0];
                      }}
                    />
                    
                    <div className={`absolute inset-0 bg-black/10 transition-opacity duration-1000 dark:bg-black/30 ${isFront ? "opacity-0" : "opacity-100"}`} />
                    
                    <div className={`absolute bottom-0 left-0 right-0 bg-zinc-950/72 px-4 py-3 text-white backdrop-blur transition-opacity duration-1000 ${isFront ? "opacity-100" : "opacity-0"}`}>
                      <p className="text-xs font-jakarta font-semibold uppercase tracking-widest text-amber-200">Freshly prepared</p>
                      <p className="mt-1 text-sm text-white/85">Breakfast, catering meals, sweets, and event menus.</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="order-1 mx-auto max-w-2xl text-center lg:order-2 lg:mx-0 lg:text-left">
          <div className="slide-up mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-jakarta font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300" style={{ animationDelay: "100ms" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Premium Catering Service
          </div>

          <h1 className="slide-up mb-4 text-5xl font-bold leading-[1.02] text-zinc-950 sm:text-6xl lg:text-7xl dark:text-white" style={{ animationDelay: "200ms" }}>
            {companyName || branding.companyName}
          </h1>

          <p className="slide-up mb-3 text-lg font-jakarta font-semibold leading-relaxed text-emerald-800 sm:text-xl dark:text-emerald-200" style={{ animationDelay: "300ms" }}>
            {tagline || branding.tagline}
          </p>
          <p className="slide-up mb-8 text-sm leading-7 text-zinc-600 sm:text-base dark:text-zinc-300" style={{ animationDelay: "400ms" }}>
            {description || branding.description}
          </p>

          <div className="slide-up flex flex-col justify-center gap-3 sm:flex-row lg:justify-start" style={{ animationDelay: "500ms" }}>
            <button
              onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-7 py-3.5 text-base font-jakarta font-bold text-white shadow-lg shadow-amber-500/25 transition-all duration-200 hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore Menu <ChevronRight size={18} />
            </button>
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-7 py-3.5 text-base font-jakarta font-semibold text-zinc-900 shadow-sm transition-all duration-200 hover:border-amber-400 hover:text-amber-700 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:border-amber-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Contact Us
            </button>
          </div>

          <div className="slide-up mx-auto mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-zinc-900/10 pt-6 dark:border-white/15 lg:mx-0" style={{ animationDelay: "600ms" }}>
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
