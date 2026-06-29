import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1Schema, Step1FormData, LoanType } from '../schemas';
import useFormStore from '../store/formStore';
import {
  Input, Select, RadioGroup, CurrencyInput,
} from './common';

export default function Step1LoanDetails() {
  const { step1Data, setStep1Data, setStep } = useFormStore();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: step1Data || {
      loanType: 'Personal',
      loanAmount: 50000,
      loanTenure: 12,
      loanPurpose: '',
      referralCode: '',
    },
  });

  const loanType = watch('loanType');

  // Adjust tenure default values on loan type changes to keep them valid
  useEffect(() => {
    if (loanType === 'Personal') {
      setValue('loanTenure', 12);
    } else if (loanType === 'Home') {
      setValue('loanTenure', 60);
    } else if (loanType === 'Business') {
      setValue('loanTenure', 12);
    }
  }, [loanType, setValue]);

  const onSubmit = (data: Step1FormData) => {
    setStep1Data(data);
    setStep(2);
  };

  const getTenureOptions = (type: LoanType) => {
    switch (type) {
      case 'Personal':
        return [
          { label: '12 Months (1 Year)', value: 12 },
          { label: '24 Months (2 Years)', value: 24 },
          { label: '36 Months (3 Years)', value: 36 },
          { label: '48 Months (4 Years)', value: 48 },
          { label: '60 Months (5 Years)', value: 60 },
        ];
      case 'Home':
        return [
          { label: '60 Months (5 Years)', value: 60 },
          { label: '120 Months (10 Years)', value: 120 },
          { label: '180 Months (15 Years)', value: 180 },
          { label: '240 Months (20 Years)', value: 240 },
          { label: '300 Months (25 Years)', value: 300 },
          { label: '360 Months (30 Years)', value: 360 },
        ];
      case 'Business':
        return [
          { label: '12 Months (1 Year)', value: 12 },
          { label: '24 Months (2 Years)', value: 24 },
          { label: '36 Months (3 Years)', value: 36 },
          { label: '48 Months (4 Years)', value: 48 },
          { label: '60 Months (5 Years)', value: 60 },
          { label: '72 Months (6 Years)', value: 72 },
          { label: '84 Months (7 Years)', value: 84 },
          { label: '96 Months (8 Years)', value: 96 },
          { label: '108 Months (9 Years)', value: 108 },
          { label: '120 Months (10 Years)', value: 120 },
        ];
      default:
        return [];
    }
  };

  const getLimitText = (type: LoanType) => {
    switch (type) {
      case 'Personal':
        return 'Min: ₹50,000 | Max: ₹10 Lakhs (₹1,000,000)';
      case 'Home':
        return 'Min: ₹50,000 | Max: ₹1 Crore (₹10,000,000)';
      case 'Business':
        return 'Min: ₹50,000 | Max: ₹50 Lakhs (₹5,000,000)';
      default:
        return '';
    }
  };

  return (
    <form id="step1-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[#00375e] tracking-tight">Loan Details</h2>
        <p className="text-sm text-gray-500">Specify your desired loan configurations.</p>
      </div>

      {Object.keys(errors).length > 0 && (
        <div id="step1-validation-errors" className="p-4 bg-red-50 text-red-800 rounded-lg text-xs font-mono whitespace-pre-wrap">
          <p className="font-bold mb-1">Validation Errors:</p>
          {JSON.stringify(errors, (k, v) => (k === 'ref' ? undefined : v), 2)}
        </div>
      )}

      {/* Loan Type */}
      <Input>
        <Input.Label>Loan Type</Input.Label>
        <Controller
          name="loanType"
          control={control}
          render={({ field }) => (
            <RadioGroup
              options={[
                { label: 'Personal Loan', value: 'Personal' },
                { label: 'Home Loan', value: 'Home' },
                { label: 'Business Loan', value: 'Business' },
              ]}
              name="loanType"
              orientation="horizontal"
              value={field.value}
              onChange={field.onChange}
              className="mt-1"
            />
          )}
        />
        <Input.Error>{errors.loanType?.message}</Input.Error>
      </Input>

      {/* Loan Amount */}
      <Input>
        <Input.Label htmlFor="loanAmount">Loan Amount (INR)</Input.Label>
        <Controller
          name="loanAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              id="loanAmount"
              value={field.value}
              onChange={field.onChange}
              hasError={!!errors.loanAmount}
              placeholder="e.g. 5,00,000"
              className="w-full h-11 border-gray-300 rounded-lg"
            />
          )}
        />
        <Input.HelpText>{getLimitText(loanType)}</Input.HelpText>
        <Input.Error>{errors.loanAmount?.message}</Input.Error>
      </Input>

      {/* Loan Tenure */}
      <Input>
        <Input.Label htmlFor="loanTenure">Loan Tenure</Input.Label>
        <Select
          id="loanTenure"
          options={getTenureOptions(loanType)}
          hasError={!!errors.loanTenure}
          {...register('loanTenure')}
          className="w-full h-11 border-gray-300 rounded-lg"
        />
        <Input.Error>{errors.loanTenure?.message}</Input.Error>
      </Input>

      {/* Loan Purpose */}
      <Input>
        <Input.Label htmlFor="loanPurpose">Loan Purpose</Input.Label>
        <Input.Field
          id="loanPurpose"
          placeholder="e.g. Home renovation, business expansion"
          hasError={!!errors.loanPurpose}
          {...register('loanPurpose')}
          className="w-full h-11 border-gray-300 rounded-lg"
        />
        <Input.Error>{errors.loanPurpose?.message}</Input.Error>
      </Input>

      {/* Referral Code */}
      <Input>
        <Input.Label htmlFor="referralCode">Referral Code (Optional)</Input.Label>
        <Input.Field
          id="referralCode"
          placeholder="e.g. REF12345"
          hasError={!!errors.referralCode}
          {...register('referralCode')}
          className="w-full h-11 border-gray-300 rounded-lg"
        />
        <Input.HelpText>6-10 alphanumeric characters.</Input.HelpText>
        <Input.Error>{errors.referralCode?.message}</Input.Error>
      </Input>
    </form>
  );
}
