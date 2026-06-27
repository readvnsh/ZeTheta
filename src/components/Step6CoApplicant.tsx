import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step6Schema, Step6FormData } from '../schemas';
import useFormStore from '../store/formStore';
import useVerification from '../hooks/useVerification';
import { validatePan } from '../utils/validators';
import {
  Input, Select, Checkbox, MaskedInput,
} from './common';

const relationshipOptions = [
  { label: 'Select Relationship', value: '' },
  { label: 'Spouse', value: 'Spouse' },
  { label: 'Parent', value: 'Parent' },
  { label: 'Sibling', value: 'Sibling' },
  { label: 'Business Partner', value: 'Business Partner' },
];

export default function Step6CoApplicant() {
  const {
    step2Data, step6Data, setStep6Data, setStep,
  } = useFormStore();

  const isMarried = step2Data?.maritalStatus === 'Married';
  const defaultRelationship = isMarried ? 'Spouse' : '';

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step6FormData>({
    resolver: zodResolver(step6Schema),
    defaultValues: step6Data || {
      coApplicantName: '',
      relationship: defaultRelationship as any,
      coApplicantPan: '',
      coApplicantIncome: '' as any,
      coApplicantConsent: false,
    },
  });

  const {
    verify,
    isVerifying,
    isVerified,
    error: verificationError,
    setIsVerified,
  } = useVerification();

  // If already saved, sync verified status
  useEffect(() => {
    if (step6Data?.coApplicantPan) {
      setIsVerified(true);
    }
  }, [step6Data, setIsVerified]);

  const onSubmit = (data: Step6FormData) => {
    setStep6Data(data);
    setStep(7); // Move to Step 7 (Documents)
  };

  return (
    <form id="step6-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[#00375e] tracking-tight">Co-Applicant Details</h2>
        <p className="text-sm text-gray-500">Provide personal and income details of the co-applicant.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <Input>
          <Input.Label htmlFor="coApplicantName">Co-Applicant Name</Input.Label>
          <Input.Field
            id="coApplicantName"
            placeholder="As per PAN card"
            hasError={!!errors.coApplicantName}
            {...register('coApplicantName')}
            className="w-full h-11 border-gray-300 rounded-lg"
          />
          <Input.Error>{errors.coApplicantName?.message}</Input.Error>
        </Input>

        {/* Relationship */}
        <Input>
          <Input.Label htmlFor="relationship">Relationship</Input.Label>
          <Select
            id="relationship"
            options={relationshipOptions}
            hasError={!!errors.relationship}
            {...register('relationship')}
            className="w-full h-11 border-gray-300 rounded-lg"
          />
          <Input.Error>{errors.relationship?.message}</Input.Error>
        </Input>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PAN with verification hook */}
        <Input>
          <Input.Label htmlFor="coApplicantPan">Co-Applicant PAN</Input.Label>
          <Controller
            name="coApplicantPan"
            control={control}
            render={({ field }) => (
              <MaskedInput
                id="coApplicantPan"
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  setIsVerified(false);
                }}
                onBlur={async () => {
                  field.onBlur();
                  const cleanVal = (field.value || '').trim().toUpperCase();
                  if (cleanVal) {
                    await verify(
                      cleanVal,
                      (val) => validatePan(val, 'Personal'), // Co-applicants are always individuals
                      'Invalid PAN format or entity type.',
                    );
                  }
                }}
                hasError={!!errors.coApplicantPan || !!verificationError}
                placeholder="AAAAA9999A"
                className="w-full h-11 border-gray-300 rounded-lg"
              />
            )}
          />
          <div className="flex items-center gap-2 mt-1">
            {isVerifying && (
              <span className="flex items-center gap-1 text-xs text-blue-600">
                <svg className="animate-spin h-3 w-3 text-blue-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying PAN...
              </span>
            )}
            {isVerified && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                ✓ PAN Verified
              </span>
            )}
            {verificationError && (
              <span className="text-xs text-red-600">{verificationError}</span>
            )}
          </div>
          <Input.Error>{errors.coApplicantPan?.message}</Input.Error>
        </Input>

        {/* Income */}
        <Input>
          <Input.Label htmlFor="coApplicantIncome">Co-Applicant Monthly Income (₹)</Input.Label>
          <Input.Field
            id="coApplicantIncome"
            type="number"
            placeholder="e.g. 45000"
            hasError={!!errors.coApplicantIncome}
            {...register('coApplicantIncome', { valueAsNumber: true })}
            className="w-full h-11 border-gray-300 rounded-lg"
          />
          <Input.Error>{errors.coApplicantIncome?.message}</Input.Error>
        </Input>
      </div>

      {/* Consent Checkbox */}
      <Checkbox
        label="I confirm that the co-applicant has consented to this application and validation check."
        hasError={!!errors.coApplicantConsent}
        {...register('coApplicantConsent')}
      />
      <Input.Error>{errors.coApplicantConsent?.message}</Input.Error>
    </form>
  );
}
