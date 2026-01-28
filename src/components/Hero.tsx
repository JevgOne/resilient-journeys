import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
        <div className="absolute inset-0 bg-foreground/5" />
      </div>

      <div className="container relative z-10 px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 backdrop-blur-sm rounded-full mb-8 animate-fade-in border border-gold/30">
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-sm font-sans font-semibold text-gold-dark">
              For Expat Women Worldwide
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6 animate-slide-up drop-shadow-sm">
            <span className="text-foreground">Build Your</span>{" "}
            <span className="text-gradient-gold drop-shadow-md">Resilient Mind</span>
            <br />
            <span className="text-foreground/95 font-semibold">Thrive Wherever You Are</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-foreground/80 font-sans font-medium leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-in drop-shadow-sm" style={{ animationDelay: "0.2s" }}>
            A transformative 12-month journey combining creative art expressive therapy and
            proven resilience techniques for expatriates and globally mobile individuals.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link
              to="/resilient-hub"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-sans font-semibold rounded-full shadow-gold hover:shadow-elevated transition-all duration-300 hover:scale-105"
            >
              Start Your Journey
              <ArrowRight size={18} />
            </Link>
            <button
              className="inline-flex items-center gap-2 px-8 py-4 bg-card/90 backdrop-blur-sm border border-border text-foreground font-sans font-medium rounded-full hover:bg-card transition-all duration-300 group"
            >
              <span className="w-10 h-10 flex items-center justify-center bg-gold/20 rounded-full group-hover:bg-gold/30 transition-colors">
                <Play size={16} className="text-gold ml-0.5" />
              </span>
              My Story
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in" style={{ animationDelay: "0.6s" }}>
            {[
              { number: "12", label: "Month Program" },
              { number: "1:1", label: "Personal Sessions" },
              { number: "Online", label: "& In-Person" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-serif font-bold text-gold drop-shadow-sm mb-1">
                  {stat.number}
                </div>
                <div className="text-xs md:text-sm font-sans font-medium text-foreground/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
