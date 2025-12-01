import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface EventLink {
  url: string;
  text: string;
  icon?: string;
}

interface EventCardProps {
  title: string;
  slug: string;
  image?: {
    url: string;
    alt: string;
  };
  date: string;
  location?: {
    city?: string;
    state?: string;
    venueName?: string;
  };
  description?: string;
  eventLinks?: EventLink[];
}

export default function EventCard({
  title,
  slug,
  image,
  date,
  location,
  description,
  eventLinks,
}: EventCardProps) {
  // Helper function to get icon component from lucide-react
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const locationParts = [];

  if (location?.venueName && location.venueName !== 'Location TBD') {
    locationParts.push(location.venueName);
  }

  if (location?.city) {
    if (location?.state) {
      locationParts.push(`${location.city}, ${location.state}`);
    } else {
      locationParts.push(location.city);
    }
  }

  const locationText = locationParts.length > 0 ? locationParts.join(' | ') : 'Location TBD';

  return (
    <Card className="overflow-hidden border-red/20 py-0 pb-6 bg-black/80 backdrop-blur-sm rounded w-full">
      {image && (
        <div className="relative h-48 w-full overflow-hidden rounded-t">
          <Image src={image.url} alt={image.alt} fill className="object-cover" />
        </div>
      )}
      <CardContent className="px-6 overflow-hidden">
        <Link href={`/events/${slug}`}>
          <h3 className="text-2xl font-bold mb-4 text-white hover:text-red transition-colors cursor-pointer">
            {title}
          </h3>
        </Link>
        <div className="space-y-2">
          <div className="flex items-center text-white/70">
            <Calendar className="w-5 h-5 mr-2" />
            {formattedDate}
          </div>
          <div className="flex items-center text-white/70">
            <MapPin className="w-5 h-5 mr-2" />
            {locationText}
          </div>
          {description && (
            <p className="text-white/70 text-sm mt-3 line-clamp-3 whitespace-pre-line">
              {description}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-6 pt-0 flex flex-col md:flex-row items-center gap-3 w-full overflow-hidden">
        {eventLinks && eventLinks.length > 0 ? (
          <>
            <Button
              asChild
              variant="outline"
              className="w-full md:w-auto md:flex-1 rounded bg-transparent hover:bg-red/50 hover:border-red text-white"
            >
              <Link href={`/events/${slug}`}>More Info</Link>
            </Button>
            {eventLinks.map((link, index) => {
              const iconElement = getIcon(link.icon);
              return (
                <Button
                  key={index}
                  asChild
                  variant="outline"
                  className="w-full md:w-auto md:flex-1 rounded bg-transparent hover:bg-red/50 hover:border-red text-white"
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {iconElement && <span className="mr-2">{iconElement}</span>}
                    {link.text}
                  </a>
                </Button>
              );
            })}
          </>
        ) : (
          <Button
            asChild
            variant="outline"
            className="w-full rounded bg-transparent hover:bg-red/50 hover:border-red text-white"
          >
            <Link href={`/events/${slug}`}>More Info</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
