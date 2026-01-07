import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Basic",
    subtitle: "Essential Foundation",
    monthlyPrice: 27,
    yearlyPrice: 270,
    yearlySavings: "Save €54",
    description: "Perfect for self-guided learning with all core materials.",
    features: [
      "4 video lessons per month",
      "Downloadable worksheets & exercises",
      "Meditation & visualization library",
      "Private community access",
      "Monthly live Q&A session",
    ],
    cta: "Start Basic",
    featured: false,
  },
  {
    name: "Premium",
    subtitle: "Full Transformation",
    monthlyPrice: 47,
    yearlyPrice: 470,
    yearlySavings: "Save €94",
    description: "Complete program with personal guidance and materials.",
    features: [
      "Everything in Basic",
      "4 personal consultations/year (€348 value)",
      "Art therapy materials kit",
      "Priority email support",
      "Exclusive workshops access",
      "Partner & family resources",
    ],
    cta: "Go Premium",
    featured: true,
  },
  {
    name: "1:1 Session",
    subtitle: "Individual Support",
    monthlyPrice: 87,
    yearlyPrice: null,
    yearlySavings: null,
    description: "Deep personal work tailored to your unique needs.",
    features: [
      "60-minute private session",
      "Personalized action plan",
      "Follow-up resources",
      "Email support between sessions",
      "Flexible scheduling",
    ],
    cta: "Book Session",
    featured: false,
  },
];

const Pricing = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container px-6">
        {/* Header */}
        <div className="max-w-xl mb-16">
          <p className="text-primary text-sm font-medium mb-3">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
            Invest in Your Wellbeing
          </h2>
          <p className="text-muted-foreground">
            Choose the membership that fits your needs.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative rounded-xl p-6 ${
                tier.featured
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-4 inline-flex items-center gap-1 px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                  <Star size={10} />
                  Best Value
                </div>
              )}

              <div className="mb-5">
                <p
                  className={`text-xs font-medium mb-1 ${
                    tier.featured ? "text-primary-foreground/70" : "text-primary"
                  }`}
                >
                  {tier.subtitle}
                </p>
                <h3 className="text-xl font-serif font-semibold">
                  {tier.name}
                </h3>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-serif font-bold">
                    €{tier.monthlyPrice}
                  </span>
                  <span
                    className={`text-sm ${
                      tier.featured ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {tier.yearlyPrice ? "/month" : "/session"}
                  </span>
                </div>
                {tier.yearlyPrice && (
                  <p
                    className={`text-xs mt-1 ${
                      tier.featured ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    or €{tier.yearlyPrice}/year ({tier.yearlySavings})
                  </p>
                )}
              </div>

              <p
                className={`text-sm mb-5 ${
                  tier.featured ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {tier.description}
              </p>

              <ul className="space-y-2.5 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check
                      size={16}
                      className={`flex-shrink-0 mt-0.5 ${
                        tier.featured ? "text-primary-foreground" : "text-primary"
                      }`}
                    />
                    <span className="text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to={tier.name === "1:1 Session" ? "/booking" : "/resilient-hub"}
                className={`block w-full py-3 text-center font-medium text-sm rounded-lg transition-all ${
                  tier.featured
                    ? "bg-card text-foreground hover:bg-card/90"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;