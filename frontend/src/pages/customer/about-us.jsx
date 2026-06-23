import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { STATIC_COMPANY_INFO } from "@/lib/static-data";
import branding from "@/lib/branding.json";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import { Reveal } from "@/components/layout/reveal";
import { Award, Users, Heart, Clock } from "lucide-react";

export default function AboutUs({ setView }) {
  const [, navigate] = useLocation();
  const handleLogoClick = () => navigate("/");
  const { data: companyInfo } = useQuery({
    queryKey: ["/api/company-info"],
    staleTime: 5000,
    placeholderData: STATIC_COMPANY_INFO,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const companyName = companyInfo?.companyName || branding.companyName;
  const ownerName = companyInfo?.ownerName || branding.ownerName || "Founder";
  const ownerBio = companyInfo?.ownerBio || branding.ownerBio || "Passionate culinary professional with years of experience in catering excellence.";
  const yearsExperience = companyInfo?.yearsExperience || branding.yearsExperience || 1;
  const eventsPerYear = companyInfo?.eventsPerYear || branding.eventsPerYear || 50;
  const ownerImageUrl = companyInfo?.ownerImageUrl || branding.ownerImageUrl;
  const logoSrc = companyInfo?.logoUrl || "/leaf_logo.svg";

  const stats = [
    { icon: Award, label: "Years of Experience", value: `${yearsPerYear}+` },
    { icon: Users, label: "Events Catered", value: `${eventsPerYear}+/Year` },
    { icon: Heart, label: "Happy Clients", value: "500+" },
    { icon: Clock, label: "Service Hours", value: "9AM-10PM" },
  ];

  const team = [
    {
      name: ownerName,
      role: "Founder & Chef",
      bio: ownerBio,
      image: ownerImageUrl,
    },
    {
      name: "Chef Master",
      role: "Head Chef",
      bio: "Expert in traditional and modern culinary techniques with 10+ years experience.",
      image: "/avatar-placeholder.svg",
    },
    {
      name: "Service Manager",
      role: "Event Manager",
      bio: "Ensures every event runs smoothly with attention to detail and professionalism.",
      image: "/avatar-placeholder.svg",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar logoSrc={logoSrc} setView={setView} onLogoClick={handleLogoClick} />

      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-900 dark:to-zinc-800">
        <div className="max-w-6xl mx-auto text-center">
          <Reveal>
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-zinc-900 dark:text-white mb-6">
              Our Story
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
              {companyName} was founded with a single mission: to transform every event into an unforgettable culinary experience.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Reveal>
            {ownerImageUrl ? (
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img src={ownerImageUrl} alt={ownerName} className="w-full h-96 object-cover" />
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden shadow-xl bg-zinc-200 dark:bg-zinc-700 w-full h-96 flex items-center justify-center">
                <Users size={48} className="text-zinc-400" />
              </div>
            )}
          </Reveal>

          <Reveal delay={200}>
            <div>
              <h2 className="text-3xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                Meet {ownerName}
              </h2>
              <p className="text-amber-600 dark:text-amber-400 font-jakarta font-semibold mb-4">
                Founder & {branding.ownerRole || "Catering Specialist"}
              </p>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed mb-6">
                {ownerBio}
              </p>
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  {yearsExperience}+ years in professional catering
                </p>
                <p className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Specialized in event management and culinary excellence
                </p>
                <p className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Committed to using only premium, fresh ingredients
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-zinc-900 dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Reveal key={idx} delay={idx * 100}>
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <Icon size={32} className="text-amber-500" />
                    </div>
                    <p className="text-2xl md:text-3xl font-playfair font-bold text-white mb-2">
                      {stat.value}
                    </p>
                    <p className="text-sm text-zinc-400">{stat.label}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
              Our Team
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              A dedicated team of culinary professionals committed to excellence
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <Reveal key={idx} delay={idx * 100}>
              <div className="text-center">
                {member.image ? (
                  <div className="rounded-lg overflow-hidden mb-4 h-48">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden mb-4 h-48 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <Users size={48} className="text-zinc-400" />
                  </div>
                )}
                <h3 className="text-xl font-playfair font-bold text-zinc-900 dark:text-white">{member.name}</h3>
                <p className="text-amber-600 dark:text-amber-400 font-jakarta font-semibold text-sm mb-3">{member.role}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{member.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 bg-amber-50 dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center">
              <h2 className="text-3xl font-playfair font-bold text-zinc-900 dark:text-white mb-8">
                Our Mission
              </h2>
              <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed mb-8">
                To create exceptional culinary experiences that bring people together and make every celebration memorable. We believe that great food is more than just sustenance—it's an art form that creates lasting memories and strengthens bonds between people.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-amber-600 dark:text-amber-400 font-bold mb-2">Quality</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Premium ingredients and meticulous preparation</p>
                </div>
                <div>
                  <h3 className="text-amber-600 dark:text-amber-400 font-bold mb-2">Innovation</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Creative culinary techniques and modern presentations</p>
                </div>
                <div>
                  <h3 className="text-amber-600 dark:text-amber-400 font-bold mb-2">Service</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Professional, attentive, and personalized event management</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer companyInfo={companyInfo} logoSrc={logoSrc} setView={setView} />
    </div>
  );
}
