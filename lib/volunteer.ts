import { z } from 'zod';

export const volunteerRoles = ['Monitoring', 'Door', 'Setting up/breaking down', 'Other'] as const;
export const responseHeaders = ['Submitted at', 'Reference', 'Name', 'Contact', 'Referral', 'Experience and interests', 'Volunteer preferences', 'Other preference'];

export const volunteerSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(200),
  contact: z.string().trim().min(1, 'Enter a way to contact you.').max(300),
  referral: z.string().trim().max(500),
  experience: z.string().trim().min(1, 'Tell us about your experience or interests.').max(3000),
  roles: z.array(z.enum(volunteerRoles)).min(1, 'Choose at least one volunteer preference.').max(4),
  other: z.string().trim().max(1000),
}).superRefine((value, context) => {
  if (value.roles.includes('Other') && !value.other) {
    context.addIssue({ code: 'custom', path: ['other'], message: 'Tell us what else you would like to help with.' });
  }
});

export type VolunteerInterest = z.infer<typeof volunteerSchema>;

export function responseRow(value: VolunteerInterest, reference: string, timestamp: string) {
  return [timestamp, reference, value.name, value.contact, value.referral, value.experience,
    [...new Set(value.roles)].join('; '), value.roles.includes('Other') ? value.other : ''];
}
