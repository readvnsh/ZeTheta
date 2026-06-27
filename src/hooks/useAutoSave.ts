import { useEffect, useRef } from 'react';
import useFormStore from '../store/formStore';
import { encryptData } from '../utils/encryption';

const SECRET = 'LendSwift-Secure-Draft-Secret';

export default function useAutoSave() {
  const state = useFormStore();
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const saveDraft = async () => {
      const currentState = stateRef.current;
      if (!currentState.step1Data || !currentState.isDraftLoaded) return;

      try {
        const payload = {
          step: currentState.step,
          step1Data: currentState.step1Data,
          step2Data: currentState.step2Data,
          step3Data: currentState.step3Data,
          step4Data: currentState.step4Data,
          step5Data: currentState.step5Data,
          step6Data: currentState.step6Data,
          spouseFieldsRequired: currentState.spouseFieldsRequired,
          step3Consent: currentState.step3Consent,
          isPanVerified: currentState.isPanVerified,
          isAadhaarVerified: currentState.isAadhaarVerified,
        };

        const encrypted = await encryptData(JSON.stringify(payload), SECRET);
        const { loanType } = currentState.step1Data;
        const wrapper = {
          version: '1.0',
          timestamp: new Date().toISOString(),
          step: currentState.step,
          loanType,
          payload: encrypted,
        };

        localStorage.setItem(`lendswift_draft_${loanType}`, JSON.stringify(wrapper));
        // eslint-disable-next-line no-console
        console.log('Draft saved successfully.');
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Auto-save error:', err);
      }
    };

    const interval = setInterval(saveDraft, 30000);

    const handleBlur = (e: FocusEvent) => {
      if (e.target && ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'SELECT')) {
        saveDraft();
      }
    };

    window.addEventListener('blur', handleBlur, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('blur', handleBlur, true);
    };
  }, []);
}
