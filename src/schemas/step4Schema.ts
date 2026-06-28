import { z } from 'zod';
import pinCodeData from '../data/pinCodeData.json';

// Single address base schema
export const addressBaseSchema = z.object({
  addressLine1: z
    .string()
    .trim()
    .min(5, 'Address Line 1 must be at least 5 characters')
    .max(200, 'Address Line 1 must be at most 200 characters'),
  addressLine2: z.string().trim().optional().or(z.literal('')),
  pinCode: z
    .string()
    .trim()
    .length(6, 'PIN Code must be exactly 6 digits')
    .regex(/^\d+$/, 'PIN Code must contain only digits'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().min(1, 'State is required'),
});

export const step4Schema = z
  .object({
    currentAddress: addressBaseSchema,
    residenceType: z.enum(['Owned', 'Rented', 'Company', 'Family'], {
      errorMap: () => ({ message: 'Please select a residence type' }),
    }),
    yearsAtAddress: z
      .number({ invalid_type_error: 'Years at address must be a number' })
      .min(0, 'Years at address cannot be negative')
      .max(50, 'Years at address cannot exceed 50'),
    rentAmount: z
      .number()
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' || val === undefined ? undefined : Number(val))),
    sameAsPermanent: z.boolean(),
    permanentAddress: z.preprocess(
      (val) => {
        if (!val || typeof val !== 'object') return undefined;
        const obj = val as Record<string, unknown>;
        const a1 = typeof obj.addressLine1 === 'string' ? obj.addressLine1.trim() : '';
        const pc = typeof obj.pinCode === 'string' ? obj.pinCode.trim() : '';
        const ci = typeof obj.city === 'string' ? obj.city.trim() : '';
        const st = typeof obj.state === 'string' ? obj.state.trim() : '';
        if (!a1 && !pc && !ci && !st) return undefined;
        return val;
      },
      addressBaseSchema.optional(),
    ),
    previousAddress: z.preprocess(
      (val) => {
        if (!val || typeof val !== 'object') return undefined;
        const obj = val as Record<string, unknown>;
        const a1 = typeof obj.addressLine1 === 'string' ? obj.addressLine1.trim() : '';
        const pc = typeof obj.pinCode === 'string' ? obj.pinCode.trim() : '';
        const ci = typeof obj.city === 'string' ? obj.city.trim() : '';
        const st = typeof obj.state === 'string' ? obj.state.trim() : '';
        if (!a1 && !pc && !ci && !st) return undefined;
        return val;
      },
      addressBaseSchema.optional(),
    ),
  })
  .superRefine((data, ctx) => {
    // 1. Rent validation
    if (data.residenceType === 'Rented') {
      if (data.rentAmount === undefined || Number.isNaN(data.rentAmount) || data.rentAmount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Rent amount is required and must be greater than 0 when renting',
          path: ['rentAmount'],
        });
      }
    }

    // 2. Previous Address validation if years < 1
    if (data.yearsAtAddress < 1) {
      if (!data.previousAddress || !data.previousAddress.addressLine1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Previous address details are required since you have lived here for less than a year',
          path: ['previousAddress', 'addressLine1'],
        });
      } else {
        const prev = data.previousAddress;
        if (!prev.addressLine1 || prev.addressLine1.length < 5 || prev.addressLine1.length > 200) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Address Line 1 must be between 5 and 200 characters',
            path: ['previousAddress', 'addressLine1'],
          });
        }
        if (!prev.pinCode || !/^\d{6}$/.test(prev.pinCode)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'PIN Code must be exactly 6 digits',
            path: ['previousAddress', 'pinCode'],
          });
        }
        if (!prev.city) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'City is required',
            path: ['previousAddress', 'city'],
          });
        }
        if (!prev.state) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'State is required',
            path: ['previousAddress', 'state'],
          });
        }
      }
    }

    // 3. Permanent Address validation if sameAsPermanent is false
    if (!data.sameAsPermanent) {
      if (!data.permanentAddress || !data.permanentAddress.addressLine1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Permanent address details are required when not identical to current address',
          path: ['permanentAddress', 'addressLine1'],
        });
      } else {
        const perm = data.permanentAddress;
        if (!perm.addressLine1 || perm.addressLine1.length < 5 || perm.addressLine1.length > 200) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Address Line 1 must be between 5 and 200 characters',
            path: ['permanentAddress', 'addressLine1'],
          });
        }
        if (!perm.pinCode || !/^\d{6}$/.test(perm.pinCode)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'PIN Code must be exactly 6 digits',
            path: ['permanentAddress', 'pinCode'],
          });
        }
        if (!perm.city) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'City is required',
            path: ['permanentAddress', 'city'],
          });
        }
        if (!perm.state) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'State is required',
            path: ['permanentAddress', 'state'],
          });
        }
      }
    }

    // 4. Cross-Validation: Check currentAddress state matches PIN state
    const currPin = data.currentAddress.pinCode;
    const currState = data.currentAddress.state;
    if (currPin && /^\d{6}$/.test(currPin)) {
      const record = (pinCodeData as any)[currPin];
      if (record && record.state.toLowerCase() !== currState.toLowerCase()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `State does not match expected state (${record.state}) for PIN ${currPin}`,
          path: ['currentAddress', 'state'],
        });
      }
    }

    // Previous Address PIN-state check
    if (data.yearsAtAddress < 1 && data.previousAddress) {
      const prevPin = data.previousAddress.pinCode;
      const prevState = data.previousAddress.state;
      if (prevPin && /^\d{6}$/.test(prevPin)) {
        const record = (pinCodeData as any)[prevPin];
        if (record && record.state.toLowerCase() !== prevState.toLowerCase()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `State does not match expected state (${record.state}) for PIN ${prevPin}`,
            path: ['previousAddress', 'state'],
          });
        }
      }
    }

    // Permanent Address PIN-state check
    if (!data.sameAsPermanent && data.permanentAddress) {
      const permPin = data.permanentAddress.pinCode;
      const permState = data.permanentAddress.state;
      if (permPin && /^\d{6}$/.test(permPin)) {
        const record = (pinCodeData as any)[permPin];
        if (record && record.state.toLowerCase() !== permState.toLowerCase()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `State does not match expected state (${record.state}) for PIN ${permPin}`,
            path: ['permanentAddress', 'state'],
          });
        }
      }
    }
  });

export type Step4FormData = z.infer<typeof step4Schema>;
