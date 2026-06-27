import { useState, useCallback } from 'react';

export default function useVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(async (
    value: string,
    validateFn: (val: string) => boolean,
    errorMessage: string,
  ): Promise<boolean> => {
    if (!value) {
      setError(null);
      setIsVerified(false);
      return false;
    }

    setIsVerifying(true);
    setIsVerified(false);
    setError(null);

    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const isValid = validateFn(value);
        setIsVerifying(false);
        if (isValid) {
          setIsVerified(true);
          resolve(true);
        } else {
          setError(errorMessage);
          resolve(false);
        }
      }, 1500);
    });
  }, []);

  const reset = useCallback(() => {
    setIsVerifying(false);
    setIsVerified(false);
    setError(null);
  }, []);

  return {
    isVerifying,
    isVerified,
    error,
    verify,
    reset,
    setIsVerified,
  };
}
