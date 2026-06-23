import { MapPin, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/layout/reveal";

export default function ServiceArea() {
  const city = "Hyderabad";
  const serviceAreas = [
    { name: "Hi-Tech City", icon: "🏙️" },
    { name: "Banjara Hills", icon: "🏘️" },
    { name: "Jubilee Hills", icon: "🏘️" },
    { name: "Madhapur", icon: "🏙️" },
    { name: "Gachibowli", icon: "🏙️" },
    { name: "Kondapur", icon: "🏘️" },
  ];

  return (
    <section className="py-16 px-6 bg-amber-50 dark:bg-zinc-900">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-amber-600 dark:text-amber-400" size={24} />
            <h2 className="text-3xl font-playfair font-bold text-zinc-900 dark:text-white">
              Service Area
            </h2>
          </div>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 mb-12">
            Currently serving across {city}. Professional catering for your events, delivered with precision and excellence.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {serviceAreas.map((area, idx) => (
            <Reveal key={idx} delay={idx * 50}>
              <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-amber-200 dark:border-amber-900 hover:shadow-lg transition-shadow text-center">
                <div className="text-2xl mb-2">{area.icon}</div>
                <p className="text-sm font-jakarta font-semibold text-zinc-900 dark:text-white">{area.name}</p>
                <div className="flex justify-center mt-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={300}>
          <div className="mt-12 p-6 bg-white dark:bg-zinc-800 rounded-lg border border-amber-200 dark:border-amber-900">
            <h3 className="font-jakarta font-bold text-zinc-900 dark:text-white mb-3">
              Beyond {city}?
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4">
              We occasionally cater events outside our primary service area. Contact us for availability and logistics discussion.
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400 font-jakarta font-semibold">
              ✉️ Email us for custom arrangements
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
