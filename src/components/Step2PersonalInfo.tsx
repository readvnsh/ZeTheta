import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getStep2Schema, Step2FormData } from '../schemas';
import useFormStore from '../store/formStore';
import { Input, Select } from './common';

export default function Step2PersonalInfo() {
  const {
    step1Data, step2Data, setStep2Data, setSpouseFieldsRequired,
  } = useFormStore();

  const tenureMonths = step1Data?.loanTenure ?? 12; // default to 12 if step1 not filled
  const schema = getStep2Schema(tenureMonths);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step2FormData>({
    resolver: zodResolver(schema),
    defaultValues: step2Data || {
      fullName: '',
      fatherName: '',
      motherName: '',
      dob: '',
      gender: 'Male',
      maritalStatus: 'Single',
      email: '',
      mobile: '',
      alternateMobile: '',
    },
  });

  const maritalStatus = watch('maritalStatus');

  // Dynamically update spouse fields global trigger in real-time
  useEffect(() => {
    setSpouseFieldsRequired(maritalStatus === 'Married');
  }, [maritalStatus, setSpouseFieldsRequired]);

  const onSubmit = (data: Step2FormData) => {
    setStep2Data(data);
    // Move to next step or handle final submit (Step 3 or complete)
    // For now, since we only implement Steps 1 and 2, we can log it or display a success message.
    // eslint-disable-next-line no-console
    console.log('Form Step 1 and Step 2 Submitted Successfully!', { step1Data, step2Data: data });
  };

  return (
    <form id="step2-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[#00375e] tracking-tight">Personal Information</h2>
        <p className="text-sm text-gray-500">Provide your demographic and contact details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <Input>
          <Input.Label htmlFor="fullName">Full Name</Input.Label>
          <Input.Field
            id="fullName"
            placeholder="John Doe"
            hasError={!!errors.fullName}
            {...register('fullName')}
            className="w-full h-11 border-gray-300 rounded-lg"
          />
          <Input.Error>{errors.fullName?.message}</Input.Error>
        </Input>

        {/* Date of Birth */}
        <Input>
          <Input.Label htmlFor="dob">Date of Birth</Input.Label>
          <Input.Field
            id="dob"
            type="date"
            hasError={!!errors.dob}
            {...register('dob')}
            className="w-full h-11 border-gray-300 rounded-lg"
          />
          <Input.HelpText>
            Must be between 21 and 65 years old. Age + Loan Tenure in Years must be &le; 65.
          </Input.HelpText>
          <Input.Error>{errors.dob?.message}</Input.Error>
        </Input>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Father's Name */}
        <Input>
          <Input.Label htmlFor="fatherName">Father&apos;s Name</Input.Label>
          <Input.Field
            id="fatherName"
            placeholder="Robert Doe"
            hasError={!!errors.fatherName}
            {...register('fatherName')}
            className="w-full h-11 border-gray-300 rounded-lg"
          />
          <Input.Error>{errors.fatherName?.message}</Input.Error>
        </Input>

        {/* Mother's Name */}
        <Input>
          <Input.Label htmlFor="motherName">Mother&apos;s Name</Input.Label>
          <Input.Field
            id="motherName"
            placeholder="Mary Doe"
            hasError={!!errors.motherName}
            {...register('motherName')}
            className="w-full h-11 border-gray-300 rounded-lg"
          />
          <Input.Error>{errors.motherName?.message}</Input.Error>
        </Input>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender */}
        <Input>
          <Input.Label htmlFor="gender">Gender</Input.Label>
          <Select
            id="gender"
            options={[
              { label: 'Male', value: 'Male' },
              { label: 'Female', value: 'Female' },
              { label: 'Other', value: 'Other' },
            ]}
            hasError={!!errors.gender}
            {...register('gender')}
            className="w-full h-11 border-gray-300 rounded-lg"
          />
          <Input.Error>{errors.gender?.message}</Input.Error>
        </Input>

        {/* Marital Status */}
        <Input>
          <Input.Label htmlFor="maritalStatus">Marital Status</Input.Label>
          <Select
            id="maritalStatus"
            options={[
              { label: 'Single', value: 'Single' },
              { label: 'Married', value: 'Married' },
              { label: 'Divorced', value: 'Divorced' },
              { label: 'Widowed', value: 'Widowed' },
            ]}
            hasError={!!errors.maritalStatus}
            {...register('maritalStatus')}
            className="w-full h-11 border-gray-300 rounded-lg"
          />
          <Input.Error>{errors.maritalStatus?.message}</Input.Error>
        </Input>
      </div>

      {/* Email Address */}
      <Input>
        <Input.Label htmlFor="email">Email Address</Input.Label>
        <Input.Field
          id="email"
          type="email"
          placeholder="john.doe@example.com"
          hasError={!!errors.email}
          {...register('email')}
          className="w-full h-11 border-gray-300 rounded-lg"
        />
        <Input.Error>{errors.email?.message}</Input.Error>
      </Input>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mobile Number */}
        <Input>
          <Input.Label htmlFor="mobile">Mobile Number</Input.Label>
          <Input.Field
            id="mobile"
            placeholder="e.g. 9876543210"
            hasError={!!errors.mobile}
            {...register('mobile')}
            className="w-full h-11 border-gray-300 rounded-lg"
          />
          <Input.Error>{errors.mobile?.message}</Input.Error>
        </Input>

        {/* Alternate Mobile Number */}
        <Input>
          <Input.Label htmlFor="alternateMobile">Alternate Mobile (Optional)</Input.Label>
          <Input.Field
            id="alternateMobile"
            placeholder="e.g. 8765432109"
            hasError={!!errors.alternateMobile}
            {...register('alternateMobile')}
            className="w-full h-11 border-gray-300 rounded-lg"
          />
          <Input.Error>{errors.alternateMobile?.message}</Input.Error>
        </Input>
      </div>
    </form>
  );
}
