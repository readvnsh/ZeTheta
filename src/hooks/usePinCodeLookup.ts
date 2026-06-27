import { useState, useCallback } from 'react';
import pinCodeData from '../data/pinCodeData.json';

interface PinCodeRecord {
  city: string;
  state: string;
  postOffices: string[];
}

export default function usePinCodeLookup() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ city: string; state: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (pin: string) => {
    if (!/^\d{6}$/.test(pin)) {
      setError('Invalid PIN format');
      setResult(null);
      return null;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    return new Promise((resolve) => {
      setTimeout(() => {
        setIsLoading(false);
        const record = (pinCodeData as Record<string, PinCodeRecord>)[pin];
        if (record) {
          const res = { city: record.city, state: record.state };
          setResult(res);
          resolve(res);
        } else {
          setError('PIN code not found');
          resolve(null);
        }
      }, 800);
    });
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setResult(null);
    setError(null);
  }, []);

  return {
    lookup,
    isLoading,
    result,
    error,
    reset,
  };
}
