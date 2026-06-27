import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getStep3Schema, Step3FormData } from '../schemas';
import useFormStore from '../store/formStore';
import useVerification from '../hooks/useVerification';
import { validatePan, validateVerhoeff } from '../utils/validators';
import { Input, Checkbox, MaskedInput } from './common';

export default function Step3KYC() {
  const {
    step1Data,
    step3Data,
    setStep3Data,
    setStep3Consent,
    setPanVerified,
    setAadhaarVerified,
    isPanVerified,
    isAadhaarVerified,
  } = useFormStore();

  const loanType = step1Data?.loanType ?? 'Personal';
  const schema = getStep3Schema(loanType);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<Step3FormData>({
    resolver: zodResolver(schema),
    defaultValues: step3Data || {
      pan: '',
      aadhaar: '',
      voterId: '',
      passport: '',
      aadhaarConsent: false,
    },
  });

  const {
    verify: verifyPan,
    isVerifying: isVerifyingPan,
    isVerified: isVerifiedPan,
    error: panVerificationError,
    setIsVerified: setIsVerifiedPan,
  } = useVerification();

  const {
    verify: verifyAadhaar,
    isVerifying: isVerifyingAadhaar,
    isVerified: isVerifiedAadhaar,
    error: aadhaarVerificationError,
    setIsVerified: setIsVerifiedAadhaar,
  } = useVerification();

  // Sync initial verification flags on load
  useEffect(() => {
    if (isPanVerified) {
      setIsVerifiedPan(true);
    }
    if (isAadhaarVerified) {
      setIsVerifiedAadhaar(true);
    }
  }, [isPanVerified, isAadhaarVerified, setIsVerifiedPan, setIsVerifiedAadhaar]);

  const consentValue = watch('aadhaarConsent');

  // Sync consent state to the store for Next button gating
  useEffect(() => {
    setStep3Consent(consentValue);
  }, [consentValue, setStep3Consent]);

  const onSubmit = (data: Step3FormData) => {
    setStep3Data(data);
    // eslint-disable-next-line no-console
    console.log('Step 3 KYC Complete! Data saved:', data);
    // eslint-disable-next-line no-console
    console.log('KYC Steps Verified and Form Submitted successfully!');
  };

  return (
    <form id="step3-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[#00375e] tracking-tight">KYC & Identity Verification</h2>
        <p className="text-sm text-gray-500">Provide your official identification numbers to verify your profile.</p>
      </div>

      {/* PAN Verification */}
      <Input>
        <Input.Label htmlFor="pan">PAN Card Number</Input.Label>
        <Controller
          name="pan"
          control={control}
          render={({ field }) => (
            <MaskedInput
              id="pan"
              value={field.value}
              onChange={(val) => {
                field.onChange(val);
                setPanVerified(false);
                setIsVerifiedPan(false);
              }}
              onBlur={async () => {
                field.onBlur();
                const cleanVal = (field.value || '').trim().toUpperCase();
                if (cleanVal) {
                  const isValid = await verifyPan(
                    cleanVal,
                    (val) => validatePan(val, loanType),
                    'Invalid PAN card number or entity type for this loan type.',
                  );
                  setPanVerified(isValid);
                }
              }}
              hasError={!!errors.pan || !!panVerificationError}
              placeholder="AAAAA9999A"
              className="w-full h-11 border-gray-300 rounded-lg"
            />
          )}
        />
        <div className="flex items-center gap-2 mt-1">
          {isVerifyingPan && (
            <span className="flex items-center gap-1 text-xs text-blue-600">
              <svg className="animate-spin h-3 w-3 text-blue-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verifying PAN...
            </span>
          )}
          {isVerifiedPan && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              ✓ PAN Verified
            </span>
          )}
          {panVerificationError && (
            <span className="text-xs text-red-600">{panVerificationError}</span>
          )}
        </div>
        <Input.Error>{errors.pan?.message}</Input.Error>
      </Input>

      {/* Aadhaar Verification */}
      <Input>
        <Input.Label htmlFor="aadhaar">Aadhaar Card Number</Input.Label>
        <Controller
          name="aadhaar"
          control={control}
          render={({ field }) => (
            <MaskedInput
              id="aadhaar"
              value={field.value}
              onChange={(val) => {
                field.onChange(val);
                setAadhaarVerified(false);
                setIsVerifiedAadhaar(false);
              }}
              onBlur={async () => {
                field.onBlur();
                const cleanVal = (field.value || '').trim();
                if (cleanVal) {
                  const isValid = await verifyAadhaar(
                    cleanVal,
                    validateVerhoeff,
                    'Invalid Aadhaar checksum (Verhoeff validation failed).',
                  );
                  setAadhaarVerified(isValid);
                }
              }}
              hasError={!!errors.aadhaar || !!aadhaarVerificationError}
              placeholder="12 Digit Aadhaar Number"
              className="w-full h-11 border-gray-300 rounded-lg"
            />
          )}
        />
        <div className="flex items-center gap-2 mt-1">
          {isVerifyingAadhaar && (
            <span className="flex items-center gap-1 text-xs text-blue-600">
              <svg className="animate-spin h-3 w-3 text-blue-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verifying Aadhaar...
            </span>
          )}
          {isVerifiedAadhaar && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              ✓ Aadhaar Verified
            </span>
          )}
          {aadhaarVerificationError && (
            <span className="text-xs text-red-600">{aadhaarVerificationError}</span>
          )}
        </div>
        <Input.Error>{errors.aadhaar?.message}</Input.Error>
      </Input>

      {/* Aadhaar Consent Checkbox */}
      <Checkbox
        label="I provide consent to verify my Aadhaar number using standard secure protocols."
        hasError={!!errors.aadhaarConsent}
        {...register('aadhaarConsent')}
      />
      <Input.Error>{errors.aadhaarConsent?.message}</Input.Error>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Voter ID */}
        <Input>
          <Input.Label htmlFor="voterId">Voter ID (Optional)</Input.Label>
          <Input.Field
            id="voterId"
            placeholder="e.g. ABC1234567"
            hasError={!!errors.voterId}
            {...register('voterId')}
            className="w-full h-11 border-gray-300 rounded-lg"
          />
          <Input.Error>{errors.voterId?.message}</Input.Error>
        </Input>

        {/* Passport */}
        <Input>
          <Input.Label htmlFor="passport">Passport Number (Optional)</Input.Label>
          <Input.Field
            id="passport"
            placeholder="e.g. A1234567"
            hasError={!!errors.passport}
            {...register('passport')}
            className="w-full h-11 border-gray-300 rounded-lg"
          />
          <Input.Error>{errors.passport?.message}</Input.Error>
        </Input>
      </div>
    </form>
  );
}
