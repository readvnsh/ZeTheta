import { create } from 'zustand';
import {
  Step1FormData, Step2FormData, Step3Data, Step4FormData, Step5FormData, Step6FormData,
} from '../schemas';

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
  setStep: (step) => set({ step }),
  setStep1Data: (data) => {
    const current = get().step1Data;
    if (current && current.loanType !== data.loanType) {
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
      // Remove businessReg and propertyDocs from Step 7 depending on type
      const step7 = get().step7Data;
      let newStep7 = step7;
      if (step7) {
        newStep7 = {
          ...step7,
          businessReg: data.loanType === 'Business' ? step7.businessReg : null,
          propertyDocs: data.loanType === 'Home' ? step7.propertyDocs : null,
        };
      }
      set({ step1Data: data, step5Data: newStep5, step7Data: newStep7 });
    } else {
      set({ step1Data: data });
    }
  },
  setStep2Data: (data) => set({ step2Data: data }),
  setStep3Data: (data) => set({ step3Data: data }),
  setStep4Data: (data) => set({ step4Data: data }),
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
    }
    set({ step5Data: cleanedData });
  },
  setStep6Data: (data) => set({ step6Data: data }),
  setStep7Data: (data) => set({ step7Data: data }),
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
