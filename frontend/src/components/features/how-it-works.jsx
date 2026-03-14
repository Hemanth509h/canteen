import { Calendar, Utensils, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Calendar,
      title: "Explore & Select",
      description: "Browse our curated menu of artisan dishes and choose your favourites for your special event.",
    },
    {
      icon: Utensils,
      title: "Request a Quote",
      description: "Add items to your cart and send us a booking request with your guest count and preferences.",
    },
    {
      icon: CheckCircle,
      title: "Confirm & Enjoy",
      description: "Our team finalises every detail, manages staffing, and delivers an unforgettable experience.",
    },
  ];

  return (
    <section className="py-24 px-6 overflow-hidden relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-primary/40" />
            <span className="text-primary text-xs uppercase tracking-[0.25em] font-jakarta font-semibold">Process</span>
            <div className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-primary/40" />
          </div>
          <h2 className="text-4xl md:text-6xl font-playfair font-bold">How It Works</h2>
          <p className="text-muted-foreground font-jakarta mt-4 max-w-md mx-auto text-base">Three simple steps to your perfect catering experience.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-full bg-primary/8 border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                  <step.icon size={28} className="text-primary group-hover:text-primary-foreground transition-colors duration-500" />
                </div>
                <div className="absolute -right-1 -top-1 w-7 h-7 rounded-full bg-background border-2 border-primary flex items-center justify-center font-playfair font-bold text-primary text-sm">
                  {idx + 1}
                </div>
              </div>

              <h3 className="text-xl font-playfair font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-jakarta text-sm max-w-xs mx-auto">
                {step.description}
              </p>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[65%] w-[70%] h-px border-t border-dashed border-primary/25" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
