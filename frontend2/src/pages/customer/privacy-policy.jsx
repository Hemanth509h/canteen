import { useEffect } from "react";
import { useLocation } from "wouter";
import { useSiteContent } from "@/lib/site-content";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import { Reveal } from "@/components/layout/reveal";

export default function PrivacyPolicy({ setView }) {
  const [, navigate] = useLocation();
  const handleLogoClick = () => navigate("/");
  const { branding } = useSiteContent();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const logoSrc = branding?.logoUrl || "/leaf_logo.svg";
  const email = branding?.email || branding?.contactEmail;

  return (
    <div className="min-h-screen bg-background">
      <Navbar logoSrc={logoSrc} setView={setView} onLogoClick={handleLogoClick} />

      <div className="max-w-4xl mx-auto py-16 px-6">
        <Reveal>
          <h1 className="text-4xl font-playfair font-bold text-zinc-900 dark:text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-12">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </Reveal>

        <div className="space-y-12 text-zinc-700 dark:text-zinc-300 font-jakarta leading-relaxed">
          <Reveal>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                1. Introduction
              </h2>
              <p>
                {branding.companyName} ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and otherwise process personal information in connection with our website, mobile applications, and catering services.
              </p>
            </section>
          </Reveal>

          <Reveal delay={100}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                2. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Personal Information You Provide:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>Contact information (name, email, phone number, address)</li>
                    <li>Event details and booking information</li>
                    <li>Dietary preferences and restrictions</li>
                    <li>Payment information (processed securely through third-party providers)</li>
                    <li>Customer feedback and reviews</li>
                    <li>Any other information you provide through our forms</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Information Collected Automatically:</h3>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>Device information and browser type</li>
                    <li>IP address and location data</li>
                    <li>Pages visited and time spent on our website</li>
                    <li>Referring website and search terms</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal delay={200}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Process and fulfill your catering orders and bookings</li>
                <li>Send booking confirmations and event updates</li>
                <li>Process payments and send invoices</li>
                <li>Respond to inquiries and customer service requests</li>
                <li>Send promotional emails and marketing communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
                <li>Analyze user behavior and preferences</li>
              </ul>
            </section>
          </Reveal>

          <Reveal delay={300}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                4. How We Protect Your Information
              </h2>
              <p>
                We implement industry-standard security measures including SSL encryption, secure payment gateways, and restricted access controls. However, no method of transmission over the internet is completely secure. We cannot guarantee absolute security but are committed to protecting your data.
              </p>
            </section>
          </Reveal>

          <Reveal delay={400}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                5. Information Sharing
              </h2>
              <p className="mb-3">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Payment processors (for transaction processing)</li>
                <li>Email service providers (for communications)</li>
                <li>Legal authorities when required by law</li>
                <li>Service providers who assist in our operations</li>
              </ul>
            </section>
          </Reveal>

          <Reveal delay={500}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                6. Cookies & Tracking
              </h2>
              <p>
                Our website uses cookies and similar technologies to enhance your experience. You can control cookie settings through your browser preferences. Some features may not function properly if cookies are disabled.
              </p>
            </section>
          </Reveal>

          <Reveal delay={600}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                7. Your Rights
              </h2>
              <p className="mb-3">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Access your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
                <li>Request a copy of your data in a portable format</li>
              </ul>
            </section>
          </Reveal>

          <Reveal delay={700}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                8. Third-Party Links
              </h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. Please review their privacy policies before providing any personal information.
              </p>
            </section>
          </Reveal>

          <Reveal delay={800}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                9. Children's Privacy
              </h2>
              <p>
                Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware of such collection, we will take steps to delete such information promptly.
              </p>
            </section>
          </Reveal>

          <Reveal delay={900}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                10. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy periodically. Changes will be posted on this page with an updated "Last Updated" date. Your continued use of our services constitutes acceptance of any modifications.
              </p>
            </section>
          </Reveal>

          <Reveal delay={1000}>
            <section>
              <h2 className="text-2xl font-playfair font-bold text-zinc-900 dark:text-white mb-4">
                11. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
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
