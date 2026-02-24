import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import PricingCards, { PricingTrustSignals, EarlyBirdBanner } from "@/components/PricingCards";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const SESSION_TIER = {
  name: "1:1 Session",
  price: 107,
  period: "/session",
  features: [
    "60-minute private session",
    "Personalized action plan",
    "Follow-up resources",
    "Online or in-person (Spain)",
    "Flexible scheduling",
  ],
  buttonText: "Book Session",
};

const Pricing = () => {
  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background" />
        <div className="absolute inset-0 bg-foreground/8" />
      </div>

      <div className="container relative z-10 px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-sans font-medium text-primary">
              Simple Pricing
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold mb-4">
            From Navigating Life Abroad to Truly <span className="text-gradient-gold">Thriving</span>
          </h2>
          <p className="text-lg text-foreground/90 font-sans">
            A 12-month guided membership program that transforms the loneliness, uncertainty, and cultural stress of expat life into your greatest strengths.
          </p>

          <div className="mt-6">
            <EarlyBirdBanner />
          </div>
        </div>

        {/* Membership Cards */}
        <div className="max-w-7xl mx-auto mb-8">
          <PricingCards cancelUrl="/" />
          <PricingTrustSignals />
        </div>

        {/* Membership description */}
        <p className="text-center text-foreground/80 font-sans leading-relaxed max-w-3xl mx-auto mt-8 mb-4">
          Through Resilient Mind Membership Program, you will explore personal beliefs that may be limiting your progress, develop greater self-awareness, and create space to enjoy the simple, meaningful moments of your life with clarity and presence.
        </p>

        {/* 1:1 Session Card */}
        <div className="max-w-md mx-auto mt-12">
          <div className="bg-card/80 backdrop-blur-sm rounded-3xl border border-border/60 p-1 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_8px_30px_-12px_hsla(30,25%,30%,0.12)]">
            <div className="rounded-[1.25rem] bg-gradient-to-b from-background/60 to-background/30 p-6 pt-8">
              <h3 className="text-center text-lg font-serif font-semibold text-foreground mb-5">
                {SESSION_TIER.name}
              </h3>
              <div className="text-center mb-2">
                <div className="inline-flex items-baseline gap-0.5">
                  <span className="text-sm font-sans font-medium text-muted-foreground/70 -mr-0.5">€</span>
                  <span className="text-4xl font-serif font-bold tracking-tight text-foreground">
                    {SESSION_TIER.price}
                  </span>
                </div>
                <div className="text-sm font-sans text-muted-foreground mt-0.5">
                  {SESSION_TIER.period}
                </div>
              </div>
              <div className="w-12 h-px bg-border/80 mx-auto my-5" />
              <ul className="space-y-3 mb-8">
                {SESSION_TIER.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-foreground/80">
                    <div className="w-4 h-4 rounded-full bg-primary/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={10} className="text-primary" strokeWidth={3} />
                    </div>
                    <span className="font-sans">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full rounded-full h-11 font-sans font-medium text-sm bg-primary hover:bg-primary/90 transition-all">
                <Link to="/booking">
                  {SESSION_TIER.buttonText}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
