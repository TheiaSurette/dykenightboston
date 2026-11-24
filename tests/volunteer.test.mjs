import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GoogleAuth } from 'google-auth-library';
import { volunteerSchema, responseHeaders, responseRow } from '../lib/volunteer.ts';
import { saveVolunteerInterest } from '../lib/volunteerSheets.ts';

const interest = { name: 'Test volunteer', contact: '@example', referral: '', experience: 'First time; interested in helping.', roles: ['Door'], other: '' };

test('volunteer preferences exclude coat check and require a real choice', () => {
  assert.equal(volunteerSchema.safeParse({ ...interest, roles: [] }).success, false);
  assert.equal(volunteerSchema.safeParse({ ...interest, roles: ['Coat check'] }).success, false);
  assert.equal(volunteerSchema.safeParse({ ...interest, roles: ['Other'] }).success, false);
  assert.equal(volunteerSchema.safeParse({ ...interest, roles: ['Other'], other: 'Flyering' }).success, true);
  assert.equal(volunteerSchema.safeParse({ ...interest, name: '   ' }).success, false);
  assert.equal(volunteerSchema.safeParse({ ...interest, experience: 'x'.repeat(3001) }).success, false);
});

test('response rows preserve Unicode and ignore stale Other answers', () => {
  const value = { ...interest, name: 'Zoë 🌈', other: 'stale hidden answer', roles: ['Door', 'Door'] };
  const row = responseRow(value, 'reference', 'timestamp');
  assert.equal(row.length, responseHeaders.length);
  assert.equal(row[2], 'Zoë 🌈');
  assert.equal(row[6], 'Door');
  assert.equal(row[7], '');
});

test('Sheets delivery verifies headers, writes literal values, and distinguishes uncertain writes', async (t) => {
  const previousId = process.env.VOLUNTEER_SPREADSHEET_ID;
  const previousCredentials = process.env.VOLUNTEER_GOOGLE_CREDENTIALS_JSON;
  process.env.VOLUNTEER_SPREADSHEET_ID = 'test-sheet';
  delete process.env.VOLUNTEER_GOOGLE_CREDENTIALS_JSON;
  let calls = [];
  let response = { data: { updates: { updatedRows: 1 } } };
  let headers = responseHeaders;
  let failure;
  t.mock.method(GoogleAuth.prototype, 'getClient', async () => ({
    request: async options => {
      calls.push(options);
      if (!options.method) return { data: { values: [headers] } };
      if (failure) throw failure;
      return response;
    },
  }));
  try {
    assert.equal(await saveVolunteerInterest({ ...interest, name: '=1+1' }, 'reference'), 'saved');
    assert.equal(calls[1].params.valueInputOption, 'RAW');
    assert.equal(calls[1].data.values[0][2], '=1+1');
    assert.equal(calls[1].retry, false);
    calls = [];
    headers = ['Wrong sheet'];
    assert.equal(await saveVolunteerInterest(interest, 'reference'), 'unavailable');
    assert.equal(calls.length, 1);
    headers = responseHeaders;
    failure = new Error('Timeout after append');
    assert.equal(await saveVolunteerInterest(interest, 'reference'), 'uncertain');
    failure = { response: { status: 403 } };
    assert.equal(await saveVolunteerInterest(interest, 'reference'), 'unavailable');
    failure = undefined;
    response = { data: {} };
    assert.equal(await saveVolunteerInterest(interest, 'reference'), 'uncertain');
  } finally {
    if (previousId === undefined) delete process.env.VOLUNTEER_SPREADSHEET_ID;
    else process.env.VOLUNTEER_SPREADSHEET_ID = previousId;
    if (previousCredentials !== undefined) process.env.VOLUNTEER_GOOGLE_CREDENTIALS_JSON = previousCredentials;
  }
});
