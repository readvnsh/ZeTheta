import { create } from 'zustand';
import {
  Step1FormData, Step2FormData, Step3Data, Step4FormData, Step5FormData, Step6FormData,
} from '../schemas';

interface FormState {
  step: number;
  step1Data: Step1FormData | null;
  step2Data: Step2FormData | null;
  step3Data: Step3Data | null;
  step4Data: Step4FormData | null;
  step5Data: Step5FormData | null;
  step6Data: Step6FormData | null;
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
  spouseFieldsRequired: false,
  step3Consent: false,
  isPanVerified: false,
  isAadhaarVerified: false,
  isDraftLoaded: false,
  setStep: (step) => set({ step }),
  setStep1Data: (data) => set({ step1Data: data }),
  setStep2Data: (data) => set({ step2Data: data }),
  setStep3Data: (data) => set({ step3Data: data }),
  setStep4Data: (data) => set({ step4Data: data }),
  setStep5Data: (data) => set({ step5Data: data }),
  setStep6Data: (data) => set({ step6Data: data }),
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
    spouseFieldsRequired: false,
    step3Consent: false,
    isPanVerified: false,
    isAadhaarVerified: false,
    isDraftLoaded: false,
  }),
}));

export default useFormStore;
