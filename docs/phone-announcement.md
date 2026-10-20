# Phone announcement

Admins and editors can open **Content → Phone announcement** in Payload and save
one plain-text message. Saving makes it live for the next caller. The message is
required, cannot contain only whitespace, and is limited to 1,500 characters
(approximately two minutes of speech). There is no separate publish step.

An incoming call hears the saved message once in US English using Twilio's basic
`woman` voice, then hangs up. Calls already playing a response finish that version.
If the setting has not been saved or the CMS cannot be read, the response says:

> Thanks for calling Dyke Night Boston. Information is temporarily unavailable. Please visit our website.

The webhook responds to `POST /api/twilio/voice` with TwiML XML. CMS API reads and
updates require an existing admin or editor account. The webhook authenticates
Twilio before loading content; it does not store caller details or call logs.

## Configuration

The endpoint requires these server-side environment variables:

- `TWILIO_AUTH_TOKEN`: the Auth Token for the Twilio account owning the number.
  This is not an API key or Account SID. Keep it in the hosting secret store or
  an ignored local environment file.
- `TWILIO_VOICE_WEBHOOK_URL`: the exact public HTTPS URL configured in Twilio,
  for example `https://your-domain.example/api/twilio/voice`. Include any query
  string exactly as configured, including parameter order and encoding. Avoid
  redirects or trailing-slash differences.

The configured URL supplies the public origin for signature validation, so local
HTTP and a reverse proxy do not require trusting forwarded host headers. The
request path and query must still match that URL. A wrong public URL or token
causes valid calls to be rejected. Missing credentials or an invalid public URL
produce a server error; unsigned or incorrectly signed requests receive 403.
Only form-encoded POST requests are accepted.

The CMS uses the existing Payload and database environment configuration. The
new global has a registered PostgreSQL migration. Apply the repo's migrations
with `pnpm payload migrate` through the established deployment process before
serving calls; no schema or database setting changes are required for this feature.

## Local verification

1. Install dependencies with `pnpm install`. Configure the existing local database
   and Payload secret in `.env.local` and start the app with `pnpm dev:next`.
2. Use an HTTPS tunnel forwarding to your local Next.js port when testing Twilio
   delivery. Set `TWILIO_VOICE_WEBHOOK_URL` to that tunnel's exact public webhook
   URL, and restart the app when environment values change. Update the URL when
   the tunnel hostname changes.
3. Sign a local smoke request using the same values as the server. The command
   below sends only to your local app and never prints the token or signature:

```sh
node --env-file=.env.local --input-type=module <<'JS'
import twilio from 'twilio';
const publicUrl = process.env.TWILIO_VOICE_WEBHOOK_URL;
const token = process.env.TWILIO_AUTH_TOKEN;
if (!publicUrl || !token) throw new Error('Configure the Twilio environment values first.');
const url = new URL(publicUrl);
const params = { CallSid: 'CA-local-smoke-test', From: '+16175550123', To: '+16175550456' };
const signature = twilio.getExpectedTwilioSignature(token, publicUrl, params);
const response = await fetch(`http://localhost:3000${url.pathname}${url.search}`, {
  method: 'POST',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'x-twilio-signature': signature,
  },
  body: new URLSearchParams(params),
});
console.log(response.status, await response.text());
JS
```

4. Expect HTTP 200 and one `<Say>` followed by `<Hangup>`. Save another message in
   Payload and repeat; the next response should contain the new text. An unsigned
   request should return 403. These checks do not synthesize or play audio.

## Automated checks

Run `pnpm test`. Prerequisites are Node.js 20.19+ or 22+, pnpm, and PostgreSQL
binaries (`initdb`, `pg_ctl`, and `postgres`) on PATH, running as a non-root user.
No Docker, existing database, Twilio credentials, or live number is needed.

The suite creates a disposable PostgreSQL cluster in the OS temporary directory
and starts Next.js on an available local port with fake credentials. It bootstraps
the existing schema, runs the new migration down/up/down/up, then disables schema
push before testing the actual HTTP APIs. It exercises authenticated CMS saves,
access restrictions, validation, signed webhook requests, XML escaping, freshness,
missing configuration, and a real database outage. Normal completion stops the
app and database and removes the temporary cluster. Do not run it concurrently
with a dev server in the same checkout because both use Next's `.next` directory.
If the process is forcibly killed, stop any leftover test app and cluster first.

## Later production hookup

Deployment and live number changes are separate from this implementation. When
ready, deploy the code and migration, set the two server environment variables,
and use Twilio Console's active number settings to configure **A call comes in →
Webhook**, the exact public URL, and **HTTP POST**. An Account SID is not needed
by this inbound endpoint.

Make a real test call after connecting the number. Verify pronunciation of event
names, dates, prices, and addresses, one playback, and hangup. Automated checks
cover the XML contract; audio quality requires this real call. No number has been
purchased, connected, or called as part of the implementation.

References: [Twilio Voice webhooks](https://www.twilio.com/docs/usage/webhooks/voice-webhooks),
[signature validation](https://www.twilio.com/docs/usage/security), and
[Say voice and language settings](https://www.twilio.com/docs/voice/twiml/say).
