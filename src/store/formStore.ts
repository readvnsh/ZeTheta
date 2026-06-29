import { create } from 'zustand';
import {
  Step1FormData, Step2FormData, Step3Data, Step4FormData, Step5FormData, Step6FormData,
} from '../schemas';
import { sanitizeData } from '../utils/sanitizer';
import { validatePan } from '../utils/validators';

export interface Step7StoreData {
  panCard?: { name: string; size: number } | null;
  aadhaarFront: { name: string; size: number } | null;
  aadhaarBack: { name: string; size: number } | null;
  salarySlips?: { name: string; size: number } | null;
  bankStatements?: { name: string; size: number } | null;
  itr?: { name: string; size: number } | null;
  propertyDocs?: { name: string; size: number } | null;
  businessReg?: { name: string; size: number } | null;
  photograph: { name: string; size: number } | null;
  signature: string | null; // base64 string
}

interface FormState {
  step: number;
  step1Data: Step1FormData | null;
  step2Data: Step2FormData | null;
  step3Data: Step3Data | null;
  step4Data: Step4FormData | null;
  step5Data: Step5FormData | null;
  step6Data: Step6FormData | null;
  step7Data: Step7StoreData | null;
  spouseFieldsRequired: boolean;
  step3Consent: boolean;
  isPanVerified: boolean;
  isAadhaarVerified: boolean;
  isDraftLoaded: boolean;
  setStep: (step: number) => void;
  setStep1Data: (data: Step1FormData) => void;
  setStep2Data: (data: Step2FormData | null) => void;
  setStep3Data: (data: Step3Data | null) => void;
  setStep4Data: (data: Step4FormData | null) => void;
  setStep5Data: (data: Step5FormData | null) => void;
  setStep6Data: (data: Step6FormData | null) => void;
  setStep7Data: (data: Step7StoreData | null) => void;
  setSpouseFieldsRequired: (required: boolean) => void;
  setStep3Consent: (consent: boolean) => void;
  setPanVerified: (verified: boolean) => void;
  setAadhaarVerified: (verified: boolean) => void;
  setDraftLoaded: (loaded: boolean) => void;
  isStep6Required: () => boolean;
  resetForm: () => void;
}

let lastStepChange = 0;

const useFormStore = create<FormState>((set, get) => ({
  step: 1,
  step1Data: null,
  step2Data: null,
  step3Data: null,
  step4Data: null,
  step5Data: null,
  step6Data: null,
  step7Data: null,
  spouseFieldsRequired: false,
  step3Consent: false,
  isPanVerified: false,
  isAadhaarVerified: false,
  isDraftLoaded: false,
  setStep: (step) => {
    const current = get().step;
    if (current === step) return;
    const now = Date.now();
    // Guard forward transitions with 400ms cooldown to prevent double-incrementing on rapid click
    if (step > current && now - lastStepChange < 400) {
      return;
    }
    lastStepChange = now;
    set({ step });
  },
  setStep1Data: (data) => {
    const current = get().step1Data;
    const sanitized = sanitizeData(data);

    if (current && current.loanType !== sanitized.loanType) {
      // Clear gstNumber and businessName in Step 5 if changing loanType
      const step5 = get().step5Data;
      let newStep5 = step5;
      if (step5) {
        newStep5 = {
          ...step5,
          businessName: '',
          gstNumber: '',
        } as any;
      }

      // If switching to Business loan, salaried is ineligible. Reset Step 5 entirely.
      if (sanitized.loanType === 'Business' && step5?.employmentType === 'SALARIED') {
        newStep5 = null;
      }

      // Purge PAN verification if PAN entity code becomes invalid for the new loan type
      const step3 = get().step3Data;
      let newStep3 = step3;
      let newPanVerified = get().isPanVerified;
      if (step3 && step3.panNumber) {
        const isStillValid = validatePan(step3.panNumber, sanitized.loanType);
        if (!isStillValid) {
          newStep3 = null;
          newPanVerified = false;
        }
      }

      // Remove businessReg and propertyDocs from Step 7 depending on type
      const step7 = get().step7Data;
      let newStep7 = step7;
      if (step7) {
        newStep7 = {
          ...step7,
          businessReg: sanitized.loanType === 'Business' ? step7.businessReg : null,
          propertyDocs: sanitized.loanType === 'Home' ? step7.propertyDocs : null,
          salarySlips: (sanitized.loanType === 'Business' && step5?.employmentType === 'SALARIED') ? null : step7.salarySlips,
        };
      }

      set({
        step1Data: sanitized,
        step5Data: newStep5,
        step3Data: newStep3,
        isPanVerified: newPanVerified,
        step7Data: newStep7,
      });
    } else {
      set({ step1Data: sanitized });
    }

    // Clean up dependent Step 6 co-applicant state if changing loan details makes it not required
    if (!get().isStep6Required()) {
      set({ step6Data: null });
    }
  },
  setStep2Data: (data) => {
    const current = get().step2Data;
    const sanitized = data ? sanitizeData(data) : null;
    if (current && sanitized && current.maritalStatus !== sanitized.maritalStatus) {
      const step6 = get().step6Data;
      if (step6) {
        if (sanitized.maritalStatus !== 'Married' && step6.relationship === 'Spouse') {
          set({
            step6Data: {
              ...step6,
              relationship: '' as any,
            },
          });
        } else if (sanitized.maritalStatus === 'Married') {
          set({
            step6Data: {
              ...step6,
              relationship: 'Spouse',
            },
          });
        }
      }
    }
    set({ step2Data: sanitized });
  },
  setStep3Data: (data) => set({ step3Data: sanitizeData(data) }),
  setStep4Data: (data) => set({ step4Data: sanitizeData(data) }),
  setStep5Data: (data) => {
    const current = get().step5Data;
    let cleanedData = data;
    if (current && data && current.employmentType !== data.employmentType) {
      // Clear fields belonging to other sub-forms
      if (data.employmentType === 'SALARIED') {
        cleanedData = {
          employmentType: 'SALARIED',
          companyName: data.companyName || '',
          designation: data.designation || '',
          monthlyNetSalary: data.monthlyNetSalary || 0,
          yearsOfExperience: data.yearsOfExperience || 0,
        } as any;
      } else if (data.employmentType === 'SELF_EMPLOYED') {
        cleanedData = {
          employmentType: 'SELF_EMPLOYED',
          businessName: data.businessName || '',
          businessType: data.businessType || '',
          yearsInBusiness: data.yearsInBusiness || 0,
          monthlyIncome: data.monthlyIncome || 0,
        } as any;
      } else if (data.employmentType === 'BUSINESS_OWNER') {
        cleanedData = {
          employmentType: 'BUSINESS_OWNER',
          businessName: data.businessName || '',
          businessType: data.businessType || '',
          annualTurnover: data.annualTurnover || 0,
          yearsInBusiness: data.yearsInBusiness || 0,
          officeAddress: data.officeAddress || '',
          gstNumber: data.gstNumber || '',
        } as any;
      }

      // Clean up Step 7 documents depending on the new employmentType
      const step7 = get().step7Data;
      if (step7) {
        const newStep7 = { ...step7 };
        if (data.employmentType !== 'SALARIED') {
          newStep7.salarySlips = null;
        }
        if (data.employmentType === 'SALARIED') {
          newStep7.itr = null;
          newStep7.businessReg = null;
        }
        if (data.employmentType !== 'BUSINESS_OWNER') {
          newStep7.businessReg = null;
        }
        set({ step7Data: newStep7 });
      }
    }
    set({ step5Data: data ? sanitizeData(cleanedData) : null });
  },
  setStep6Data: (data) => set({ step6Data: sanitizeData(data) }),
  setStep7Data: (data) => set({ step7Data: sanitizeData(data) }),
  setSpouseFieldsRequired: (required) => set({ spouseFieldsRequired: required }),
  setStep3Consent: (consent) => set({ step3Consent: consent }),
  setPanVerified: (verified) => set({ isPanVerified: verified }),
  setAadhaarVerified: (verified) => set({ isAadhaarVerified: verified }),
  setDraftLoaded: (loaded) => set({ isDraftLoaded: loaded }),
  isStep6Required: () => {
    const s1 = get().step1Data;
    if (!s1) return false;
    const type = s1.loanType;
    const amount = Number(s1.loanAmount);
    if (type === 'Home') return true;
    if (type === 'Personal' && amount > 500000) return true;
    if (type === 'Business' && amount > 2000000) return true;
    return false;
  },
  resetForm: () => set({
    step: 1,
    step1Data: null,
    step2Data: null,
    step3Data: null,
    step4Data: null,
    step5Data: null,
    step6Data: null,
    step7Data: null,
    spouseFieldsRequired: false,
    step3Consent: false,
    isPanVerified: false,
    isAadhaarVerified: false,
    isDraftLoaded: false,
  }),
}));

if (typeof window !== 'undefined' && (window as any).Cypress) {
  (window as any).store = useFormStore;
}

export default useFormStore;
