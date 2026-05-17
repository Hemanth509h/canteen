import { ChefHat, Award, Users, Clock } from "lucide-react";
import { Reveal } from "@/components/layout/reveal";

export default function Features() {
  const items = [
    { icon: ChefHat, title: "Expert Chefs", desc: "Masters of their craft" },
    { icon: Award, title: "Premium Quality", desc: "Finest ingredients only" },
    { icon: Users, title: "Any Occasion", desc: "Intimate to grand" },
    { icon: Clock, title: "Always On Time", desc: "Punctual every time" },
  ];
  return (
    <section id="about" className="bg-white dark:bg-zinc-900 py-16 px-6 border-b border-zinc-100 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((f, i) => (
          <Reveal key={f.title} delay={i * 150}>
            <div className="flex flex-col items-center text-center gap-3 group">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 transition-colors duration-300">
                <f.icon className="w-6 h-6 text-amber-600 dark:text-amber-400 group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <p className="font-playfair font-bold text-zinc-900 dark:text-white text-base transition-colors">{f.title}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-jakarta">{f.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
