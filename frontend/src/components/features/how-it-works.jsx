import { Calendar, Utensils, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Calendar,
      title: "Explore & Select",
      description: "Browse our diverse menu of authentic dishes and choose your favorites for your special event."
    },
    {
      icon: Utensils,
      title: "Request a Quote",
      description: "Add items to your cart and send us a booking request with your guest count and preferences."
    },
    {
      icon: CheckCircle,
      title: "Confirm & Enjoy",
      description: "Our team will contact you to finalize the details, manage staffing, and deliver an unforgettable catering experience."
    }
  ];

  return (
    <section className="py-24 px-6 bg-secondary/5 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4 block">Process</span>
          <h2 className="text-4xl md:text-6xl font-poppins font-bold">How It Works</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary transition-colors duration-500 relative">
                <step.icon size={32} className="text-primary group-hover:text-white transition-colors duration-500" />
                <div className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center font-bold text-primary">
                  {idx + 1}
                </div>
              </div>
              <h3 className="text-2xl font-poppins font-bold mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed italic">"{step.description}"</p>
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[70%] w-full h-[2px] bg-border/30 border-dashed" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
