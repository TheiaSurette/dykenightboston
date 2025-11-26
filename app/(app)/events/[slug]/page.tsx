import { getPayloadClient } from '@/lib/payload';
import { serializeRichText } from '@/lib/richText';
import { unstable_cache } from 'next/cache';
import Image from 'next/image';
import { Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as LucideIcons from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // Revalidate every hour as fallback

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EventDetailsPage({ params }: Props) {
  const { slug } = await params;
  const payload = await getPayloadClient();

  const eventData = await unstable_cache(
    async () =>
      payload.find({
        collection: 'events',
        where: {
          slug: {
            equals: slug,
          },
        },
        limit: 1,
        depth: 1,
      }),
    [`event-${slug}`],
    { tags: [`event-${slug}`, 'events'], revalidate: 3600 }
  )();

  const event = eventData.docs[0];

  if (!event) {
    notFound();
  }

  // Serialize rich text description
  const descriptionHtml = event.description
    ? await serializeRichText(event.description)
    : '';

  // Format date
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  // Build location text
  const locationParts = [];
  if (event.location?.venueName && event.location.venueName !== 'Location TBD') {
    locationParts.push(event.location.venueName);
  }
  if (event.location?.address) {
    locationParts.push(event.location.address);
  }
  if (event.location?.city) {
    if (event.location?.state) {
      locationParts.push(`${event.location.city}, ${event.location.state}`);
    } else {
      locationParts.push(event.location.city);
    }
  }
  const locationText =
    locationParts.length > 0 ? locationParts.join(' | ') : 'Location TBD';

  // Helper function to get icon component from lucide-react
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

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
    <main className="min-h-screen bg-transparent pt-16">
      <section className="py-8 px-6 pl-16 pr-16 md:pl-28 md:pr-28">
        <div className="container mx-auto max-w-4xl">
          {/* Featured Image */}
          {event.image && typeof event.image === 'object' && event.image.url && (
            <div className="relative w-full h-96 md:h-[500px] mb-8 rounded-lg overflow-hidden">
              <Image
                src={event.image.url}
                alt={event.image.alt || event.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Event Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-8 text-white [text-shadow:2px_2px_8px_rgb(0_0_0/60%)]">
            {event.title}
          </h1>

          {/* Date and Location */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center text-white/90 [text-shadow:2px_2px_4px_rgb(0_0_0/60%)]">
              <Calendar className="w-6 h-6 mr-3 text-red" />
              <span className="text-lg">{formattedDate}</span>
            </div>
            <div className="flex items-center text-white/90 [text-shadow:2px_2px_4px_rgb(0_0_0/60%)]">
              <MapPin className="w-6 h-6 mr-3 text-red" />
              <span className="text-lg">{locationText}</span>
            </div>
          </div>

          {/* Full Description */}
          {descriptionHtml && (
            <div className="mb-8">
              <div
                className="payload-richtext text-lg text-white/90 [text-shadow:2px_2px_4px_rgb(0_0_0/60%)] prose prose-lg max-w-none prose-headings:text-white prose-p:text-white/90 prose-strong:text-white prose-a:text-red prose-a:hover:text-red/80 prose-ul:text-white/90 prose-ol:text-white/90 prose-li:text-white/90"
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </div>
          )}

          {/* Event Links */}
          {eventLinks.length > 0 && (
            <div className="mt-8 pt-8 border-t border-white/20">
              <h2 className="text-2xl font-bold mb-4 text-white [text-shadow:2px_2px_6px_rgb(0_0_0/60%)]">
                Event Links
              </h2>
              <div className="flex flex-wrap gap-4">
                {eventLinks.map((link: any, index: number) => {
                  const iconElement = getIcon(link.icon);
                  return (
                    <Button
                      key={index}
                      asChild
                      variant="outline"
                      className="rounded bg-transparent hover:bg-red/50 hover:border-red text-white border-white/30"
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        {iconElement && <span className="mr-2">{iconElement}</span>}
                        {link.text}
                      </a>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

