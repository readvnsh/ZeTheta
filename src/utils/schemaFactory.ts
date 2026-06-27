import { z } from 'zod';
import {
  step1Schema,
  getStep2Schema,
  getStep3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
} from '../schemas';

const step8Schema = z.object({
  consent1: z.boolean().refine((v) => v === true, 'Consent is required'),
  consent2: z.boolean().refine((v) => v === true, 'Consent is required'),
  consent3: z.boolean().refine((v) => v === true, 'Consent is required'),
  consent4: z.boolean().refine((v) => v === true, 'Consent is required'),
});

/**
 * Dynamically constructs Step 5 validation schema.
 * Prevents SALARIED profile selection if loanType is Business.
 */
export const generateStep5Schema = (loanType: string) => (
  step5Schema.superRefine((data, ctx) => {
    if (loanType === 'Business' && data.employmentType === 'SALARIED') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['employmentType'],
        message: 'Salaried employees are not eligible for Business Loans.',
      });
    }
  })
);

/**
 * Dynamically constructs Step 6 validation schema.
 * Locks relationship to Spouse if applicant is Married.
 */
export const generateStep6Schema = (maritalStatus: string) => (
  step6Schema.superRefine((data, ctx) => {
    if (maritalStatus === 'Married' && data.relationship !== 'Spouse') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['relationship'],
        message: 'Relationship must be Spouse for married applicants.',
      });
    }
  })
);

/**
 * Dynamically constructs Step 8 validation schema.
 * Mathematically validates that Age + Tenure <= 65.
 */
export const generateStep8Schema = (formData: any) => (
  step8Schema.superRefine((data, ctx) => {
    const dob = formData.step2Data?.dob;
    const tenureMonths = formData.step1Data?.loanTenure;

    if (dob && tenureMonths) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
      }

      const tenureYears = tenureMonths / 12;
      if (age + tenureYears > 65) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['consent1'],
          message: 'Combined age and loan tenure cannot exceed 65 years.',
        });
      }
    }
  })
);

/**
 * Dynamic schema factory returning validation rule sets based on active step and state.
 */
export const generateSchema = (currentStep: number, formData: any): z.ZodType<any> => {
  const loanType = formData.step1Data?.loanType ?? 'Personal';
  const maritalStatus = formData.step2Data?.maritalStatus ?? 'Single';

  switch (currentStep) {
    case 1:
      return step1Schema;
    case 2:
      return getStep2Schema(loanType);
    case 3:
      return getStep3Schema(loanType);
    case 4:
      return step4Schema;
    case 5:
      return generateStep5Schema(loanType);
    case 6:
      return generateStep6Schema(maritalStatus);
    case 8:
      return generateStep8Schema(formData);
    default:
      return z.any();
  }
};

export default generateSchema;
