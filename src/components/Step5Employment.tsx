import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step5Schema, Step5FormData } from '../schemas';
import useFormStore from '../store/formStore';
import { Input, Select, RadioGroup } from './common';

const employmentTypeOptions = [
  { label: 'Salaried', value: 'SALARIED' },
  { label: 'Self Employed', value: 'SELF_EMPLOYED' },
  { label: 'Business Owner', value: 'BUSINESS_OWNER' },
];

const businessTypeOptions = [
  { label: 'Sole Proprietorship', value: 'Sole Proprietorship' },
  { label: 'Partnership', value: 'Partnership' },
  { label: 'Private Limited Company', value: 'Private Limited Company' },
  { label: 'Public Limited Company', value: 'Public Limited Company' },
  { label: 'LLP', value: 'LLP' },
];

export default function Step5Employment() {
  const {
    step1Data, step5Data, setStep5Data, setStep,
  } = useFormStore();
  const loanType = step1Data?.loanType ?? 'Personal';

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Step5FormData>({
    resolver: zodResolver(step5Schema),
    defaultValues: step5Data || {
      employmentType: 'SALARIED',
      companyName: '',
      designation: '',
      monthlyNetSalary: '' as any,
      yearsOfExperience: '' as any,
    },
  });

  const employmentTypeVal = watch('employmentType');

  // Enforce cross-step constraint: Business Loan cannot have Salaried Employment
  useEffect(() => {
    if (loanType === 'Business' && employmentTypeVal === 'SALARIED') {
      setError('employmentType', {
        type: 'custom',
        message: 'Salaried employees are not eligible for Business Loans. Please select a Self Employed or Business Owner profile.',
      });
    } else {
      clearErrors('employmentType');
    }
  }, [employmentTypeVal, loanType, setError, clearErrors]);

  const onSubmit = (data: Step5FormData) => {
    // If there is an active validation block, prevent submit
    if (loanType === 'Business' && data.employmentType === 'SALARIED') {
      return;
    }
    setStep5Data(data);
    setStep(6); // Go to Step 6
  };

  return (
    <form id="step5-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[#00375e] tracking-tight">Employment & Income Details</h2>
        <p className="text-sm text-gray-500">Provide details about your current work profile and financial turnover.</p>
      </div>

      {/* Employment Type Radio */}
      <Input>
        <Input.Label>Employment Type</Input.Label>
        <Controller
          name="employmentType"
          control={control}
          render={({ field }) => (
            <RadioGroup
              options={employmentTypeOptions}
              name="employmentType"
              orientation="horizontal"
              value={field.value}
              onChange={field.onChange}
              className="mt-1"
            />
          )}
        />
        <Input.Error>{errors.employmentType?.message}</Input.Error>
      </Input>

      {/* Dynamic Sub-forms */}
      {employmentTypeVal === 'SALARIED' && (
        <div className="animate-fadeIn space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-[#00375e] uppercase tracking-wider">Salaried Profile Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input>
              <Input.Label htmlFor="companyName">Company Name</Input.Label>
              <Input.Field
                id="companyName"
                placeholder="Employer Name"
                hasError={!!errors.companyName}
                {...register('companyName')}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.companyName?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label htmlFor="designation">Designation</Input.Label>
              <Input.Field
                id="designation"
                placeholder="e.g. Software Engineer"
                hasError={!!errors.designation}
                {...register('designation')}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.designation?.message}</Input.Error>
            </Input>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input>
              <Input.Label htmlFor="monthlyNetSalary">Monthly Net Salary (₹)</Input.Label>
              <Input.Field
                id="monthlyNetSalary"
                type="number"
                placeholder="Min: 15,000"
                hasError={!!errors.monthlyNetSalary}
                {...register('monthlyNetSalary', { valueAsNumber: true })}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.monthlyNetSalary?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label htmlFor="yearsOfExperience">Years of Experience</Input.Label>
              <Input.Field
                id="yearsOfExperience"
                type="number"
                placeholder="e.g. 3"
                hasError={!!errors.yearsOfExperience}
                {...register('yearsOfExperience', { valueAsNumber: true })}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.yearsOfExperience?.message}</Input.Error>
            </Input>
          </div>
        </div>
      )}

      {employmentTypeVal === 'SELF_EMPLOYED' && (
        <div className="animate-fadeIn space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-[#00375e] uppercase tracking-wider">Self Employed Profile Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input>
              <Input.Label htmlFor="businessName">Business Name</Input.Label>
              <Input.Field
                id="businessName"
                placeholder="Shop or Practice Name"
                hasError={!!errors.businessName}
                {...register('businessName')}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.businessName?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label htmlFor="businessType">Business Type</Input.Label>
              <Select
                id="businessType"
                options={businessTypeOptions}
                hasError={!!errors.businessType}
                {...register('businessType')}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.businessType?.message}</Input.Error>
            </Input>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input>
              <Input.Label htmlFor="yearsInBusiness">Years in Business</Input.Label>
              <Input.Field
                id="yearsInBusiness"
                type="number"
                placeholder="Min: 2 years"
                hasError={!!errors.yearsInBusiness}
                {...register('yearsInBusiness', { valueAsNumber: true })}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.yearsInBusiness?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label htmlFor="monthlyIncome">Monthly Income (₹)</Input.Label>
              <Input.Field
                id="monthlyIncome"
                type="number"
                placeholder="e.g. 50000"
                hasError={!!errors.monthlyIncome}
                {...register('monthlyIncome', { valueAsNumber: true })}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.monthlyIncome?.message}</Input.Error>
            </Input>
          </div>
        </div>
      )}

      {employmentTypeVal === 'BUSINESS_OWNER' && (
        <div className="animate-fadeIn space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-[#00375e] uppercase tracking-wider">Business Owner Profile Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input>
              <Input.Label htmlFor="businessName">Registered Business Name</Input.Label>
              <Input.Field
                id="businessName"
                placeholder="Enter official registered name"
                hasError={!!errors.businessName}
                {...register('businessName')}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.businessName?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label htmlFor="businessType">Business Entity Type</Input.Label>
              <Select
                id="businessType"
                options={businessTypeOptions}
                hasError={!!errors.businessType}
                {...register('businessType')}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.businessType?.message}</Input.Error>
            </Input>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input>
              <Input.Label htmlFor="annualTurnover">Annual Turnover (₹)</Input.Label>
              <Input.Field
                id="annualTurnover"
                type="number"
                placeholder="Min: ₹3,00,000"
                hasError={!!errors.annualTurnover}
                {...register('annualTurnover', { valueAsNumber: true })}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.annualTurnover?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label htmlFor="yearsInBusiness">Years in Business</Input.Label>
              <Input.Field
                id="yearsInBusiness"
                type="number"
                placeholder="Min: 2 years"
                hasError={!!errors.yearsInBusiness}
                {...register('yearsInBusiness', { valueAsNumber: true })}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.yearsInBusiness?.message}</Input.Error>
            </Input>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input>
              <Input.Label htmlFor="gstNumber">GST Number</Input.Label>
              <Input.Field
                id="gstNumber"
                placeholder="15-character GSTIN"
                maxLength={15}
                hasError={!!errors.gstNumber}
                {...register('gstNumber')}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.gstNumber?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label htmlFor="officeAddress">Office Address</Input.Label>
              <Input.Field
                id="officeAddress"
                placeholder="Full Office Address"
                hasError={!!errors.officeAddress}
                {...register('officeAddress')}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.officeAddress?.message}</Input.Error>
            </Input>
          </div>
        </div>
      )}
    </form>
  );
}
