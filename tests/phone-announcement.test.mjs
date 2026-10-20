import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import twilio from 'twilio';
import { XMLParser } from 'fast-xml-parser';
import pgClient from 'pg';
import { drizzle } from '@payloadcms/db-postgres/drizzle/node-postgres';
import { up, down } from '../migrations/20261020_add_phone_announcement.ts';

// Agreed seam: real HTTP requests to Payload and the voice webhook, backed by
// a disposable PostgreSQL cluster. No application modules are mocked.
const fallback = 'Thanks for calling Dyke Night Boston. Information is temporarily unavailable. Please visit our website.';
const publicUrl = 'https://phone.example.test/api/twilio/voice?source=phone';
const authToken = 'test-auth-token-never-used-outside-tests';
const parser = new XMLParser({ ignoreAttributes: false, preserveOrder: true });
let cluster;
let pgPort;
let appPort;
let app;
let appLog = '';
let pgRunning = false;
let adminToken;
let editorToken;

async function freePort() {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

function pg(command) {
  execFileSync('pg_ctl', ['-D', cluster, '-w', ...command], { stdio: 'pipe' });
}

async function stopApp() {
  if (!app || app.exitCode !== null || app.signalCode !== null) return;
  const exited = once(app, 'exit');
  app.kill('SIGTERM');
  await exited;
}

async function startApp(overrides = {}) {
  await stopApp();
  appLog = '';
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    VERCEL: '',
    DATABASE_URI: `postgresql://${process.env.USER}@127.0.0.1:${pgPort}/postgres`,
    POSTGRES_URL: '',
    PAYLOAD_SECRET: 'disposable-phone-announcement-test-secret',
    NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${appPort}`,
    TWILIO_AUTH_TOKEN: authToken,
    TWILIO_VOICE_WEBHOOK_URL: publicUrl,
    SUPABASE_STORAGE_BUCKET: '',
    SUPABASE_STORAGE_ACCESS_KEY_ID: '',
    SUPABASE_STORAGE_SECRET_ACCESS_KEY: '',
    SUPABASE_STORAGE_ENDPOINT: '',
    NEXT_TELEMETRY_DISABLED: '1',
    ...overrides,
  };
  app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', String(appPort)], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  app.stdout.on('data', (data) => { appLog += data; });
  app.stderr.on('data', (data) => { appLog += data; });
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (app.exitCode !== null) throw new Error(`Next exited: ${appLog}`);
    let response;
    try {
      response = await fetch(`http://127.0.0.1:${appPort}/api/users/init`, { signal: AbortSignal.timeout(60_000) });
    } catch { /* Server is still starting. */ }
    if (response?.ok) return;
    if (response?.status === 500) throw new Error(`Application initialization failed: ${appLog}`);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Next did not become ready: ${appLog}`);
}

before(async () => {
  cluster = await mkdtemp(path.join(tmpdir(), 'phone-announcement-pg-'));
  pgPort = await freePort();
  appPort = await freePort();
  execFileSync('initdb', ['-D', cluster, '--auth=trust', '--encoding=UTF8', '--no-locale'], { stdio: 'pipe' });
  pg(['-l', path.join(cluster, 'server.log'), '-o', `-h 127.0.0.1 -p ${pgPort} -k ${cluster}`, 'start']);
  pgRunning = true;
  // Bootstrap the existing schema using the repo's dev push mode, then prove
  // the migration can replace the generated table and round-trip before the
  // HTTP checks run with schema push disabled.
  await startApp({ VERCEL: '1' });
  await stopApp();
  const pool = new pgClient.Pool({ connectionString: `postgresql://${process.env.USER}@127.0.0.1:${pgPort}/postgres` });
  try {
    const db = drizzle(pool);
    await down({ db });
    await up({ db });
    await down({ db });
    await up({ db });
  } finally {
    await pool.end();
  }
  await startApp();
  const registered = await api('/api/users/first-register', { method: 'POST', data: { email: 'admin@example.test', password: 'test-password-123!', name: 'Test admin', role: 'admin' } });
  assert.equal(registered.status, 200, await registered.clone().text());
  adminToken = (await registered.json()).token;
}, { timeout: 180_000 });

after(async () => {
  await stopApp();
  if (pgRunning) pg(['-m', 'immediate', 'stop']);
  if (cluster) await rm(cluster, { recursive: true, force: true });
});

async function api(route, { method = 'GET', token, data } = {}) {
  return fetch(`http://127.0.0.1:${appPort}${route}`, {
    method,
    headers: { ...(data ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: `JWT ${token}` } : {}) },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
}

async function voice({ signature, params = { CallSid: 'CA123', From: '+16175550123', To: '+16175550456' }, signingUrl = publicUrl, query = '?source=phone' } = {}) {
  const body = new URLSearchParams(params);
  return fetch(`http://127.0.0.1:${appPort}/api/twilio/voice${query}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'x-twilio-signature': signature ?? twilio.getExpectedTwilioSignature(authToken, signingUrl, params),
    },
    body,
  });
}

async function assertSpoken(response, expected) {
  assert.equal(response.status, 200, await response.clone().text());
  assert.match(response.headers.get('content-type'), /(?:text|application)\/xml/);
  const xml = parser.parse(await response.text());
  const children = xml.find((node) => node.Response).Response;
  assert.deepEqual(children.map((node) => Object.keys(node)[0]), ['Say', 'Hangup']);
  assert.equal(children[0].Say[0]['#text'], expected);
  assert.equal(children[0][':@']['@_language'], 'en-US');
  assert.equal(children[0][':@']['@_voice'], 'woman');
  assert.equal(children[0][':@']['@_loop'] ?? '1', '1');
}

test('an unconfigured Phone announcement speaks the fallback once and hangs up', async () => {
  await assertSpoken(await voice(), fallback);
});

test('unsigned requests cannot retrieve a Phone announcement', async () => {
  const response = await voice({ signature: '' });
  assert.equal(response.status, 403);
  assert.doesNotMatch(await response.text(), /<Say/);
});


test('an admin can save the Phone announcement and callers immediately hear it', async () => {
  const response = await api('/api/globals/phone-announcement', { method: 'POST', token: adminToken, data: { message: 'Our next event is Friday.' } });
  assert.equal(response.status, 200, await response.clone().text());
  await assertSpoken(await voice(), 'Our next event is Friday.');
});

test('anonymous users cannot read or save the Phone announcement through Payload', async () => {
  const read = await api('/api/globals/phone-announcement');
  assert.equal(read.status, 403);
  const save = await api('/api/globals/phone-announcement', { method: 'POST', data: { message: 'Unauthorized change' } });
  assert.equal(save.status, 403);
  await assertSpoken(await voice(), 'Our next event is Friday.');
});

test('an editor can read and update the shared announcement without a publish step', async () => {
  const created = await api('/api/users', { method: 'POST', token: adminToken, data: { email: 'editor@example.test', password: 'test-password-123!', name: 'Test editor', role: 'editor' } });
  assert.equal(created.status, 201, await created.clone().text());
  const login = await api('/api/users/login', { method: 'POST', data: { email: 'editor@example.test', password: 'test-password-123!' } });
  assert.equal(login.status, 200);
  editorToken = (await login.json()).token;
  const read = await api('/api/globals/phone-announcement', { token: editorToken });
  assert.equal(read.status, 200);
  assert.equal((await read.json()).message, 'Our next event is Friday.');
  const response = await api('/api/globals/phone-announcement', { method: 'POST', token: editorToken, data: { message: 'The event has moved to Saturday.' } });
  assert.equal(response.status, 200, await response.clone().text());
  await assertSpoken(await voice(), 'The event has moved to Saturday.');
});

test('blank or whitespace-only announcements cannot replace saved content', async () => {
  for (const message of ['', ' \n\t ']) {
    const response = await api('/api/globals/phone-announcement', { method: 'POST', token: editorToken, data: { message } });
    assert.equal(response.status, 400, await response.clone().text());
  }
  await assertSpoken(await voice(), 'The event has moved to Saturday.');
});

test('the 1,500-character editorial limit accepts the boundary and rejects overflow', async () => {
  const accepted = await api('/api/globals/phone-announcement', { method: 'POST', token: editorToken, data: { message: 'a'.repeat(1500) } });
  assert.equal(accepted.status, 200);
  const rejected = await api('/api/globals/phone-announcement', { method: 'POST', token: editorToken, data: { message: 'a'.repeat(1501) } });
  assert.equal(rejected.status, 400);
  await assertSpoken(await voice(), 'a'.repeat(1500));
});

test('markup and special characters remain plain spoken text and earlier responses stay unchanged', async () => {
  const message = 'Doors at 8 & tickets < $20. <Hangup/> "Everyone" is welcome.';
  const saved = await api('/api/globals/phone-announcement', { method: 'POST', token: editorToken, data: { message } });
  assert.equal(saved.status, 200);
  const earlierResponse = await voice();
  const changed = await api('/api/globals/phone-announcement', { method: 'POST', token: adminToken, data: { message: 'The latest announcement.' } });
  assert.equal(changed.status, 200);
  await assertSpoken(earlierResponse, message);
  await assertSpoken(await voice(), 'The latest announcement.');
});


test('Unicode text, emoji, line breaks, and tabs remain valid spoken text', async () => {
  const message = 'Olá Boston 🏳️‍🌈! Doors at 8.\nTickets:\t$20.';
  const response = await api('/api/globals/phone-announcement', { method: 'POST', token: editorToken, data: { message } });
  assert.equal(response.status, 200, await response.clone().text());
  await assertSpoken(await voice(), message);
  const restored = await api('/api/globals/phone-announcement', { method: 'POST', token: adminToken, data: { message: 'The latest announcement.' } });
  assert.equal(restored.status, 200);
});


test('characters that cannot be spoken through XML cannot replace a valid announcement', async () => {
  for (const message of ['hello\u0001world', 'hello\uffffworld', 'hello\ud800world']) {
    const response = await api('/api/globals/phone-announcement', { method: 'POST', token: editorToken, data: { message } });
    assert.equal(response.status, 400, await response.clone().text());
    assert.match(await response.text(), /characters.*cannot.*read aloud/i);
  }
  await assertSpoken(await voice(), 'The latest announcement.');
});


test('unreadable legacy content uses the fallback instead of breaking the call', async () => {
  const pool = new pgClient.Pool({ connectionString: `postgresql://${process.env.USER}@127.0.0.1:${pgPort}/postgres` });
  try {
    // Fixture for old/imported content that predates CMS validation. Assertions
    // remain at the signed HTTP webhook boundary.
    for (const message of ['hello\u0001world', 'hello\uffffworld']) {
      await pool.query('UPDATE phone_announcement SET message = $1', [message]);
      await assertSpoken(await voice(), fallback);
    }
  } finally {
    await pool.end();
    const restored = await api('/api/globals/phone-announcement', { method: 'POST', token: adminToken, data: { message: 'The latest announcement.' } });
    assert.equal(restored.status, 200);
  }
});

for (const [name, options] of [
  ['an invalid signature', { signature: 'invalid' }],
  ['a signature for another public URL', { signingUrl: 'https://wrong.example.test/api/twilio/voice?source=phone' }],
  ['a changed form parameter', { signature: twilio.getExpectedTwilioSignature(authToken, publicUrl, { CallSid: 'CA123', From: '+16175550123', To: '+16175550456' }), params: { CallSid: 'CA123', From: '+16175550123', To: '+16175550456', Extra: 'tampered' } }],
  ['an added query parameter', { query: '?source=phone&extra=tampered' }],
]) {
  test(`${name} cannot disclose saved announcement content`, async () => {
    const response = await voice(options);
    assert.equal(response.status, 403);
    assert.doesNotMatch(await response.text(), /latest announcement|<Say/);
  });
}

test('all form parameters, repeated values, and whitespace participate in validation', async () => {
  const params = { CallSid: 'CA456', FutureTwilioField: [' value ', 'another'], From: '+16175550123' };
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const item of Array.isArray(value) ? value : [value]) body.append(key, item);
  }
  const response = await fetch(`http://127.0.0.1:${appPort}/api/twilio/voice?source=phone`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', 'x-twilio-signature': twilio.getExpectedTwilioSignature(authToken, publicUrl, params), 'x-forwarded-host': 'attacker.example.test' },
    body,
  });
  await assertSpoken(response, 'The latest announcement.');
});

test('unsupported request formats and methods do not disclose content', async () => {
  const response = await fetch(`http://127.0.0.1:${appPort}/api/twilio/voice?source=phone`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-twilio-signature': 'invalid' }, body: '{}' });
  assert.equal(response.status, 415);
  const get = await fetch(`http://127.0.0.1:${appPort}/api/twilio/voice?source=phone`);
  assert.equal(get.status, 405);
});

for (const [name, overrides] of [
  ['missing Auth Token', { TWILIO_AUTH_TOKEN: '' }],
  ['missing canonical URL', { TWILIO_VOICE_WEBHOOK_URL: '' }],
  ['invalid canonical URL', { TWILIO_VOICE_WEBHOOK_URL: 'not-a-url' }],
]) {
  test(`${name} fails closed`, async () => {
    await startApp(overrides);
    const response = await voice();
    assert.equal(response.status, 500);
    assert.doesNotMatch(await response.text(), /latest announcement|<Say/);
  });
}

test('a CMS outage speaks the fallback while unsigned requests remain rejected', async () => {
  await startApp();
  await assertSpoken(await voice(), 'The latest announcement.');
  pg(['-m', 'immediate', 'stop']);
  pgRunning = false;
  await assertSpoken(await voice(), fallback);
  assert.equal((await voice({ signature: '' })).status, 403);
});
