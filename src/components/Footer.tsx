import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-16 border-t border-border">
      <div className="container px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="font-serif text-xl font-semibold tracking-tight">
              Resilient Mind
            </Link>
            <p className="text-muted-foreground text-sm mt-4 max-w-xs">
              Helping expat families build resilience through creative art therapy
              and evidence-based techniques.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-sm mb-4">Explore</h4>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Resilient Hub", href: "/resilient-hub" },
                { label: "Booking", href: "/booking" },
                { label: "Blog", href: "/blog" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium text-sm mb-4">Contact</h4>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li>hello@resilientmind.com</li>
              <li>Spain (GMT+1)</li>
            </ul>
            <Link
              to="/booking"
              className="btn-primary mt-6 text-sm"
            >
              Book a Call
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Resilient Mind. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;