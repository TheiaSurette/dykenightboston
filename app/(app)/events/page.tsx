import { getPayloadClient } from '@/lib/payload';
import EventCard from '@/components/EventCard';
import { unstable_cache } from 'next/cache';
import { extractPlainText } from '@/lib/richText';

export const revalidate = 7200; // Revalidate every 2 hours as fallback

export default async function EventsPage() {
  const payload = await getPayloadClient();

  const eventsData = await unstable_cache(
    async () =>
      payload.find({
        collection: 'events',
        sort: 'date',
        limit: 100,
      }),
    ['events-page-data'],
    { tags: ['events-page', 'events'], revalidate: 7200 }
  )();

  const now = new Date();
  const upcomingEvents = eventsData.docs.filter((event: any) => new Date(event.date) >= now);
  const pastEvents = eventsData.docs.filter((event: any) => new Date(event.date) < now);

  return (
    <main className="min-h-screen bg-transparent pt-16">
      {/* Hero Section */}
      <section className="py-20 px-6 pl-16 pr-16 md:pl-28 md:pr-28 text-white relative overflow-hidden">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 [text-shadow:2px_2px_8px_rgb(0_0_0/60%)]">
              Upcoming <span className="text-red">Events</span>
            </h1>
          </div>

          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-8">
              {await Promise.all(
                upcomingEvents.map(async (event: any) => {
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
                    <div
                      key={event.id}
                      className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] max-w-sm"
                    >
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
          ) : (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold mb-4 text-white">No Events Scheduled</h3>
              <p className="text-white/80 mb-8 max-w-md mx-auto">
                Check back soon for upcoming events and gatherings. Follow us for the latest
                updates.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Past Events */}
      {pastEvents && pastEvents.length > 0 && (
        <section className="py-20 px-6 pl-16 pr-16 md:pl-28 md:pr-28 bg-transparent">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white [text-shadow:2px_2px_8px_rgb(0_0_0/60%)]">
                Past <span className="text-red">Events</span>
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {await Promise.all(
                pastEvents.map(async (event: any) => {
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
                    <div
                      key={event.id}
                      className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] max-w-sm"
                    >
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
          </div>
        </section>
      )}
    </main>
  );
}
