import { BookOpen, Users, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: BookOpen,
    title: "Resilient Hub",
    subtitle: "12-Month Program",
    description:
      "A structured journey through 12 aspects of resilience, combining creative techniques with therapeutic approaches.",
    price: "from €27/month",
    href: "/resilient-hub",
    featured: true,
  },
  {
    icon: Users,
    title: "1:1 Sessions",
    subtitle: "Personal Guidance",
    description:
      "Individual consultations tailored to your unique challenges as an expat. Deep work on your personal resilience journey.",
    price: "€87/hour",
    href: "/booking",
    featured: false,
  },
  {
    icon: Calendar,
    title: "Workshops",
    subtitle: "Group Experience",
    description:
      "Interactive workshops for organizations, schools, and community centers. Innovative approaches to mental wellness.",
    price: "Custom pricing",
    href: "/booking",
    featured: false,
  },
];

const Services = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container px-6">
        {/* Header */}
        <div className="max-w-xl mb-16">
          <p className="text-primary text-sm font-medium mb-3">Services</p>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
            Your Path to Resilience
          </h2>
          <p className="text-muted-foreground">
            Choose the support that fits your journey.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Link
              key={index}
              to={service.href}
              className={`group p-6 rounded-xl transition-all duration-300 ${
                service.featured
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border hover:border-primary/30"
              }`}
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-lg mb-5 ${
                  service.featured
                    ? "bg-primary-foreground/10"
                    : "bg-muted"
                }`}
              >
                <service.icon
                  size={20}
                  className={service.featured ? "text-primary-foreground" : "text-primary"}
                />
              </div>

              <p
                className={`text-xs font-medium mb-1 ${
                  service.featured ? "text-primary-foreground/70" : "text-primary"
                }`}
              >
                {service.subtitle}
              </p>

              <h3
                className={`text-xl font-serif font-semibold mb-3 ${
                  service.featured ? "text-primary-foreground" : "text-foreground"
                }`}
              >
                {service.title}
              </h3>

              <p
                className={`text-sm leading-relaxed mb-5 ${
                  service.featured
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                }`}
              >
                {service.description}
              </p>

              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    service.featured ? "text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {service.price}
                </span>
                <ArrowRight
                  size={16}
                  className={`transition-transform group-hover:translate-x-1 ${
                    service.featured ? "text-primary-foreground" : "text-primary"
                  }`}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;