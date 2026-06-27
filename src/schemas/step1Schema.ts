import { z } from 'zod';

export const loanTypes = ['Personal', 'Home', 'Business'] as const;
export type LoanType = (typeof loanTypes)[number];

export const step1Schema = z
  .object({
    loanType: z.enum(loanTypes, {
      errorMap: () => ({ message: 'Loan Type must be Personal, Home, or Business' }),
    }),
    loanAmount: z
      .number({
        required_error: 'Loan amount is required',
        invalid_type_error: 'Loan amount must be a number',
      })
      .min(50000, 'Minimum loan amount is 50,000'),
    loanTenure: z.coerce
      .number({
        required_error: 'Loan tenure is required',
        invalid_type_error: 'Loan tenure must be a number',
      }),
    loanPurpose: z
      .string()
      .trim()
      .min(1, 'Loan purpose is required'),
    referralCode: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine((val) => !val || /^[a-zA-Z0-9]{6,10}$/.test(val), {
        message: 'Referral code must be 6-10 alphanumeric characters',
      }),
  })
  .superRefine((data, ctx) => {
    const { loanType, loanAmount, loanTenure } = data;

    // loanAmount max rules
    if (loanType === 'Personal' && loanAmount > 1000000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['loanAmount'],
        message: 'Maximum loan amount for Personal loan is 1,000,000 (10L)',
      });
    } else if (loanType === 'Home' && loanAmount > 10000000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['loanAmount'],
        message: 'Maximum loan amount for Home loan is 10,000,000 (1Cr)',
      });
    } else if (loanType === 'Business' && loanAmount > 5000000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['loanAmount'],
        message: 'Maximum loan amount for Business loan is 5,000,000 (50L)',
      });
    }

    // loanTenure rules
    if (loanType === 'Personal') {
      if (loanTenure < 12 || loanTenure > 60) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanTenure'],
          message: 'Loan tenure for Personal loan must be between 12 and 60 months',
        });
      }
    } else if (loanType === 'Home') {
      if (loanTenure < 60 || loanTenure > 360) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanTenure'],
          message: 'Loan tenure for Home loan must be between 60 and 360 months',
        });
      }
    } else if (loanType === 'Business') {
      if (loanTenure < 12 || loanTenure > 120) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['loanTenure'],
          message: 'Loan tenure for Business loan must be between 12 and 120 months',
        });
      }
    }
  });

export type Step1FormData = z.infer<typeof step1Schema>;
