import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";

const LeadMagnet = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    setIsSubmitted(true);
  };

  return (
    <section className="py-24 bg-secondary">
      <div className="container px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div>
              <p className="text-primary text-sm font-medium mb-3">Free Resource</p>
              
              <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-5">
                Start Your Resilience Journey Today
              </h2>

              <p className="text-muted-foreground mb-6">
                Get your free mini e-book & video course with practical exercises
                to begin building your resilient mind immediately.
              </p>

              <ul className="space-y-3">
                {[
                  "5 Essential Resilience Techniques",
                  "Guided Meditation Audio",
                  "Printable Workbook (PDF)",
                  "Video Lessons",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <Check size={16} className="text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Form */}
            <div className="bg-card rounded-xl p-6 border border-border">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={24} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-serif font-semibold mb-2">
                    Thank You!
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Check your inbox for your free resources.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-serif font-semibold mb-2">
                    Get Free Access
                  </h3>
                  <p className="text-muted-foreground text-sm mb-5">
                    Enter your email to receive your free mini-course.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />

                    <button
                      type="submit"
                      className="w-full btn-primary gap-2"
                    >
                      Send Me Free Resources
                      <ArrowRight size={16} />
                    </button>

                    <p className="text-xs text-muted-foreground text-center">
                      No spam. Unsubscribe anytime.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadMagnet;