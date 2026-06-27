import { useState } from 'react';
import useFormStore from '../store/formStore';
import { calculateAmortization, formatINR } from '../utils/emiCalculator';
import { Checkbox } from './common';

export default function Step8Review() {
  const store = useFormStore();
  const {
    step1Data,
    step2Data,
    step3Data,
    step4Data,
    step5Data,
    step6Data,
    step7Data,
    isPanVerified,
    isAadhaarVerified,
    isStep6Required,
    setStep,
    resetForm,
  } = store;

  // Retrieve details
  const loanType = step1Data?.loanType ?? 'Personal';
  const principal = step1Data?.loanAmount ?? 100000;
  const tenure = step1Data?.loanTenure ?? 12;

  // Consents checked state
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const [consent3, setConsent3] = useState(false);
  const [consent4, setConsent4] = useState(false);
  const [dtiAcknowledge, setDtiAcknowledge] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);

  // 1. Calculate Amortization
  const amort = calculateAmortization(principal, tenure, loanType);

  // 2. Calculate DTI ratio
  const getPrimaryMonthlyIncome = () => {
    if (!step5Data) return 0;
    if (step5Data.employmentType === 'SALARIED') {
      return Number(step5Data.monthlyNetSalary);
    }
    if (step5Data.employmentType === 'SELF_EMPLOYED') {
      return Number(step5Data.monthlyIncome);
    }
    if (step5Data.employmentType === 'BUSINESS_OWNER') {
      return Number(step5Data.annualTurnover) / 12;
    }
    return 0;
  };

  const getCoApplicantIncome = () => {
    if (isStep6Required() && step6Data) {
      return Number(step6Data.coApplicantIncome);
    }
    return 0;
  };

  const primaryIncome = getPrimaryMonthlyIncome();
  const coIncome = getCoApplicantIncome();
  const totalIncome = primaryIncome + coIncome;

  const dtiRatio = totalIncome > 0 ? (amort.emi / totalIncome) : 0;
  const isDtiExceeded = dtiRatio > 0.5;

  // Submit button gate
  const isSubmitDisabled = !consent1
    || !consent2
    || !consent3
    || !consent4
    || (isDtiExceeded && !dtiAcknowledge)
    || isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    setIsSubmitting(true);
    // Simulate mock API delay
    await new Promise((resolve) => { setTimeout(resolve, 1500); });

    try {
      const refId = crypto.randomUUID();
      // Wipe localStorage draft
      localStorage.removeItem(`lendswift_draft_${loanType}`);
      setSubmittedRefId(refId);
    } catch (err) {
      // Fallback if UUID generation fails
      const fallbackId = `LS-${Math.floor(100000 + Math.random() * 900000)}`;
      localStorage.removeItem(`lendswift_draft_${loanType}`);
      setSubmittedRefId(fallbackId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    resetForm();
    setStep(1);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[#00375e] tracking-tight">Review & Pre-Approval Summary</h2>
        <p className="text-sm text-gray-500">Confirm your application details and accept the final pre-approval terms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Read-Only Accordion Summaries */}
        <div className="lg:col-span-7 space-y-4">
          {/* Step 1 Card */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-lg" data-icon="payments">payments</span>
                Loan Details
              </h3>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                Type:
                <strong className="text-gray-800">{loanType}</strong>
              </div>
              <div>
                Amount:
                <strong className="text-gray-800">{formatINR(principal)}</strong>
              </div>
              <div>
                Tenure:
                <strong className="text-gray-800">
                  {tenure}
                  {' '}
                  Months
                </strong>
              </div>
              <div>
                Purpose:
                <strong className="text-gray-800">{step1Data?.loanPurpose || '-'}</strong>
              </div>
            </div>
          </div>

          {/* Step 2 Card */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-lg" data-icon="person">person</span>
                Personal Information
              </h3>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="col-span-2">
                Name:
                <strong className="text-gray-800">{step2Data?.fullName || '-'}</strong>
              </div>
              <div>
                DOB:
                <strong className="text-gray-800">{step2Data?.dob || '-'}</strong>
              </div>
              <div>
                Mobile:
                <strong className="text-gray-800">{step2Data?.mobile || '-'}</strong>
              </div>
              <div className="col-span-2">
                Email:
                <strong className="text-gray-800">{step2Data?.email || '-'}</strong>
              </div>
            </div>
          </div>

          {/* Step 3 Card */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-lg" data-icon="security">security</span>
                KYC & Verification
              </h3>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                PAN:
                <strong className="text-gray-800">{step3Data?.panNumber || '-'}</strong>
              </div>
              <div>
                Status:
                <span className="text-green-600 font-bold">{isPanVerified ? '✓ Verified' : 'Unverified'}</span>
              </div>
              <div>
                Aadhaar:
                <strong className="text-gray-800">{step3Data?.aadhaarNumber ? `XXXX-XXXX-${step3Data.aadhaarNumber.slice(-4)}` : '-'}</strong>
              </div>
              <div>
                Status:
                <span className="text-green-600 font-bold">{isAadhaarVerified ? '✓ Verified' : 'Unverified'}</span>
              </div>
            </div>
          </div>

          {/* Step 4 Card */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-lg" data-icon="home">home</span>
                Address Details
              </h3>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                Current:
                <strong className="text-gray-800">
                  {step4Data?.currentAddress.addressLine1}
                  ,
                  {' '}
                  {step4Data?.currentAddress.city}
                  {' '}
                  -
                  {' '}
                  {step4Data?.currentAddress.pinCode}
                </strong>
              </div>
              <div>
                Residence Type:
                <strong className="text-gray-800">{step4Data?.residenceType || '-'}</strong>
              </div>
            </div>
          </div>

          {/* Step 5 Card */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-lg" data-icon="work">work</span>
                Employment & Income
              </h3>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>
                Profile:
                <strong className="text-gray-800">{step5Data?.employmentType || '-'}</strong>
              </div>
              <div>
                Monthly Income:
                <strong className="text-gray-800">{formatINR(primaryIncome)}</strong>
              </div>
            </div>
          </div>

          {/* Step 6 Card */}
          {isStep6Required() && step6Data && (
            <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-lg" data-icon="group">group</span>
                  Co-Applicant Details
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  Name:
                  <strong className="text-gray-800">{step6Data.coApplicantName}</strong>
                </div>
                <div>
                  Income:
                  <strong className="text-gray-800">{formatINR(coIncome)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Step 7 Card */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-lg" data-icon="description">description</span>
                Documents & Signature
              </h3>
              <button
                type="button"
                onClick={() => setStep(7)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>
                  Photograph:
                  <span className="text-green-600 font-bold">✓ Attached</span>
                </div>
                <div>
                  Aadhaar:
                  <span className="text-green-600 font-bold">✓ Attached</span>
                </div>
              </div>
              {step7Data?.signature && (
                <div className="pt-2">
                  <span className="text-xs text-gray-400 block mb-1">Captured Signature Preview:</span>
                  <img
                    src={step7Data.signature}
                    alt="Signature"
                    className="max-h-16 border border-gray-200 rounded p-1 bg-gray-50/50"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pre-Approval Summary & Consents */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          {/* Pre-Approval Summary Card */}
          <div className="border border-blue-200 rounded-2xl p-5 bg-gradient-to-br from-blue-50/60 to-white shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-base">Pre-Approval Summary</h3>
              <p className="text-xs text-gray-500">Based on your credentials, here is your estimated repayment plan.</p>
            </div>

            <div className="space-y-2 border-b border-blue-100 pb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Loan Principal</span>
                <span className="font-semibold text-gray-900">{formatINR(principal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Interest Rate</span>
                <span className="font-semibold text-gray-900">
                  {loanType === 'Home' && '8.5% (Home)'}
                  {loanType === 'Personal' && '10.5% (Personal)'}
                  {loanType === 'Business' && '14.0% (Business)'}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Processing Fee (1%)</span>
                <span className="font-semibold text-gray-900">{amort.processingFeeFormatted}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider block">Estimated Monthly EMI</span>
                <span className="text-2xl font-black text-[#00375e]">{amort.emiFormatted}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 block">Total Interest Cost</span>
                <span className="font-bold text-gray-800">{amort.totalInterestFormatted}</span>
              </div>
            </div>
          </div>

          {/* DTI Warning Banner */}
          {isDtiExceeded && (
            <div className="animate-fadeIn p-4 border border-orange-200 rounded-xl bg-orange-50/50 space-y-3">
              <div className="flex gap-2 text-orange-800">
                <span className="material-symbols-outlined text-xl" data-icon="warning">warning</span>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">High Debt-to-Income (DTI) Alert</h4>
                  <p className="text-xs text-orange-700">
                    Your estimated monthly EMI (
                    <strong>{amort.emiFormatted}</strong>
                    ) exceeds 50% of your total combined monthly income (
                    <strong>{formatINR(totalIncome)}</strong>
                    ).
                  </p>
                </div>
              </div>
              <Checkbox
                label="I acknowledge that my estimated EMI exceeds 50% of my total monthly income and I agree to proceed with this application."
                hasError={false}
                checked={dtiAcknowledge}
                onChange={(e) => setDtiAcknowledge(e.target.checked)}
              />
            </div>
          )}

          {/* Consents & Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Declaration & Consents</h4>
            <div className="space-y-3">
              <Checkbox
                label="I confirm that all information provided in this application is accurate and true."
                hasError={false}
                checked={consent1}
                onChange={(e) => setConsent1(e.target.checked)}
              />
              <Checkbox
                label="I authorize LendSwift to retrieve my credit score from CIBIL/Equifax."
                hasError={false}
                checked={consent2}
                onChange={(e) => setConsent2(e.target.checked)}
              />
              <Checkbox
                label="I agree to the Terms & Conditions and Privacy Policy."
                hasError={false}
                checked={consent3}
                onChange={(e) => setConsent3(e.target.checked)}
              />
              <Checkbox
                label="I consent to receive communication regarding my loan status via SMS/Email."
                hasError={false}
                checked={consent4}
                onChange={(e) => setConsent4(e.target.checked)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full h-12 mt-4 bg-[#00375e] text-white rounded-xl font-semibold hover:bg-[#1f4e79] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting Application...
                </>
              ) : (
                <>Submit Loan Application</>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success Submission Modal */}
      {submittedRefId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 text-center space-y-6 animate-scaleIn">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto">
              <span className="material-symbols-outlined text-4xl" data-icon="check_circle">check_circle</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-900">Application Submitted!</h3>
              <p className="text-sm text-gray-500">
                Your application has been received and matches our pre-approval criteria.
              </p>
            </div>

            {/* Reference ID Badge */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 inline-block w-full">
              <span className="text-xs text-gray-400 uppercase tracking-wider block font-bold">Application Reference ID</span>
              <strong className="text-gray-800 text-base font-mono block break-all mt-1">{submittedRefId}</strong>
            </div>

            {/* Pre-Approved Summary Details */}
            <div className="border border-blue-100 rounded-2xl p-4 bg-blue-50/20 text-left text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Pre-Approved Principal:</span>
                <strong className="text-gray-800">{formatINR(principal)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Interest Rate:</span>
                <strong className="text-gray-800">
                  {loanType === 'Home' && '8.5% p.a.'}
                  {loanType === 'Personal' && '10.5% p.a.'}
                  {loanType === 'Business' && '14.0% p.a.'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Loan Tenure:</span>
                <strong className="text-gray-800">
                  {tenure}
                  {' '}
                  Months
                </strong>
              </div>
              <div className="flex justify-between border-t border-blue-100/50 pt-2 mt-2">
                <span className="font-semibold text-blue-900">Monthly EMI:</span>
                <strong className="text-blue-900 font-bold text-base">{amort.emiFormatted}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDone}
              className="w-full h-12 bg-[#00375e] text-white rounded-xl font-semibold hover:bg-[#1f4e79] transition-all shadow-md"
            >
              Done & Return Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
