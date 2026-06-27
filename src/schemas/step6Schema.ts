import { z } from 'zod';

export const step6Schema = z.object({
  coApplicantName: z.string().trim().min(1, 'Co-applicant name is required'),
  relationship: z.enum(['Spouse', 'Parent', 'Sibling', 'Business Partner'], {
    errorMap: () => ({ message: 'Please select a relationship type' }),
  }),
  coApplicantPan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'PAN must be in AAAAA9999A format'),
  coApplicantIncome: z
    .number({ invalid_type_error: 'Monthly income must be a number' })
    .min(1, 'Monthly income must be greater than 0'),
  coApplicantConsent: z.boolean().refine((val) => val === true, {
    message: 'Co-applicant consent is required',
  }),
});

export type Step6FormData = z.infer<typeof step6Schema>;
