import { useState, useEffect } from 'react';
import useFormStore from '../store/formStore';
import { decryptData } from '../utils/encryption';
import {
  step1Schema,
  getStep2Schema,
  getStep3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
} from '../schemas';

const SECRET = 'LendSwift-Secure-Draft-Secret';

interface DraftWrapper {
  version: string;
  timestamp: string;
  step: number;
  loanType: string;
  payload: string;
}

export default function useFormPersistence() {
  const [showModal, setShowModal] = useState(false);
  const [draftData, setDraftData] = useState<DraftWrapper | null>(null);
  const [draftKey, setDraftKey] = useState<string>('');

  useEffect(() => {
    const checkDrafts = () => {
      const keys = ['lendswift_draft_Personal', 'lendswift_draft_Home', 'lendswift_draft_Business'];
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const wrapper: DraftWrapper = JSON.parse(stored);
            const diff = Date.now() - new Date(wrapper.timestamp).getTime();
            // 72 hours = 259200000 ms
            if (diff < 259200000) {
              setDraftKey(key);
              setDraftData(wrapper);
              setShowModal(true);
              return;
            }
            localStorage.removeItem(key);
          } catch (e) {
            localStorage.removeItem(key);
          }
        }
      }
      useFormStore.getState().setDraftLoaded(true);
    };

    checkDrafts();
  }, []);

  const handleResume = async () => {
    if (!draftData) return;
    try {
      const decrypted = await decryptData(draftData.payload, SECRET);
      const parsed = JSON.parse(decrypted);
      const storeState = useFormStore.getState();

      // Validate data against current schemas
      if (parsed.step1Data) {
        const check = step1Schema.safeParse(parsed.step1Data);
        if (!check.success) throw new Error('Step 1 validation failed');
        storeState.setStep1Data(parsed.step1Data);
      }
      if (parsed.step2Data) {
        const loanType = parsed.step1Data?.loanType ?? 'Personal';
        const check = getStep2Schema(loanType).safeParse(parsed.step2Data);
        if (!check.success) throw new Error('Step 2 validation failed');
        storeState.setStep2Data(parsed.step2Data);
      }
      if (parsed.step3Data) {
        const loanType = parsed.step1Data?.loanType ?? 'Personal';
        const check = getStep3Schema(loanType).safeParse(parsed.step3Data);
        if (!check.success) throw new Error('Step 3 validation failed');
        storeState.setStep3Data(parsed.step3Data);
      }
      if (parsed.step4Data) {
        const check = step4Schema.safeParse(parsed.step4Data);
        if (!check.success) throw new Error('Step 4 validation failed');
        storeState.setStep4Data(parsed.step4Data);
      }
      if (parsed.step5Data) {
        const check = step5Schema.safeParse(parsed.step5Data);
        if (!check.success) throw new Error('Step 5 validation failed');
        storeState.setStep5Data(parsed.step5Data);
      }
      if (parsed.step6Data) {
        const check = step6Schema.safeParse(parsed.step6Data);
        if (!check.success) throw new Error('Step 6 validation failed');
        storeState.setStep6Data(parsed.step6Data);
      }

      // Hydrate state
      storeState.setSpouseFieldsRequired(parsed.spouseFieldsRequired || false);
      storeState.setStep3Consent(parsed.step3Consent || false);
      storeState.setPanVerified(parsed.isPanVerified || false);
      storeState.setAadhaarVerified(parsed.isAadhaarVerified || false);
      storeState.setStep(draftData.step);

      // eslint-disable-next-line no-console
      console.log('Draft recovery successful.');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Draft recovery failed due to validation or decryption issue:', err);
      localStorage.removeItem(draftKey);
    } finally {
      setShowModal(false);
      useFormStore.getState().setDraftLoaded(true);
    }
  };

  const handleStartFresh = () => {
    if (draftKey) {
      localStorage.removeItem(draftKey);
    }
    setShowModal(false);
    useFormStore.getState().setDraftLoaded(true);
  };

  return {
    showModal,
    draftInfo: draftData ? { step: draftData.step, loanType: draftData.loanType } : null,
    handleResume,
    handleStartFresh,
  };
}
