import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Moving to Spain was overwhelming until I found Resilient Mind. The creative techniques helped both me and my daughter process our feelings about the move.",
    name: "Sarah M.",
    role: "Expat Mom, Madrid",
    rating: 5,
  },
  {
    quote:
      "The 12-month program gave me structure when everything else felt chaotic. I finally feel like I belong here.",
    name: "Jennifer K.",
    role: "Expat Mom, Barcelona",
    rating: 5,
  },
  {
    quote:
      "The art therapy sessions opened up conversations with my kids that we never would have had otherwise. Truly transformative.",
    name: "Emma T.",
    role: "Expat Mom, Valencia",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24">
      <div className="container px-6">
        {/* Header */}
        <div className="max-w-xl mb-16">
          <p className="text-primary text-sm font-medium mb-3">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
            Stories of Transformation
          </h2>
          <p className="text-muted-foreground">
            Hear from other expat families who have walked this path.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6"
            >
              <Quote size={24} className="text-primary/20 mb-4" />

              {/* Rating */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="text-primary fill-primary"
                  />
                ))}
              </div>

              <p className="text-foreground text-sm leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              <div>
                <div className="font-medium text-sm">
                  {testimonial.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {testimonial.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;