import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step4Schema, Step4FormData } from '../schemas';
import useFormStore from '../store/formStore';
import usePinCodeLookup from '../hooks/usePinCodeLookup';
import { Input, Checkbox, Select } from './common';

const residenceTypeOptions = [
  { label: 'Owned', value: 'Owned' },
  { label: 'Rented', value: 'Rented' },
  { label: 'Company', value: 'Company' },
  { label: 'Family', value: 'Family' },
];

export default function Step4Address() {
  const { step4Data, setStep4Data, setStep } = useFormStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: (step4Data || {
      currentAddress: {
        addressLine1: '', addressLine2: '', pinCode: '', city: '', state: '',
      },
      residenceType: 'Owned',
      yearsAtAddress: 0,
      rentAmount: '',
      sameAsPermanent: true,
      permanentAddress: {
        addressLine1: '', addressLine2: '', pinCode: '', city: '', state: '',
      },
      previousAddress: {
        addressLine1: '', addressLine2: '', pinCode: '', city: '', state: '',
      },
    }) as Step4FormData,
  });

  const { lookup: lookupCurrent, isLoading: isCurrentLoading } = usePinCodeLookup();
  const { lookup: lookupPrevious, isLoading: isPrevLoading } = usePinCodeLookup();
  const { lookup: lookupPermanent, isLoading: isPermLoading } = usePinCodeLookup();

  // Watch fields for conditional logic
  const currentAddressVal = watch('currentAddress');
  const sameAsPermanentVal = watch('sameAsPermanent');
  const residenceTypeVal = watch('residenceType');
  const yearsAtAddressVal = watch('yearsAtAddress');

  const currentPin = watch('currentAddress.pinCode');
  const previousPin = watch('previousAddress.pinCode');
  const permanentPin = watch('permanentAddress.pinCode');

  // Autofill Current Address on PIN code = 6 digits
  useEffect(() => {
    if (currentPin && currentPin.length === 6) {
      lookupCurrent(currentPin).then((res) => {
        if (res) {
          setValue('currentAddress.city', res.city);
          setValue('currentAddress.state', res.state);
        }
      });
    }
  }, [currentPin, lookupCurrent, setValue]);

  // Autofill Previous Address on PIN code = 6 digits
  useEffect(() => {
    if (previousPin && previousPin.length === 6) {
      lookupPrevious(previousPin).then((res) => {
        if (res) {
          setValue('previousAddress.city', res.city);
          setValue('previousAddress.state', res.state);
        }
      });
    }
  }, [previousPin, lookupPrevious, setValue]);

  // Autofill Permanent Address on PIN code = 6 digits
  useEffect(() => {
    if (permanentPin && permanentPin.length === 6) {
      lookupPermanent(permanentPin).then((res) => {
        if (res) {
          setValue('permanentAddress.city', res.city);
          setValue('permanentAddress.state', res.state);
        }
      });
    }
  }, [permanentPin, lookupPermanent, setValue]);

  // Sync Current Address to Permanent Address in real-time when checkbox is checked
  useEffect(() => {
    if (sameAsPermanentVal && currentAddressVal) {
      setValue('permanentAddress', {
        addressLine1: currentAddressVal.addressLine1 || '',
        addressLine2: currentAddressVal.addressLine2 || '',
        pinCode: currentAddressVal.pinCode || '',
        city: currentAddressVal.city || '',
        state: currentAddressVal.state || '',
      });
    }
  }, [sameAsPermanentVal, currentAddressVal, setValue]);

  const onSubmit = (data: Step4FormData) => {
    setStep4Data(data);
    // Move to next step (mocked progression for now)
    setStep(5);
  };

  return (
    <form id="step4-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[#00375e] tracking-tight">Address Information</h2>
        <p className="text-sm text-gray-500">Please provide details of your current, permanent, and previous residences.</p>
      </div>

      {/* Current Address Details */}
      <div className="space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-[#00375e] uppercase tracking-wider">Current Address</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input>
            <Input.Label htmlFor="currentAddress.addressLine1">Address Line 1</Input.Label>
            <Input.Field
              id="currentAddress.addressLine1"
              placeholder="House/Plot No, Building Name"
              hasError={!!errors.currentAddress?.addressLine1}
              {...register('currentAddress.addressLine1')}
              className="w-full h-11 border-gray-300 rounded-lg"
            />
            <Input.Error>{errors.currentAddress?.addressLine1?.message}</Input.Error>
          </Input>

          <Input>
            <Input.Label htmlFor="currentAddress.addressLine2">Address Line 2 (Optional)</Input.Label>
            <Input.Field
              id="currentAddress.addressLine2"
              placeholder="Locality, Sector, Landmark"
              hasError={!!errors.currentAddress?.addressLine2}
              {...register('currentAddress.addressLine2')}
              className="w-full h-11 border-gray-300 rounded-lg"
            />
            <Input.Error>{errors.currentAddress?.addressLine2?.message}</Input.Error>
          </Input>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input>
            <Input.Label htmlFor="currentAddress.pinCode">PIN Code</Input.Label>
            <div className="relative">
              <Input.Field
                id="currentAddress.pinCode"
                placeholder="6-digit PIN"
                maxLength={6}
                hasError={!!errors.currentAddress?.pinCode}
                {...register('currentAddress.pinCode')}
                className="w-full h-11 border-gray-300 rounded-lg pr-10"
              />
              {isCurrentLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}
            </div>
            <Input.Error>{errors.currentAddress?.pinCode?.message}</Input.Error>
          </Input>

          <Input>
            <Input.Label htmlFor="currentAddress.city">City</Input.Label>
            <Input.Field
              id="currentAddress.city"
              placeholder="City"
              hasError={!!errors.currentAddress?.city}
              {...register('currentAddress.city')}
              className="w-full h-11 border-gray-300 rounded-lg"
            />
            <Input.Error>{errors.currentAddress?.city?.message}</Input.Error>
          </Input>

          <Input>
            <Input.Label htmlFor="currentAddress.state">State</Input.Label>
            <Input.Field
              id="currentAddress.state"
              placeholder="State"
              hasError={!!errors.currentAddress?.state}
              {...register('currentAddress.state')}
              className="w-full h-11 border-gray-300 rounded-lg"
            />
            <Input.Error>{errors.currentAddress?.state?.message}</Input.Error>
          </Input>
        </div>
      </div>

      {/* Residence Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input>
          <Input.Label htmlFor="residenceType">Residence Type</Input.Label>
          <Select
            id="residenceType"
            options={residenceTypeOptions}
            hasError={!!errors.residenceType}
            {...register('residenceType')}
            className="w-full h-11 border-gray-300 rounded-lg"
          />
          <Input.Error>{errors.residenceType?.message}</Input.Error>
        </Input>

        <Input>
          <Input.Label htmlFor="yearsAtAddress">Years lived at current address</Input.Label>
          <Input.Field
            id="yearsAtAddress"
            type="number"
            placeholder="e.g. 5"
            hasError={!!errors.yearsAtAddress}
            {...register('yearsAtAddress', { valueAsNumber: true })}
            className="w-full h-11 border-gray-300 rounded-lg"
          />
          <Input.Error>{errors.yearsAtAddress?.message}</Input.Error>
        </Input>
      </div>

      {/* Conditional Rent Field */}
      {residenceTypeVal === 'Rented' && (
        <div className="animate-fadeIn p-4 border border-blue-50 rounded-xl bg-blue-50/20">
          <Input>
            <Input.Label htmlFor="rentAmount">Monthly Rent Amount (₹)</Input.Label>
            <Input.Field
              id="rentAmount"
              type="number"
              placeholder="e.g. 15000"
              hasError={!!errors.rentAmount}
              {...register('rentAmount', { valueAsNumber: true })}
              className="w-full h-11 border-gray-300 rounded-lg"
            />
            <Input.Error>{errors.rentAmount?.message}</Input.Error>
          </Input>
        </div>
      )}

      {/* Conditional Previous Address Section */}
      {Number(yearsAtAddressVal) < 1 && (
        <div className="animate-fadeIn space-y-4 border border-orange-100 rounded-xl p-4 bg-orange-50/10">
          <div>
            <h3 className="text-sm font-semibold text-orange-800 uppercase tracking-wider">Previous Address</h3>
            <p className="text-xs text-gray-500 mt-0.5">Required as you have lived at your current address for less than a year.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input>
              <Input.Label htmlFor="previousAddress.addressLine1">Address Line 1</Input.Label>
              <Input.Field
                id="previousAddress.addressLine1"
                placeholder="House/Plot No, Building Name"
                hasError={!!errors.previousAddress?.addressLine1}
                {...register('previousAddress.addressLine1')}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.previousAddress?.addressLine1?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label htmlFor="previousAddress.addressLine2">Address Line 2 (Optional)</Input.Label>
              <Input.Field
                id="previousAddress.addressLine2"
                placeholder="Locality, Sector, Landmark"
                hasError={!!errors.previousAddress?.addressLine2}
                {...register('previousAddress.addressLine2')}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.previousAddress?.addressLine2?.message}</Input.Error>
            </Input>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input>
              <Input.Label htmlFor="previousAddress.pinCode">PIN Code</Input.Label>
              <div className="relative">
                <Input.Field
                  id="previousAddress.pinCode"
                  placeholder="6-digit PIN"
                  maxLength={6}
                  hasError={!!errors.previousAddress?.pinCode}
                  {...register('previousAddress.pinCode')}
                  className="w-full h-11 border-gray-300 rounded-lg pr-10"
                />
                {isPrevLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
              </div>
              <Input.Error>{errors.previousAddress?.pinCode?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label htmlFor="previousAddress.city">City</Input.Label>
              <Input.Field
                id="previousAddress.city"
                placeholder="City"
                hasError={!!errors.previousAddress?.city}
                {...register('previousAddress.city')}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.previousAddress?.city?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label htmlFor="previousAddress.state">State</Input.Label>
              <Input.Field
                id="previousAddress.state"
                placeholder="State"
                hasError={!!errors.previousAddress?.state}
                {...register('previousAddress.state')}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.previousAddress?.state?.message}</Input.Error>
            </Input>
          </div>
        </div>
      )}

      {/* Permanent Address Checkbox Gate */}
      <Checkbox
        label="Permanent Address is same as Current Address"
        hasError={!!errors.sameAsPermanent}
        {...register('sameAsPermanent')}
      />

      {/* Conditional Permanent Address Section */}
      {!sameAsPermanentVal && (
        <div className="animate-fadeIn space-y-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-[#00375e] uppercase tracking-wider">Permanent Address</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input>
              <Input.Label htmlFor="permanentAddress.addressLine1">Address Line 1</Input.Label>
              <Input.Field
                id="permanentAddress.addressLine1"
                placeholder="House/Plot No, Building Name"
                hasError={!!errors.permanentAddress?.addressLine1}
                {...register('permanentAddress.addressLine1')}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.permanentAddress?.addressLine1?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label htmlFor="permanentAddress.addressLine2">Address Line 2 (Optional)</Input.Label>
              <Input.Field
                id="permanentAddress.addressLine2"
                placeholder="Locality, Sector, Landmark"
                hasError={!!errors.permanentAddress?.addressLine2}
                {...register('permanentAddress.addressLine2')}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.permanentAddress?.addressLine2?.message}</Input.Error>
            </Input>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input>
              <Input.Label htmlFor="permanentAddress.pinCode">PIN Code</Input.Label>
              <div className="relative">
                <Input.Field
                  id="permanentAddress.pinCode"
                  placeholder="6-digit PIN"
                  maxLength={6}
                  hasError={!!errors.permanentAddress?.pinCode}
                  {...register('permanentAddress.pinCode')}
                  className="w-full h-11 border-gray-300 rounded-lg pr-10"
                />
                {isPermLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
              </div>
              <Input.Error>{errors.permanentAddress?.pinCode?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label htmlFor="permanentAddress.city">City</Input.Label>
              <Input.Field
                id="permanentAddress.city"
                placeholder="City"
                hasError={!!errors.permanentAddress?.city}
                {...register('permanentAddress.city')}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.permanentAddress?.city?.message}</Input.Error>
            </Input>

            <Input>
              <Input.Label htmlFor="permanentAddress.state">State</Input.Label>
              <Input.Field
                id="permanentAddress.state"
                placeholder="State"
                hasError={!!errors.permanentAddress?.state}
                {...register('permanentAddress.state')}
                className="w-full h-11 border-gray-300 rounded-lg"
              />
              <Input.Error>{errors.permanentAddress?.state?.message}</Input.Error>
            </Input>
          </div>
        </div>
      )}
    </form>
  );
}
