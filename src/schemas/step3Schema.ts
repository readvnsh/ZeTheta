import { z } from 'zod';
import { validateVerhoeff } from '../utils/validators';

export const getStep3Schema = (loanType: string) => z.object({
  pan: z
    .string()
    .trim()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/i, 'PAN must be in AAAAA9999A format')
    .refine(
      (val) => {
        const cleanVal = val.trim().toUpperCase();
        const entityChar = cleanVal[3];
        if (loanType === 'Personal' || loanType === 'Home') {
          return entityChar === 'P';
        }
        if (loanType === 'Business') {
          return entityChar === 'P' || entityChar === 'C' || entityChar === 'F';
        }
        return false;
      },
      { message: 'Invalid entity character (4th char) for this loan type' },
    ),
  aadhaar: z
    .string()
    .trim()
    .length(12, 'Aadhaar must be exactly 12 digits')
    .regex(/^\d+$/, 'Aadhaar must contain only digits')
    .refine((val) => validateVerhoeff(val), {
      message: 'Invalid Aadhaar checksum',
    }),
  aadhaarConsent: z.boolean().refine((val) => val === true, {
    message: 'Aadhaar consent is required',
  }),
  voterId: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^[A-Z]{3}[0-9]{7}$/i.test(val), {
      message: 'Voter ID must be 3 letters followed by 7 digits',
    }),
  passport: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^[A-Z][0-9]{7}$/i.test(val), {
      message: 'Passport must be 1 letter followed by 7 digits',
    }),
});

export const step3BaseSchema = getStep3Schema('Personal');
export type Step3FormData = z.infer<typeof step3BaseSchema>;
