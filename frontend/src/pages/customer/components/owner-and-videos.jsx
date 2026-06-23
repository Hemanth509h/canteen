import { useRef } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Mail, Phone, Play, UserRound } from "lucide-react";

import { Reveal } from "@/components/layout/reveal";



function getEmbedUrl(value) {
  try {
    const url = new URL(value);
    let videoId = "";

    if (url.hostname === "youtu.be") videoId = url.pathname.slice(1);
    if (url.hostname.includes("youtube.com")) {
      videoId = url.searchParams.get("v") || url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1] || "";
    }

    if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1`;

    const vimeoId = url.hostname.includes("vimeo.com") ? url.pathname.match(/\/(\d+)/)?.[1] : "";
    return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : "";
  } catch {
    return "";
  }
}

function WorkVideo({ url, index }) {
  const embedUrl = getEmbedUrl(url);
  const isDirectVideo = /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(url);

  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        title={`Catering work video ${index + 1}`}
        className="aspect-video w-full"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (isDirectVideo) {
    return <video src={url} className="aspect-video w-full bg-black object-contain" controls preload="metadata" />;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex aspect-video flex-col items-center justify-center gap-3 bg-zinc-900 text-white hover:bg-zinc-800">
      <Play className="size-10 text-amber-400" />
      <span className="inline-flex items-center gap-2 text-sm font-semibold">Watch work video <ExternalLink size={14} /></span>
    </a>
  );
}

export default function OwnerAndVideos({ companyInfo }) {
  const companyName = companyInfo?.companyName || "our catering company";
  const ownerName = companyInfo?.ownerName || `Owner of ${companyName}`;
  const ownerRole = companyInfo?.ownerRole || "Founder & Catering Specialist";
  const ownerBio = companyInfo?.ownerBio || companyInfo?.description || `Personally committed to making every event served by ${companyName} memorable.`;
  const ownerImage = companyInfo?.ownerImageUrl || companyInfo?.logoUrl;
  const ownerPhone = companyInfo?.ownerPhone || companyInfo?.phone || companyInfo?.contactPhone;
  const ownerEmail = companyInfo?.ownerEmail || companyInfo?.email || companyInfo?.contactEmail;
  const configuredVideos = Array.isArray(companyInfo?.workVideos) ? companyInfo.workVideos.filter(Boolean) : [];
  const workVideos = configuredVideos;

  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <section id="owner" className="bg-white px-6 py-20 dark:bg-zinc-900">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <div className="relative mx-auto max-w-md overflow-hidden rounded-[2rem] bg-amber-50 p-8 dark:bg-zinc-800">
              {ownerImage ? (
                <img src={ownerImage} alt={ownerName} className="aspect-square w-full rounded-3xl object-cover" />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-3xl bg-amber-100 dark:bg-zinc-700"><UserRound className="size-24 text-amber-600" /></div>
              )}
            </div>
          </Reveal>
          <Reveal delay={150}>
            <p className="mb-3 font-jakarta text-xs font-bold uppercase tracking-[0.25em] text-amber-600">Meet the owner</p>
            <h2 className="font-playfair text-4xl font-bold text-zinc-900 dark:text-white sm:text-5xl">{ownerName}</h2>
            <p className="mt-3 font-jakarta font-semibold text-amber-600">{ownerRole}</p>
            <p className="mt-6 max-w-2xl font-jakarta leading-8 text-zinc-600 dark:text-zinc-300">{ownerBio}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {ownerPhone && <a href={`tel:${ownerPhone.replace(/\D/g, "")}`} className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-3 text-sm font-bold text-white hover:bg-amber-600 dark:bg-white dark:text-zinc-900"><Phone size={16} /> {ownerPhone}</a>}
              {ownerEmail && <a href={`mailto:${ownerEmail}`} className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-3 text-sm font-bold text-zinc-800 hover:border-amber-500 hover:text-amber-600 dark:border-zinc-700 dark:text-zinc-100"><Mail size={16} /> Email owner</a>}
            </div>
          </Reveal>
        </div>
      </section>
 
      <section id="work-videos" className="bg-zinc-100 px-6 py-20 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="mb-3 font-jakarta text-xs font-bold uppercase tracking-[0.25em] text-amber-600">Behind the scenes</p>
              <h2 className="font-playfair text-4xl font-bold text-zinc-900 dark:text-white">See our work in action</h2>
              <p className="mx-auto mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">A closer look at the food, preparation, and service behind our events.</p>
            </div>
          </Reveal>
          {workVideos.length ? (
            workVideos.length === 1 ? (
              <div className="mx-auto max-w-2xl">
                <Reveal>
                  <div className="overflow-hidden rounded-2xl bg-black shadow-lg">
                    <WorkVideo url={workVideos[0]} index={0} />
                  </div>
                </Reveal>
              </div>
            ) : (
              <div className="group relative">
                {/* Left Scroll Button */}
                <button
                  onClick={() => scroll("left")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="size-6" />
                </button>

                {/* Right Scroll Button */}
                <button
                  onClick={() => scroll("right")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="size-6" />
                </button>

                {/* Gradient Masks */}
                <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-zinc-100 to-transparent pointer-events-none z-10 dark:from-zinc-950" />
                <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-zinc-100 to-transparent pointer-events-none z-10 dark:from-zinc-950" />

                {/* Scroll Area */}
                <div
                  ref={scrollContainerRef}
                  className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory no-scrollbar scroll-smooth px-8"
                >
                  {workVideos.map((url, index) => (
                    <div key={`${url}-${index}`} className="w-[85vw] sm:w-[480px] shrink-0 snap-center">
                      <Reveal delay={index * 100}>
                        <div className="overflow-hidden rounded-2xl bg-black shadow-lg hover:shadow-xl transition-all duration-300">
                          <WorkVideo url={url} index={index} />
                        </div>
                      </Reveal>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <Reveal><div className="mx-auto flex aspect-video max-w-3xl flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-zinc-300 bg-white text-center dark:border-zinc-700 dark:bg-zinc-900"><Play className="size-12 text-amber-500" /><p className="font-playfair text-2xl font-bold text-zinc-800 dark:text-white">Work videos coming soon</p></div></Reveal>
          )}
        </div>
      </section>
    </>
  );
}
