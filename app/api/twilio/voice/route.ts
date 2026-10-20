import twilio from 'twilio';
import { hasValidAnnouncementCharacters } from '@/lib/phoneAnnouncement';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const webhookUrl = process.env.TWILIO_VOICE_WEBHOOK_URL;
  if (!authToken || !webhookUrl) {
    return new Response('Voice webhook is not configured', { status: 500 });
  }

  let canonicalUrl: URL;
  try {
    canonicalUrl = new URL(webhookUrl);
    if (canonicalUrl.protocol !== 'https:' || canonicalUrl.username || canonicalUrl.password || canonicalUrl.hash) {
      throw new Error('Invalid public webhook URL');
    }
  } catch {
    return new Response('Voice webhook is not configured', { status: 500 });
  }

  const signature = request.headers.get('x-twilio-signature');
  const incomingUrl = new URL(request.url);
  if (!signature || incomingUrl.pathname !== canonicalUrl.pathname || incomingUrl.search !== canonicalUrl.search) {
    return new Response('Forbidden', { status: 403 });
  }
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/x-www-form-urlencoded') {
    return new Response('Expected form-encoded request', { status: 415 });
  }

  const form = new URLSearchParams(await request.text());
  const parameters: Record<string, string | string[]> = Object.create(null);
  for (const key of new Set(form.keys())) {
    const values = form.getAll(key);
    parameters[key] = values.length === 1 ? values[0] : values;
  }
  if (!twilio.validateRequest(authToken, signature, webhookUrl, parameters)) {
    return new Response('Forbidden', { status: 403 });
  }

  let message = 'Thanks for calling Dyke Night Boston. Information is temporarily unavailable. Please visit our website.';
  try {
    const { getPayloadClient } = await import('@/lib/payload');
    const payload = await getPayloadClient();
    const announcement = await payload.findGlobal({ slug: 'phone-announcement', overrideAccess: true });
    if (typeof announcement.message === 'string' && announcement.message.trim()
      && hasValidAnnouncementCharacters(announcement.message)) {
      message = announcement.message;
    }
  } catch {
    console.error('Unable to load Phone announcement; using fallback.');
  }

  const response = new twilio.twiml.VoiceResponse();
  response.say({ voice: 'woman', language: 'en-US', loop: 1 }, message);
  response.hangup();
  return new Response(response.toString(), {
    headers: { 'Content-Type': 'text/xml; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
