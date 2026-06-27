import { z } from 'zod';

export const salariedSchema = z.object({
  employmentType: z.literal('SALARIED'),
  companyName: z.string().trim().min(1, 'Company name is required'),
  designation: z.string().trim().min(1, 'Designation is required'),
  monthlyNetSalary: z
    .number({ invalid_type_error: 'Monthly net salary must be a number' })
    .min(15000, 'Monthly Net Salary must be at least ₹15,000'),
  yearsOfExperience: z
    .number({ invalid_type_error: 'Years of experience must be a number' })
    .min(0, 'Years of experience cannot be negative')
    .max(50, 'Years of experience cannot exceed 50'),
});

export const selfEmployedSchema = z.object({
  employmentType: z.literal('SELF_EMPLOYED'),
  businessName: z.string().trim().min(1, 'Business name is required'),
  businessType: z.string().trim().min(1, 'Business type is required'),
  yearsInBusiness: z
    .number({ invalid_type_error: 'Years in business must be a number' })
    .min(2, 'Years in business must be at least 2 years'),
  monthlyIncome: z
    .number({ invalid_type_error: 'Monthly income must be a number' })
    .min(1, 'Monthly income must be greater than 0'),
});

export const businessOwnerSchema = z.object({
  employmentType: z.literal('BUSINESS_OWNER'),
  businessName: z.string().trim().min(1, 'Business name is required'),
  businessType: z.string().trim().min(1, 'Business type is required'),
  annualTurnover: z
    .number({ invalid_type_error: 'Annual turnover must be a number' })
    .min(300000, 'Annual turnover must be at least ₹3,00,000'),
  yearsInBusiness: z
    .number({ invalid_type_error: 'Years in business must be a number' })
    .min(2, 'Years in business must be at least 2 years'),
  officeAddress: z.string().trim().min(1, 'Office address is required'),
  gstNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      'GST Number must be a valid 15-character Indian GSTIN',
    ),
});

export const step5Schema = z.discriminatedUnion('employmentType', [
  salariedSchema,
  selfEmployedSchema,
  businessOwnerSchema,
]);

export type Step5FormData = z.infer<typeof step5Schema>;
