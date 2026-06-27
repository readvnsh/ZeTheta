import { z } from 'zod';

export const genders = ['Male', 'Female', 'Other'] as const;
export type Gender = (typeof genders)[number];

export const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'] as const;
export type MaritalStatus = (typeof maritalStatuses)[number];

export const calculateAge = (dobString: string): number => {
  const dob = new Date(dobString);
  if (Number.isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
};

export const getStep2Schema = (loanTenureMonths: number) => {
  const nameRegex = /^[a-zA-Z\s.]+$/;

  return z
    .object({
      fullName: z
        .string()
        .trim()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name must not exceed 100 characters')
        .regex(nameRegex, 'Full name can only contain alphabetic characters, spaces, and periods'),
      fatherName: z
        .string()
        .trim()
        .min(2, "Father's name must be at least 2 characters")
        .max(100, "Father's name must not exceed 100 characters")
        .regex(nameRegex, "Father's name can only contain alphabetic characters, spaces, and periods"),
      motherName: z
        .string()
        .trim()
        .min(2, "Mother's name must be at least 2 characters")
        .max(100, "Mother's name must not exceed 100 characters")
        .regex(nameRegex, "Mother's name can only contain alphabetic characters, spaces, and periods"),
      dob: z
        .string()
        .min(1, 'Date of birth is required')
        .refine(
          (val) => {
            const age = calculateAge(val);
            return age >= 21 && age <= 65;
          },
          { message: 'Age must be between 21 and 65 years' },
        ),
      gender: z.enum(genders, {
        errorMap: () => ({ message: 'Gender must be Male, Female, or Other' }),
      }),
      maritalStatus: z.enum(maritalStatuses, {
        errorMap: () => ({ message: 'Marital Status must be Single, Married, Divorced, or Widowed' }),
      }),
      email: z.string().trim().email('Please enter a valid email address'),
      mobile: z
        .string()
        .regex(/^[6-9]\d{9}$/, 'Mobile number must be 10 digits starting with 6-9'),
      alternateMobile: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine((val) => !val || /^[6-9]\d{9}$/.test(val), {
          message: 'Alternate mobile number must be 10 digits starting with 6-9',
        }),
    })
    .superRefine((data, ctx) => {
      // Must differ check
      if (data.alternateMobile && data.alternateMobile === data.mobile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['alternateMobile'],
          message: 'Alternate mobile number must differ from primary mobile number',
        });
      }

      // Age + (Loan Tenure in Years) <= 65
      if (data.dob) {
        const age = calculateAge(data.dob);
        const tenureYears = loanTenureMonths / 12;
        if (age + tenureYears > 65) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['dob'],
            message: `Combined Age (${age}) and Loan Tenure (${tenureYears.toFixed(1)} years) must not exceed 65 years.`,
          });
        }
      }
    });
};

export const step2BaseSchema = getStep2Schema(0);
export type Step2FormData = z.infer<typeof step2BaseSchema>;
