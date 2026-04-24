import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import PageHero from "@/components/PageHero";
import SEO from "@/components/SEO";
import PricingCards, { PricingTrustSignals } from "@/components/PricingCards";
import { Crown, Sparkles } from "lucide-react";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing — Membership Plans from €37 | Resilient Mind"
        description="Choose from Basic or Premium membership plans. Pay as you go from €37 or yearly from €370. One-time payments, no auto-renewal. Includes video lessons, workbooks and more."
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
              price: "37",
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
        {/* Hero — Headline + Problem */}
        <PageHero>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Sparkles size={16} className="text-primary" />
              <span className="text-sm font-sans font-medium text-primary">
                For Expats Ready to Thrive
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
              From Navigating Life Abroad to Truly Thriving
            </h1>

            <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto leading-relaxed">
              For expat women who feel overwhelmed, disconnected, or stuck between two worlds.
            </p>
          </div>
        </PageHero>

        {/* Problem — resonance */}
        <section className="py-14 bg-cream/30">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center mb-8">
                Does This Sound Like You?
              </h2>
              <ul className="space-y-4 text-base md:text-lg font-sans text-foreground/90 leading-relaxed">
                {[
                  "You feel disconnected — like you don't fully belong anywhere, stuck between two worlds.",
                  "The loneliness creeps in, even when your day looks busy.",
                  "Adapting is exhausting, and your nervous system never quite switches off.",
                  "You love the life you've built abroad, but you've lost parts of yourself in the process.",
                  "You want support — but no one around you truly understands what expat life does to your body, mind, and identity.",
                ].map((text, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="text-primary font-serif text-xl leading-none mt-1">◆</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Solution — how membership solves it */}
        <section className="py-14">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center mb-4">
                The Resilient Mind Membership Is Built for You
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-10 max-w-2xl mx-auto leading-relaxed">
                A guided monthly practice designed specifically for expat women — so you can come home to yourself, no matter where in the world you live.
              </p>
              <ul className="space-y-4 max-w-2xl mx-auto text-base md:text-lg font-sans text-foreground/90 leading-relaxed">
                {[
                  { emoji: "🤲", bold: "Guided EFT tapping", rest: "— calm your nervous system on demand" },
                  { emoji: "🧠", bold: "One monthly theme", rest: "— loneliness, cultural stress, health, boundaries, stability" },
                  { emoji: "🫶", bold: "A community of women", rest: "who actually get it (Premium)" },
                  { emoji: "📄", bold: "Practical workbooks", rest: "— real tools for real life abroad" },
                  { emoji: "🤍", bold: "Your safe members-only space", rest: "— no pressure, no performance" },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="text-xl leading-none mt-0.5">{item.emoji}</span>
                    <span><strong className="font-semibold text-foreground">{item.bold}</strong> {item.rest}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-center text-foreground/80 font-sans italic leading-relaxed max-w-2xl mx-auto">
                Every month you come back to practices that rebuild your sense of belonging, safety, and inner strength.
              </p>
            </div>
          </div>
        </section>

        {/* Offer — Pricing */}
        <section className="py-12">
          <div className="container px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center mb-4">
                Invest in Your Transformation
              </h2>
              <p className="text-center text-muted-foreground font-sans mb-12 max-w-2xl mx-auto leading-relaxed">
                Now is your moment to invest in your body, mind, and resilience — and step into a life of clarity, calm and confidence, no matter where the world takes you.
              </p>

              <PricingCards cancelUrl="/pricing" />
              <PricingTrustSignals />
            </div>
          </div>
        </section>

        {/* Trust / Authority */}
        <section className="py-12">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-muted-foreground font-sans leading-relaxed">
                Using my <span className="text-foreground font-medium">13 years of experience living abroad</span> and my expertise in personal development, expressive arts, and holistic therapies, I created an online membership program that transforms these challenges into opportunities for growth and inner strength.
              </p>
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
