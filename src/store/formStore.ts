import { create } from 'zustand';
import { Step1FormData, Step2FormData } from '../schemas';

interface FormState {
  step: number;
  step1Data: Step1FormData | null;
  step2Data: Step2FormData | null;
  spouseFieldsRequired: boolean;
  setStep: (step: number) => void;
  setStep1Data: (data: Step1FormData) => void;
  setStep2Data: (data: Step2FormData | null) => void;
  setSpouseFieldsRequired: (required: boolean) => void;
  resetForm: () => void;
}

const useFormStore = create<FormState>((set) => ({
  step: 1,
  step1Data: null,
  step2Data: null,
  spouseFieldsRequired: false,
  setStep: (step) => set({ step }),
  setStep1Data: (data) => set({ step1Data: data }),
  setStep2Data: (data) => set({ step2Data: data }),
  setSpouseFieldsRequired: (required) => set({ spouseFieldsRequired: required }),
  resetForm: () => set({
    step: 1, step1Data: null, step2Data: null, spouseFieldsRequired: false,
  }),
}));

export default useFormStore;
