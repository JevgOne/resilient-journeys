import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Video, MapPin } from "lucide-react";
import BookingForm from "@/components/booking/BookingForm";

const Booking = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-warm">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <Calendar size={16} className="text-primary" />
                <span className="text-sm font-sans font-medium text-primary">
                  Book a Session
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-serif font-semibold mb-6">
                Let's Work <span className="text-gradient-gold">Together</span>
              </h1>

              <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
                Whether you prefer online sessions from anywhere in the world or in-person
                meetings in Spain, I'm here to support your journey to resilience.
              </p>
            </div>
          </div>
        </section>

        {/* How Sessions Work */}
        <section className="py-12 bg-card border-b border-border">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-6 bg-background rounded-2xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Video size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-lg mb-2">Online Sessions</h3>
                    <p className="text-muted-foreground font-sans text-sm">
                      Connect from anywhere in the world via secure video call.
                      Perfect for busy schedules and families across time zones.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-background rounded-2xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-lg mb-2">In-Person Sessions</h3>
                    <p className="text-muted-foreground font-sans text-sm">
                      Available in select locations in Spain. In-person sessions
                      allow for deeper hands-on creative work.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-4xl font-serif font-semibold mb-4">
                  Book Your Session
                </h2>
                <p className="text-muted-foreground font-sans">
                  Choose your session type, select a convenient time, and you're all set.
                </p>
              </div>

              <BookingForm />
            </div>
          </div>
        </section>

        {/* Contact Alternative */}
        <section className="py-12 bg-card">
          <div className="container px-4">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-muted-foreground font-sans">
                Have questions before booking? Feel free to reach out directly at{' '}
                <a
                  href="mailto:silvie@artexpressivetherapy.com"
                  className="text-gold hover:underline"
                >
                  silvie@artexpressivetherapy.com
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;
