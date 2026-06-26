import { create } from 'zustand';

interface FormState {
  // Add form fields here later
  step: number;
}

const useFormStore = create<FormState>(() => ({
  step: 1,
}));

export default useFormStore;
