import { useEffect } from "react";
import { useLocation } from "wouter";
import { useSiteContent } from "@/lib/site-content";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import { Reveal } from "@/components/layout/reveal";

export default function TermsAndConditions({ setView }) {
  const [, navigate] = useLocation();
  const handleLogoClick = () => navigate("/");
  const { branding } = useSiteContent();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const logoSrc = branding?.logoUrl || "/leaf_logo.svg";
  const email = branding?.email || branding?.contactEmail;
  const minAdvanceBookingDays = branding?.minAdvanceBookingDays || 2;

  return (
    <div className="min-h-screen bg-background">
      <Navbar logoSrc={logoSrc} setView={setView} onLogoClick={handleLogoClick} />

      <div className="max-w-4xl mx-auto py-16 px-6">
        <Reveal>
          <h1 className="text-4xl font-playfair font-bold text-zinc-900 dark:text-white mb-2">
            Terms & Conditions
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-12">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </Reveal>

        <div className="space-y-12 text-zinc-700 dark:text-zinc-300 font-jakarta leading-relaxed">
          <Reveal>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using the {branding.companyName} website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>
          </Reveal>

          <Reveal delay={100}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                2. Catering Services
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">2.1 Booking Requirements</h3>
                  <p>
                    All bookings must be made at least {minAdvanceBookingDays} days in advance. We reserve the right to refuse bookings that do not meet our operational requirements.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">2.2 Service Details</h3>
                  <p>
                    You must provide accurate event details including date, time, location, guest count, dietary restrictions, and menu preferences. Any changes must be communicated in writing at least 7 days before the event.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">2.3 Pricing & Payment</h3>
                  <p>
                    Prices are quoted based on the menu, guest count, and services specified. A 50% advance deposit is required to confirm the booking. Full payment must be received 5 days before the event date. Payment accepted through online transfers, UPI, and credit/debit cards.
                  </p>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal delay={200}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                3. Cancellation & Refund Policy
              </h2>
              <div className="space-y-3">
                <p>
                  <span className="font-semibold">Cancellation before 30 days:</span> Full refund of deposit (minus 10% processing fee)
                </p>
                <p>
                  <span className="font-semibold">Cancellation between 15-30 days:</span> 50% refund of deposit
                </p>
                <p>
                  <span className="font-semibold">Cancellation within 15 days:</span> No refund; full payment due
                </p>
                <p>
                  <span className="font-semibold">Rescheduling:</span> Allowed without penalty if requested more than 30 days in advance
                </p>
              </div>
            </section>
          </Reveal>

          <Reveal delay={300}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                4. Guest Count Adjustments
              </h2>
              <p>
                Final guest count must be confirmed 5 days before the event. If actual attendance exceeds confirmed count, charges will apply for additional guests at the per-plate rate. Reduction in guest count is subject to our minimum order requirements.
              </p>
            </section>
          </Reveal>

          <Reveal delay={400}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                5. Menu & Customization
              </h2>
              <p>
                We offer customizable menus to accommodate your preferences. Requests for special ingredients or dietary accommodations must be communicated in advance. Additional charges may apply for premium or specialty items.
              </p>
            </section>
          </Reveal>

          <Reveal delay={500}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                6. Venue & Equipment
              </h2>
              <p>
                The Client is responsible for providing adequate venue space, utilities, and parking for our catering team. {branding.companyName} is not responsible for providing or arranging decorations, entertainment, or non-food items unless specifically contracted.
              </p>
            </section>
          </Reveal>

          <Reveal delay={600}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                7. Liability & Damages
              </h2>
              <p className="mb-3">
                {branding.companyName} will not be held liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Changes or cancellations due to circumstances beyond our control</li>
                <li>Damage to client property</li>
                <li>Allergic reactions or food poisoning claims</li>
                <li>Weather-related cancellations or delays</li>
              </ul>
              <p className="mt-4">
                Our liability is limited to the amount paid for services.
              </p>
            </section>
          </Reveal>

          <Reveal delay={700}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                8. Allergies & Health Hazards
              </h2>
              <p>
                It is the Client's responsibility to inform us of all food allergies and dietary restrictions in advance. While we take precautions, we cannot guarantee zero cross-contamination in our facility. Allergen information should be clearly communicated during booking.
              </p>
            </section>
          </Reveal>

          <Reveal delay={800}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                9. Photography & Media
              </h2>
              <p>
                {branding.companyName} reserves the right to photograph or video the event for portfolio and marketing purposes unless otherwise requested in writing. Client consent is assumed unless explicitly stated otherwise.
              </p>
            </section>
          </Reveal>

          <Reveal delay={900}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                10. Right to Refuse Service
              </h2>
              <p>
                We reserve the right to refuse or cancel service to any client whose conduct is disruptive, disrespectful, or violates these terms. In such cases, no refund will be provided.
              </p>
            </section>
          </Reveal>

          <Reveal delay={1000}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                11. Third-Party Links
              </h2>
              <p>
                Our website may contain links to third-party websites for payment processing and other services. We are not responsible for the content, accuracy, or practices of external websites.
              </p>
            </section>
          </Reveal>

          <Reveal delay={1100}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                12. Intellectual Property
              </h2>
              <p>
                All content on the {branding.companyName} website, including text, images, recipes, and designs, is protected by copyright. Unauthorized reproduction or use is prohibited without written permission.
              </p>
            </section>
          </Reveal>

          <Reveal delay={1200}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                13. Dispute Resolution
              </h2>
              <p>
                Any disputes arising from these terms will be resolved through mutual discussion. If resolution cannot be reached, the matter will be subject to the jurisdiction of local courts in Hyderabad.
              </p>
            </section>
          </Reveal>

          <Reveal delay={1300}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                14. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms & Conditions at any time. Changes will be posted on this page. Continued use of our services constitutes acceptance of updated terms.
              </p>
            </section>
          </Reveal>

          <Reveal delay={1400}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                15. Contact Information
              </h2>
              <p>
                For questions regarding these Terms & Conditions, please contact us:
              </p>
              <div className="mt-4 p-4 bg-amber-50 dark:bg-zinc-800 rounded-lg">
                <p className="font-semibold text-zinc-900 dark:text-white">{branding.companyName}</p>
                {email && (
                  <p className="text-sm">
                    Email: <a href={`mailto:${email}`} className="text-amber-600 dark:text-amber-400 hover:underline">{email}</a>
                  </p>
                )}
              </div>
            </section>
          </Reveal>
        </div>
      </div>

      <Footer setView={setView} />
    </div>
  );
}
