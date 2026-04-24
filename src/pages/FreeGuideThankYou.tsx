import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Download, Sun, Hand, Play, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const FreeGuideThankYou = () => {
  useEffect(() => {
    // Fire Meta Pixel Lead event
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-background flex flex-col">
      <SEO
        title="Thank You — Your Free Practice Kit Is Ready! | Resilient Mind"
        description="Download your free 7-day practice kit with workbooks and guided EFT video."
        path="/thank-you"
      />
      <header className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <div className="flex justify-center mb-8">
            <Link to="/">
              <Logo className="h-16 w-auto" />
            </Link>
          </div>

          <Card className="border-gold/20 shadow-elegant">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-gold/10 p-4">
                  <CheckCircle2 className="h-12 w-12 text-gold" />
                </div>
              </div>
              <CardTitle className="font-serif text-2xl">
                Your Free 7-Day Practice Kit Is Ready!
              </CardTitle>
              <CardDescription className="text-base mt-2">
                We've also sent the kit to your email so you can access it anytime.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border-2 border-gold/60 bg-gold/10 p-5 text-center shadow-sm">
                <p className="text-base font-bold text-foreground">
                  📧 Can't find the email?
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please check your <span className="font-semibold text-foreground">Promotions</span> or <span className="font-semibold text-foreground">Spam</span> folder, and add <span className="font-semibold text-gold">contact@resilientmind.io</span> to your contacts so you don't miss your materials.
                </p>
              </div>
              {/* Download: Gratitude Workbook */}
              <a
                href="/assets/7-Day-Gratitude-Workbook.pdf"
                download
                className="flex items-center gap-4 p-4 rounded-xl border border-gold/20 bg-cream/30 hover:bg-gold/5 transition-colors group"
              >
                <div className="rounded-full bg-gold/10 p-3 group-hover:bg-gold/20 transition-colors">
                  <Sun className="h-6 w-6 text-gold" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">7-Day Gratitude Workbook</p>
                  <p className="text-sm text-muted-foreground">Morning practice & evening reflection</p>
                </div>
                <Download className="h-5 w-5 text-gold" />
              </a>

              {/* Download: EFT Workbook */}
              <a
                href="/assets/7-Day-EFT-Workbook-for-Expats.pdf"
                download
                className="flex items-center gap-4 p-4 rounded-xl border border-gold/20 bg-cream/30 hover:bg-gold/5 transition-colors group"
              >
                <div className="rounded-full bg-gold/10 p-3 group-hover:bg-gold/20 transition-colors">
                  <Hand className="h-6 w-6 text-gold" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">7-Day EFT Tapping Workbook</p>
                  <p className="text-sm text-muted-foreground">Release stress & rebuild confidence</p>
                </div>
                <Download className="h-5 w-5 text-gold" />
              </a>

              {/* Video placeholder */}
              <div className="flex items-center gap-4 p-4 rounded-xl border border-gold/20 bg-cream/30">
                <div className="rounded-full bg-gold/10 p-3">
                  <Play className="h-6 w-6 text-gold" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Guided EFT Tapping Video</p>
                  <p className="text-sm text-muted-foreground">Create a free account at resilientmind.io/auth to access</p>
                </div>
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="pt-4 border-t border-gold/10">
                <p className="text-sm text-muted-foreground text-center">
                  Love to share? Send your friends{' '}
                  <span className="font-medium text-gold">resilientmind.io/free-guide</span>{' '}
                  so they can get their own copy.
                </p>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-full border-gold/30 hover:bg-gold/5"
              >
                <Link to="/">Return to homepage</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FreeGuideThankYou;
