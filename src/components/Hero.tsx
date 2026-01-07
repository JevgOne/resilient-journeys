import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="min-h-[90vh] flex items-center pt-16">
      <div className="container px-6 py-20 md:py-32">
        <div className="max-w-3xl">
          {/* Tag */}
          <div className="inline-block px-3 py-1 bg-sage-light text-primary text-xs font-medium rounded-full mb-6 animate-fade-in">
            For Expat Women in Spain
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold leading-[1.1] mb-6 animate-slide-up">
            Build Your
            <br />
            <span className="text-primary">Resilient Mind</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg text-muted-foreground font-sans leading-relaxed max-w-xl mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            A 12-month journey combining creative art therapy and evidence-based 
            techniques for expat families navigating life abroad.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Link to="/resilient-hub" className="btn-primary gap-2">
              Start Your Journey
              <ArrowRight size={16} />
            </Link>
            <Link to="/about" className="btn-secondary">
              Learn More
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-12 mt-16 pt-8 border-t border-border animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {[
              { number: "500+", label: "Families" },
              { number: "12", label: "Months" },
              { number: "10+", label: "Years" },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-2xl font-serif font-semibold text-foreground mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;