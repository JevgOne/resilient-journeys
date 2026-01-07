import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import portrait from "@/assets/about-portrait.jpg";

const AboutPreview = () => {
  return (
    <section className="py-24">
      <div className="container px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
              <img
                src={portrait}
                alt="Your resilience coach"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Accent decoration */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-sage-light rounded-2xl -z-10" />
          </div>

          {/* Content */}
          <div>
            <p className="text-primary text-sm font-medium mb-3">About Me</p>
            
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-6">
              I Know What It Feels Like to Start Over
            </h2>

            <p className="text-muted-foreground leading-relaxed mb-5">
              Having lived as an expat in Australia and now Spain, I intimately 
              understand the challenges of building a new life abroad. The language 
              barriers, the cultural differences, and the constant feeling of being 
              slightly out of place.
            </p>

            <p className="text-muted-foreground leading-relaxed mb-8">
              Through my journey, I discovered the power of creative art therapy 
              and evidence-based resilience techniques. Now I help other expat 
              families develop the inner strength to truly thrive.
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {["Art Therapy", "Resilience Coaching", "Expat Experience"].map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-muted text-sm text-muted-foreground rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all"
            >
              Read My Full Story
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;