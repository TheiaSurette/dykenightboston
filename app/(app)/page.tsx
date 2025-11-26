import { getPayloadClient } from '@/lib/payload';
import EventCard from '@/components/EventCard';
import NewsletterSignup from '@/components/NewsletterSignup';
import { unstable_cache } from 'next/cache';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { extractPlainText } from '@/lib/richText';

export const revalidate = 3600; // Revalidate every hour as fallback

export default async function Home() {
  const payload = await getPayloadClient();

  // Fetch upcoming events with ISR
  const eventsData = await unstable_cache(
    async () =>
      payload.find({
        collection: 'events',
        where: {
          date: { greater_than_equal: new Date().toISOString() },
        },
        limit: 6,
        sort: 'date',
        depth: 1,
      }),
    ['homepage-events-data'],
    { tags: ['homepage', 'events'], revalidate: 3600 }
  )();

  const events = eventsData.docs;

  return (
    <main className="min-h-screen bg-transparent pt-16">
      {/* Hero Section */}
      <section className="px-6 pl-16 pr-16 md:pl-28 md:pr-28 text-white">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <div className="flex justify-center">
              <Image
                src="/img/logo.png"
                alt="Dyke Night Boston"
                width={600}
                height={400}
                priority
                className="w-full h-full object-contain max-w-xl p-12 pb-8 "
              />
            </div>
            <p className="text-2xl md:text-3xl max-w-4xl mx-auto [text-shadow:2px_2px_6px_rgb(0_0_0/60%)]">
              Cruising for a Cause
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* Upcoming Events Section */}
      <section id="events" className="my-12 bg-transparent">
        <div className="container mx-auto px-4 pl-16 pr-16 md:pl-28 md:pr-28">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white [text-shadow:2px_2px_8px_rgb(0_0_0/60%)] mb-8">
              Upcoming <span className="text-red">Events</span>
            </h2>
          </div>
          {events && events.length > 0 ? (
            <>
              <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
                {await Promise.all(
                  events.map(async (event: any) => {
                    const descriptionText = event.description
                      ? await extractPlainText(event.description)
                      : '';
                    const truncatedDescription =
                      descriptionText.length > 150
                        ? descriptionText.substring(0, 150).trim() + '...'
                        : descriptionText;

                    // Convert old eventLinkUrl/eventLinkText to new eventLinks format for backward compatibility
                    let eventLinks = event.eventLinks || [];
                    if (event.eventLinkUrl && !eventLinks.length) {
                      eventLinks = [
                        {
                          url: event.eventLinkUrl,
                          text: event.eventLinkText || 'Event Link',
                        },
                      ];
                    }

                    return (
                      <div key={event.id} className="w-full max-w-md">
                        <EventCard
                          title={event.title}
                          slug={event.slug}
                          image={
                            event.image && typeof event.image === 'object' && event.image.url
                              ? { url: event.image.url, alt: event.title }
                              : undefined
                          }
                          date={event.date}
                          location={
                            event.location
                              ? {
                                  venueName: event.location.venueName || undefined,
                                  city: event.location.city || undefined,
                                  state: event.location.state || undefined,
                                }
                              : undefined
                          }
                          description={truncatedDescription || undefined}
                          eventLinks={eventLinks.length > 0 ? eventLinks : undefined}
                        />
                      </div>
                    );
                  })
                )}
              </div>
              <div className="text-center mt-6">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 text-red hover:text-red/80 font-medium transition-colors duration-200 group"
                >
                  <span>View All Events</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold mb-4 text-white [text-shadow:2px_2px_8px_rgb(0_0_0/60%)]">
                No Upcoming Events
              </h3>
              <p className="text-white/90 mb-8 max-w-md mx-auto [text-shadow:2px_2px_4px_rgb(0_0_0/60%)]">
                Check back soon for upcoming events and gatherings. Follow us for the latest
                updates.
              </p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 text-red hover:text-red/80 font-medium transition-colors duration-200 group [text-shadow:2px_2px_4px_rgb(0_0_0/60%)]"
              >
                <span>View All Events</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
