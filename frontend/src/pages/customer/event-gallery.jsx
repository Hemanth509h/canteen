import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { STATIC_COMPANY_INFO } from "@/lib/static-data";
import branding from "@/lib/branding.json";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import { Reveal } from "@/components/layout/reveal";
import { Users, Calendar, MapPin, Search, Play, ExternalLink } from "lucide-react";

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
        title={`Work video ${index + 1}`}
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
    <a href={url} target="_blank" rel="noreferrer" className="flex aspect-video flex-col items-center justify-center gap-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-3xl">
      <Play className="size-10 text-amber-400" />
      <span className="inline-flex items-center gap-2 text-sm font-semibold">Watch work video <ExternalLink size={14} /></span>
    </a>
  );
}

// Demo event gallery data
const DEMO_EVENTS = [
  {
    id: 1,
    title: "Grand Wedding Reception",
    category: "Wedding",
    guestCount: 350,
    location: "Hyderabad",
    date: "2025-12-15",
    image: "https://png.pngtree.com/background/20230610/original/pngtree-catering-food-on-buffet-table-picture-image_3130856.jpg",
    highlights: ["Multi-course dinner", "Live carving station", "Dessert display"],
  },
  {
    id: 2,
    title: "Corporate Gala",
    category: "Corporate",
    guestCount: 200,
    location: "Hyderabad",
    date: "2025-11-20",
    image: "https://png.pngtree.com/background/20230611/original/pngtree-many-different-kinds-of-food-are-arranged-on-a-table-picture-image_3145533.jpg",
    highlights: ["Cocktail reception", "Plated service", "Bar service"],
  },
  {
    id: 3,
    title: "Family Celebration",
    category: "Family",
    guestCount: 150,
    location: "Hyderabad",
    date: "2025-10-10",
    image: "https://png.pngtree.com/background/20230608/original/pngtree-fresh-food-on-the-table-picture-image_3063945.jpg",
    highlights: ["Traditional dishes", "Family-style service", "Dessert bar"],
  },
  {
    id: 4,
    title: "Engagement Ceremony",
    category: "Engagement",
    guestCount: 250,
    location: "Hyderabad",
    date: "2025-09-28",
    image: "https://png.pngtree.com/background/20230611/original/pngtree-feast-food-buffet-catering-concept-picture-image_3145532.jpg",
    highlights: ["Themed buffet", "Photo booth setup", "Live music dining"],
  },
  {
    id: 5,
    title: "Birthday Bash",
    category: "Birthday",
    guestCount: 100,
    location: "Hyderabad",
    date: "2025-08-15",
    image: "https://png.pngtree.com/background/20230609/original/pngtree-close-up-of-food-being-prepared-in-a-restaurant-kitchen-picture-image_3121099.jpg",
    highlights: ["Customized menu", "Cake cutting", "Game snacks"],
  },
  {
    id: 6,
    title: "Business Conference Lunch",
    category: "Corporate",
    guestCount: 300,
    location: "Hyderabad",
    date: "2025-07-22",
    image: "https://png.pngtree.com/background/20230610/original/pngtree-assorted-appetizers-picture-image_3130851.jpg",
    highlights: ["Healthy options", "Vegetarian focus", "Dietary preferences"],
  },
];

const CATEGORIES = ["All", "Wedding", "Corporate", "Family", "Engagement", "Birthday"];

export default function EventGallery({ setView }) {
  const [, navigate] = useLocation();
  const handleLogoClick = () => navigate("/");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: companyInfo } = useQuery({
    queryKey: ["/api/company-info"],
    staleTime: 5000,
    placeholderData: STATIC_COMPANY_INFO,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const logoSrc = companyInfo?.logoUrl || "/leaf_logo.svg";
  const workVideos = Array.isArray(companyInfo?.workVideos) ? companyInfo.workVideos.filter(Boolean) : [];

  const filteredEvents = DEMO_EVENTS.filter((event) => {
    const categoryMatch = selectedCategory === "All" || event.category === selectedCategory;
    const searchMatch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar logoSrc={logoSrc} setView={setView} onLogoClick={handleLogoClick} />

      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-900 dark:to-zinc-800">
        <div className="max-w-6xl mx-auto text-center">
          <Reveal>
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-zinc-900 dark:text-white mb-6">
              Memorable Moments
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
              Explore our portfolio of successful events and the magic we create for every celebration
            </p>
          </Reveal>
        </div>
      </section>

      {/* Work Videos Section */}
      <section id="work-videos" className="py-16 px-6 bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="mb-3 font-jakarta text-xs font-bold uppercase tracking-[0.25em] text-amber-600">Behind the scenes</p>
              <h2 className="font-playfair text-4xl font-bold text-zinc-900 dark:text-white">See our work in action</h2>
              <p className="mx-auto mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">Watch our event videos to see the catering, service, and presentation live from real celebrations.</p>
            </div>
          </Reveal>
          {workVideos.length ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {workVideos.slice(0, 3).map((url, idx) => (
                <Reveal key={url} delay={idx * 100}>
                  <div className="overflow-hidden rounded-3xl bg-black shadow-lg">
                    <WorkVideo url={url} index={idx} />
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-lg font-semibold text-zinc-900 dark:text-white">Video gallery coming soon</p>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">Upload your event videos in the admin settings to show them here.</p>
            </div>
          )}
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <Reveal>
          <div className="mb-8">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-3.5 text-zinc-400" size={18} />
              <input
                type="text"
                placeholder="Search events or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-jakarta font-semibold transition-all ${
                    selectedCategory === category
                      ? "bg-amber-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Results count */}
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
          Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
        </p>

        {/* Gallery Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, idx) => (
              <Reveal key={event.id} delay={idx * 100}>
                <div className="group cursor-pointer">
                  {/* Image Container */}
                  <div className="relative overflow-hidden rounded-lg h-72 mb-4 bg-zinc-200 dark:bg-zinc-700">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center">
                      <button className="px-6 py-2 bg-amber-500 text-white font-jakarta font-semibold rounded-lg hover:bg-amber-600 transition-colors">
                        View Details
                      </button>
                    </div>
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-block px-3 py-1 bg-amber-500 text-white text-xs font-jakarta font-semibold rounded-full">
                        {event.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-playfair font-bold text-zinc-900 dark:text-white mb-3">
                      {event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Users size={14} className="text-amber-500" />
                        {event.guestCount} Guests
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <MapPin size={14} className="text-amber-500" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Calendar size={14} className="text-amber-500" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1">
                      {event.highlights.map((highlight, i) => (
                        <span key={i} className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded">
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">No events found matching your search</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="text-amber-600 dark:text-amber-400 font-jakarta font-semibold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-amber-50 dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <h2 className="text-3xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
              Ready to Create Your Memorable Moment?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8">
              Let us craft the perfect catering experience for your next event
            </p>
            <button
              onClick={() => setView("bookings")}
              className="px-8 py-3 bg-amber-500 text-white font-jakarta font-semibold rounded-lg hover:bg-amber-600 transition-colors"
            >
              Book Now
            </button>
          </Reveal>
        </div>
      </section>

      <Footer companyInfo={companyInfo} logoSrc={logoSrc} setView={setView} />
    </div>
  );
}
