'use server';

import { z } from 'zod';
import { volunteerSchema } from '@/lib/volunteer';
import { saveVolunteerInterest } from '@/lib/volunteerSheets';

export type VolunteerResult = {
  status: 'idle' | 'invalid' | 'saved' | 'unavailable' | 'uncertain';
  errors?: Record<string, string[] | undefined>;
  reference?: string;
};

export async function submitVolunteerInterest(form: FormData): Promise<VolunteerResult> {
  if (form.get('website')) return { status: 'invalid' };
  const reference = z.uuid().safeParse(form.get('reference'));
  if (!reference.success) return { status: 'invalid' };
  const parsed = volunteerSchema.safeParse({
    name: form.get('name'), contact: form.get('contact'), referral: form.get('referral'),
    experience: form.get('experience'), roles: form.getAll('roles'), other: form.get('other') || '',
  });
  if (!parsed.success) return { status: 'invalid', errors: parsed.error.flatten().fieldErrors };
  const status = await saveVolunteerInterest(parsed.data, reference.data);
  return { status, reference: reference.data };
}
