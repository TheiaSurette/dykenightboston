import { GoogleAuth } from 'google-auth-library';
import { responseHeaders, responseRow, type VolunteerInterest } from './volunteer';

export type DeliveryResult = 'saved' | 'unavailable' | 'uncertain';

// Authentication uses ADC locally or the dedicated service account on the host.
// Never import this module into a client component.
export async function saveVolunteerInterest(value: VolunteerInterest, reference: string): Promise<DeliveryResult> {
  const spreadsheetId = process.env.VOLUNTEER_SPREADSHEET_ID;
  if (!spreadsheetId || !/^[a-zA-Z0-9_-]+$/.test(spreadsheetId)) return 'unavailable';
  let client;
  try {
    const credentials = process.env.VOLUNTEER_GOOGLE_CREDENTIALS_JSON
      ? JSON.parse(process.env.VOLUNTEER_GOOGLE_CREDENTIALS_JSON) : undefined;
    const auth = new GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    client = await auth.getClient();
    // Refuse to write into an unrelated or rearranged response tab.
    const headers = await client.request<{ values?: string[][] }>({
      url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Responses!A1:H1`,
      timeout: 10000,
    });
    if (JSON.stringify(headers.data.values?.[0]) !== JSON.stringify(responseHeaders)) return 'unavailable';
  } catch {
    return 'unavailable';
  }
  try {
    const result = await client.request<{ updates?: { updatedRows?: number } }>({
      url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Responses!A:H:append`,
      method: 'POST',
      params: { valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS' },
      data: { values: [responseRow(value, reference, new Date().toISOString())] },
      timeout: 15000,
      retry: false,
    });
    return result.data.updates?.updatedRows === 1 ? 'saved' : 'uncertain';
  } catch (error) {
    // A timed-out append may have committed. Never automatically append again.
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status && status >= 400 && status < 500 && status !== 408) return 'unavailable';
    return 'uncertain';
  }
}
