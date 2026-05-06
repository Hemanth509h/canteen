import { Star } from "lucide-react";

export default function Testimonials({ reviews }) {
  const list = reviews?.length ? reviews.slice(0, 3) : [
    { customerName: "Sarah J.", eventType: "Wedding", comment: "Absolutely divine food! Every guest was blown away." },
    { customerName: "Michael R.", eventType: "Corporate", comment: "Professional, punctual, and exceptional quality." },
    { customerName: "Elena W.", eventType: "Birthday", comment: "Best catering we've ever experienced. Highly recommend!" },
  ];
  return (
    <section className="bg-white dark:bg-zinc-900 py-20 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-amber-600 dark:text-amber-400 text-xs font-jakarta font-bold uppercase tracking-[0.3em] mb-3">Reviews</p>
          <h2 className="text-4xl sm:text-5xl font-playfair font-bold text-zinc-900 dark:text-white transition-colors">What Clients Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {list.map((r, i) => (
            <div key={i} className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 flex flex-col gap-4 transition-colors">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 font-jakarta text-sm leading-relaxed flex-1">"{r.comment}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center font-playfair font-bold text-amber-700 dark:text-amber-400">
                  {r.customerName.charAt(0)}
                </div>
                <div>
                  <p className="font-jakarta font-bold text-sm text-zinc-900 dark:text-white">{r.customerName}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-jakarta">{r.eventType}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
