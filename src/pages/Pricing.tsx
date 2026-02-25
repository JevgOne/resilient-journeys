import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import PricingCards, { PricingTrustSignals } from "@/components/PricingCards";
import {
  isEarlyBird,
  formatEarlyBirdEnd,
} from "@/lib/pricing";
import { Crown } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const earlyBird = isEarlyBird();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing — Membership Plans from €27 | Resilient Mind"
        description="Choose from Basic or Premium membership plans. Pay as you go from €27 or yearly from €270. One-time payments, no auto-renewal. Includes video lessons, workbooks and more."
        path="/pricing"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Resilient Mind Membership",
          description:
            "Membership plans for art expressive therapy programs for expatriates.",
          brand: {
            "@type": "Organization",
            name: "Resilient Mind",
          },
          offers: [
            {
              "@type": "Offer",
              name: "Basic Monthly",
              price: "27",
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
              url: "https://resilientmind.io/pricing",
            },
            {
              "@type": "Offer",
              name: "Premium Monthly",
              price: "47",
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
              url: "https://resilientmind.io/pricing",
            },
          ],
        }}
      />
      <Navbar />

      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <PageHero>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Crown size={16} className="text-primary" />
              <span className="text-sm font-sans font-medium text-primary">
                Membership Pricing
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
              From Navigating Life Abroad to Truly Thriving
            </h1>

            <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto leading-relaxed">
              A 12-month guided membership program that transforms the loneliness, uncertainty, and cultural stress of expat life into your greatest strengths.
            </p>
          </div>
        </PageHero>

        {/* Program description */}
        <section className="py-8">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-muted-foreground font-sans leading-relaxed">
                Ongoing emotional support and nervous system regulation for expat women.
              </p>
            </div>
          </div>
        </section>

        {/* Early-bird banner */}
        {earlyBird && (
          <section className="py-4">
            <div className="container px-4">
              <div className="max-w-3xl mx-auto">
                <div className="bg-gradient-gold text-primary-foreground rounded-xl px-6 py-4 text-center">
                  <p className="font-sans font-semibold text-lg">
                    Save €10/month! Early-bird pricing ends on {formatEarlyBirdEnd()}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Membership Tiers */}
        <section className="py-12">
          <div className="container px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center mb-4">
                Resilient Mind Membership
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-12 max-w-xl mx-auto">
                An online membership with guided practical tools and video support. Pay as you go — no auto-renewal.
              </p>

              <PricingCards cancelUrl="/pricing" />
              <PricingTrustSignals />
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-12">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center mb-4">
                What's Included in the Membership
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-12">
                Every month you receive:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  {
                    emoji: "🎧",
                    title: "Guided EFT Sessions",
                    desc: "Stress, anxiety, emotional regulation, self-safety",
                  },
                  {
                    emoji: "🧠",
                    title: "One Monthly Theme",
                    desc: "e.g. stress abroad, loneliness, health challenges, boundaries, stability",
                  },
                  {
                    emoji: "🫶",
                    title: "Community Support (Skool)",
                    desc: "For Premium Membership",
                  },
                  {
                    emoji: "📄",
                    title: "Practical Tools",
                    desc: "Worksheets, journaling prompts, integration practices",
                  },
                  {
                    emoji: "🤍",
                    title: "Safe Members-Only Space",
                    desc: "Connection without pressure, sharing is always optional",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="group bg-card/80 backdrop-blur-sm rounded-3xl border border-border/60 p-1 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="rounded-[1.25rem] bg-gradient-to-b from-background/60 to-background/30 p-6">
                      <div className="text-2xl mb-3">{item.emoji}</div>
                      <h3 className="text-lg font-serif font-semibold mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-gradient-warm">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
                Ready to Begin Your Journey?
              </h2>
              <p className="text-muted-foreground mb-6 font-sans">
                Choose the plan that resonates with you. You can upgrade or
                change your membership at any time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => {
                    if (!user) {
                      navigate("/auth");
                    } else {
                      const element = document.querySelector("section");
                      element?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  size="lg"
                  className="bg-gradient-gold text-white rounded-full"
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
                <Button
                  onClick={() => navigate("/about")}
                  size="lg"
                  variant="outline"
                  className="border-primary/30 text-primary rounded-full"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
