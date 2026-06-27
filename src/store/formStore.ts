import { create } from 'zustand';
import { Step1FormData, Step2FormData } from '../schemas';

export interface Step3Data {
  pan: string;
  aadhaar: string;
  voterId?: string;
  passport?: string;
  aadhaarConsent: boolean;
}

interface FormState {
  step: number;
  step1Data: Step1FormData | null;
  step2Data: Step2FormData | null;
  step3Data: Step3Data | null;
  spouseFieldsRequired: boolean;
  step3Consent: boolean;
  isPanVerified: boolean;
  isAadhaarVerified: boolean;
  setStep: (step: number) => void;
  setStep1Data: (data: Step1FormData) => void;
  setStep2Data: (data: Step2FormData | null) => void;
  setStep3Data: (data: Step3Data | null) => void;
  setSpouseFieldsRequired: (required: boolean) => void;
  setStep3Consent: (consent: boolean) => void;
  setPanVerified: (verified: boolean) => void;
  setAadhaarVerified: (verified: boolean) => void;
  resetForm: () => void;
}

const useFormStore = create<FormState>((set) => ({
  step: 1,
  step1Data: null,
  step2Data: null,
  step3Data: null,
  spouseFieldsRequired: false,
  step3Consent: false,
  isPanVerified: false,
  isAadhaarVerified: false,
  setStep: (step) => set({ step }),
  setStep1Data: (data) => set({ step1Data: data }),
  setStep2Data: (data) => set({ step2Data: data }),
  setStep3Data: (data) => set({ step3Data: data }),
  setSpouseFieldsRequired: (required) => set({ spouseFieldsRequired: required }),
  setStep3Consent: (consent) => set({ step3Consent: consent }),
  setPanVerified: (verified) => set({ isPanVerified: verified }),
  setAadhaarVerified: (verified) => set({ isAadhaarVerified: verified }),
  resetForm: () => set({
    step: 1,
    step1Data: null,
    step2Data: null,
    step3Data: null,
    spouseFieldsRequired: false,
    step3Consent: false,
    isPanVerified: false,
    isAadhaarVerified: false,
  }),
}));

export default useFormStore;
