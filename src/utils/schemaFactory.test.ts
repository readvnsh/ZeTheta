import { generateSchema } from './schemaFactory';
import useFormStore from '../store/formStore';

describe('schemaFactory & formStore cleanups', () => {
  beforeEach(() => {
    useFormStore.getState().resetForm();
  });

  describe('Step 5 - Loan & Employment constraints', () => {
    it('allows Salaried employment on Personal loans', () => {
      const formData = {
        step1Data: { loanType: 'Personal' },
      };
      const schema = generateSchema(5, formData);
      const parse = schema.safeParse({
        employmentType: 'SALARIED',
        companyName: 'LendSwift',
        designation: 'Manager',
        monthlyNetSalary: 30000,
        yearsOfExperience: 5,
      });
      expect(parse.success).toBe(true);
    });

    it('rejects Salaried employment on Business loans', () => {
      const formData = {
        step1Data: { loanType: 'Business' },
      };
      const schema = generateSchema(5, formData);
      const parse = schema.safeParse({
        employmentType: 'SALARIED',
        companyName: 'LendSwift',
        designation: 'Manager',
        monthlyNetSalary: 30000,
        yearsOfExperience: 5,
      });
      expect(parse.success).toBe(false);
    });
  });

  describe('Step 6 - Married & Spouse constraints', () => {
    it('allows Parent relation if Single', () => {
      const formData = {
        step2Data: { maritalStatus: 'Single' },
      };
      const schema = generateSchema(6, formData);
      const parse = schema.safeParse({
        coApplicantName: 'John Parent',
        relationship: 'Parent',
        coApplicantPan: 'ABCDE1234F',
        coApplicantIncome: 50000,
        coApplicantConsent: true,
      });
      expect(parse.success).toBe(true);
    });

    it('forces Spouse relation if Married', () => {
      const formData = {
        step2Data: { maritalStatus: 'Married' },
      };
      const schema = generateSchema(6, formData);
      const parse = schema.safeParse({
        coApplicantName: 'Jane Spouse',
        relationship: 'Parent', // Mismatch!
        coApplicantPan: 'ABCDE1234F',
        coApplicantIncome: 50000,
        coApplicantConsent: true,
      });
      expect(parse.success).toBe(false);
    });
  });

  describe('Step 8 - Age + Tenure boundary validation', () => {
    it('passes if age + tenure <= 65', () => {
      const formData = {
        step1Data: { loanTenure: 120 }, // 10 years
        step2Data: { dob: '1995-05-15' }, // approx 31 years old in 2026
      };
      const schema = generateSchema(8, formData);
      const parse = schema.safeParse({
        consent1: true,
        consent2: true,
        consent3: true,
        consent4: true,
      });
      expect(parse.success).toBe(true);
    });

    it('fails if age + tenure > 65', () => {
      const formData = {
        step1Data: { loanTenure: 240 }, // 20 years
        step2Data: { dob: '1970-05-15' }, // approx 56 years old in 2026
      };
      const schema = generateSchema(8, formData);
      const parse = schema.safeParse({
        consent1: true,
        consent2: true,
        consent3: true,
        consent4: true,
      });
      expect(parse.success).toBe(false);
    });
  });

  describe('formStore Cleanups', () => {
    it('clears business data when loanType changes from Business to Personal', () => {
      // Initial state
      useFormStore.getState().setStep1Data({
        loanType: 'Business',
        loanAmount: 3000000,
        loanTenure: 60,
        loanPurpose: 'Business Expansion',
      });
      useFormStore.getState().setStep5Data({
        employmentType: 'BUSINESS_OWNER',
        businessName: 'Apex Corp',
        businessType: 'Partnership',
        annualTurnover: 5000000,
        yearsInBusiness: 6,
        officeAddress: 'Main Rd',
        gstNumber: '27AAAAA1111A1Z1',
      });
      useFormStore.getState().setStep7Data({
        aadhaarFront: { name: 'aadhaar_f.jpg', size: 1000 },
        aadhaarBack: { name: 'aadhaar_b.jpg', size: 1000 },
        businessReg: { name: 'business_reg.pdf', size: 1000 },
        photograph: { name: 'photo.jpg', size: 1000 },
        signature: 'mock-sig',
      });

      // Change type to Personal
      useFormStore.getState().setStep1Data({
        loanType: 'Personal',
        loanAmount: 100000,
        loanTenure: 12,
        loanPurpose: 'Personal Medical',
      });

      // Assert Step 5 cleared
      expect(useFormStore.getState().step5Data?.businessName).toBe('');
      expect(useFormStore.getState().step5Data?.gstNumber).toBe('');

      // Assert Step 7 cleared
      expect(useFormStore.getState().step7Data?.businessReg).toBeNull();
    });

    it('clears sub-form values when changing employmentType in Step 5', () => {
      useFormStore.getState().setStep5Data({
        employmentType: 'SALARIED',
        companyName: 'LendSwift',
        designation: 'Architect',
        monthlyNetSalary: 80000,
        yearsOfExperience: 5,
      });

      // Change profile to SELF_EMPLOYED
      useFormStore.getState().setStep5Data({
        employmentType: 'SELF_EMPLOYED',
        businessName: 'Apex Store',
        businessType: 'Partnership',
        yearsInBusiness: 4,
        monthlyIncome: 60000,
      });

      // Assert salaried fields cleared
      const salariedData = useFormStore.getState().step5Data as any;
      expect(salariedData.companyName).toBeUndefined();
      expect(salariedData.monthlyNetSalary).toBeUndefined();
    });
  });
});
