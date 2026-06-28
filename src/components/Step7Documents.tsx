import { useForm, Controller } from 'react-hook-form';
import useFormStore from '../store/formStore';
import { FileUpload, SignaturePad } from './common';

export default function Step7Documents() {
  const {
    step1Data,
    step5Data,
    isPanVerified,
    step7Data,
    setStep7Data,
    setStep,
  } = useFormStore();

  const loanType = step1Data?.loanType ?? 'Personal';
  const employmentType = step5Data?.employmentType;

  const reqPan = !isPanVerified;
  const reqSalary = employmentType === 'SALARIED';
  const reqBank = employmentType === 'SALARIED' || employmentType === 'BUSINESS_OWNER';
  const reqItr = employmentType === 'SELF_EMPLOYED' || employmentType === 'BUSINESS_OWNER';
  const reqProperty = loanType === 'Home';
  const reqBusiness = loanType === 'Business';

  const makePlaceholderFile = (meta: { name: string; size: number } | null | undefined) => {
    if (!meta) return null;
    return new File(['placeholder'], meta.name, {
      type: meta.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
    });
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      panCard: makePlaceholderFile(step7Data?.panCard),
      aadhaarFront: makePlaceholderFile(step7Data?.aadhaarFront),
      aadhaarBack: makePlaceholderFile(step7Data?.aadhaarBack),
      salarySlips: makePlaceholderFile(step7Data?.salarySlips),
      bankStatements: makePlaceholderFile(step7Data?.bankStatements),
      itr: makePlaceholderFile(step7Data?.itr),
      propertyDocs: makePlaceholderFile(step7Data?.propertyDocs),
      businessReg: makePlaceholderFile(step7Data?.businessReg),
      photograph: makePlaceholderFile(step7Data?.photograph),
      signature: step7Data?.signature || null,
    },
  });

  const onSubmit = (values: any) => {
    const serializeFile = (f: File | null) => {
      if (!f) return null;
      return { name: f.name, size: f.size };
    };

    const storePayload = {
      panCard: reqPan ? serializeFile(values.panCard) : null,
      aadhaarFront: serializeFile(values.aadhaarFront),
      aadhaarBack: serializeFile(values.aadhaarBack),
      salarySlips: reqSalary ? serializeFile(values.salarySlips) : null,
      bankStatements: reqBank ? serializeFile(values.bankStatements) : null,
      itr: reqItr ? serializeFile(values.itr) : null,
      propertyDocs: reqProperty ? serializeFile(values.propertyDocs) : null,
      businessReg: reqBusiness ? serializeFile(values.businessReg) : null,
      photograph: serializeFile(values.photograph),
      signature: values.signature,
    };

    setStep7Data(storePayload);
    setStep(8); // Move to Step 8 (Review & Submit)
  };

  return (
    <form id="step7-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[#00375e] tracking-tight">Documents & Signature</h2>
        <p className="text-sm text-gray-500">Upload your verified identity documents and draw your e-signature below.</p>
      </div>

      {Object.keys(errors).length > 0 && (
        <div id="step7-validation-errors" className="p-4 bg-red-50 text-red-800 rounded-lg text-xs font-mono whitespace-pre-wrap">
          <p className="font-bold mb-1">Validation Errors:</p>
          {JSON.stringify(errors, (k, v) => (k === 'ref' ? undefined : v), 2)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PAN Card */}
        {reqPan && (
          <Controller
            name="panCard"
            control={control}
            rules={{ required: 'PAN Card is required' }}
            render={({ field }) => (
              <FileUpload
                id="panCard"
                label="PAN Card (JPEG/PNG/PDF up to 5MB)"
                acceptTypes={['image/jpeg', 'image/png', 'application/pdf']}
                maxSizeInBytes={5 * 1024 * 1024}
                onFileSelect={field.onChange}
                value={field.value}
                hasError={!!errors.panCard}
              />
            )}
          />
        )}

        {/* Photograph */}
        <Controller
          name="photograph"
          control={control}
          rules={{ required: 'Photograph is required' }}
          render={({ field }) => (
            <FileUpload
              id="photograph"
              label="Passport Size Photograph (JPEG/PNG up to 2MB)"
              acceptTypes={['image/jpeg', 'image/png']}
              maxSizeInBytes={2 * 1024 * 1024}
              onFileSelect={field.onChange}
              value={field.value}
              hasError={!!errors.photograph}
            />
          )}
        />

        {/* Aadhaar Front */}
        <Controller
          name="aadhaarFront"
          control={control}
          rules={{ required: 'Aadhaar Front is required' }}
          render={({ field }) => (
            <FileUpload
              id="aadhaarFront"
              label="Aadhaar Card Front (JPEG/PNG/PDF up to 5MB)"
              acceptTypes={['image/jpeg', 'image/png', 'application/pdf']}
              maxSizeInBytes={5 * 1024 * 1024}
              onFileSelect={field.onChange}
              value={field.value}
              hasError={!!errors.aadhaarFront}
            />
          )}
        />

        {/* Aadhaar Back */}
        <Controller
          name="aadhaarBack"
          control={control}
          rules={{ required: 'Aadhaar Back is required' }}
          render={({ field }) => (
            <FileUpload
              id="aadhaarBack"
              label="Aadhaar Card Back (JPEG/PNG/PDF up to 5MB)"
              acceptTypes={['image/jpeg', 'image/png', 'application/pdf']}
              maxSizeInBytes={5 * 1024 * 1024}
              onFileSelect={field.onChange}
              value={field.value}
              hasError={!!errors.aadhaarBack}
            />
          )}
        />

        {/* Salary Slips */}
        {reqSalary && (
          <Controller
            name="salarySlips"
            control={control}
            rules={{ required: 'Salary Slips are required' }}
            render={({ field }) => (
              <FileUpload
                id="salarySlips"
                label="Salary Slips - 3 Months (PDF up to 5MB)"
                acceptTypes={['application/pdf']}
                maxSizeInBytes={5 * 1024 * 1024}
                onFileSelect={field.onChange}
                value={field.value}
                hasError={!!errors.salarySlips}
              />
            )}
          />
        )}

        {/* Bank Statements */}
        {reqBank && (
          <Controller
            name="bankStatements"
            control={control}
            rules={{ required: 'Bank Statements are required' }}
            render={({ field }) => (
              <FileUpload
                id="bankStatements"
                label="Bank Statements - 6 Months (PDF up to 10MB)"
                acceptTypes={['application/pdf']}
                maxSizeInBytes={10 * 1024 * 1024}
                onFileSelect={field.onChange}
                value={field.value}
                hasError={!!errors.bankStatements}
              />
            )}
          />
        )}

        {/* ITR */}
        {reqItr && (
          <Controller
            name="itr"
            control={control}
            rules={{ required: 'ITR is required' }}
            render={({ field }) => (
              <FileUpload
                id="itr"
                label="ITR - 2 Years (PDF up to 5MB)"
                acceptTypes={['application/pdf']}
                maxSizeInBytes={5 * 1024 * 1024}
                onFileSelect={field.onChange}
                value={field.value}
                hasError={!!errors.itr}
              />
            )}
          />
        )}

        {/* Property Docs */}
        {reqProperty && (
          <Controller
            name="propertyDocs"
            control={control}
            rules={{ required: 'Property Documents are required' }}
            render={({ field }) => (
              <FileUpload
                id="propertyDocs"
                label="Property Ownership Documents (PDF up to 10MB)"
                acceptTypes={['application/pdf']}
                maxSizeInBytes={10 * 1024 * 1024}
                onFileSelect={field.onChange}
                value={field.value}
                hasError={!!errors.propertyDocs}
              />
            )}
          />
        )}

        {/* Business Reg */}
        {reqBusiness && (
          <Controller
            name="businessReg"
            control={control}
            rules={{ required: 'Business Registration details are required' }}
            render={({ field }) => (
              <FileUpload
                id="businessReg"
                label="Business Registration & GST Returns (PDF up to 5MB)"
                acceptTypes={['application/pdf']}
                maxSizeInBytes={5 * 1024 * 1024}
                onFileSelect={field.onChange}
                value={field.value}
                hasError={!!errors.businessReg}
              />
            )}
          />
        )}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <Controller
          name="signature"
          control={control}
          rules={{ required: 'Signature is required' }}
          render={({ field }) => (
            <SignaturePad
              onChange={field.onChange}
              value={field.value}
              hasError={!!errors.signature}
            />
          )}
        />
        {errors.signature && (
          <p className="text-sm text-red-600 mt-1">{errors.signature.message as string}</p>
        )}
      </div>
    </form>
  );
}
