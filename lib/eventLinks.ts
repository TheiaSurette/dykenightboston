import type { Event } from '@/payload-types';

type EventWithLegacyLinks = Pick<Event, 'eventLinks'> & {
  eventLinkUrl?: string;
  eventLinkText?: string;
};

export function getEventLinks(event: EventWithLegacyLinks) {
  const links = event.eventLinks || [];
  if (event.eventLinkUrl && !links.length) {
    return [{ url: event.eventLinkUrl, text: event.eventLinkText || 'Event Link' }];
  }
  return links;
}
