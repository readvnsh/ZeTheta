import useFormStore from '../store/formStore';
import Step1LoanDetails from './Step1LoanDetails';
import Step2PersonalInfo from './Step2PersonalInfo';
import Step3KYC from './Step3KYC';
import Step4Address from './Step4Address';
import Step5Employment from './Step5Employment';
import Step6CoApplicant from './Step6CoApplicant';
import Step7Documents from './Step7Documents';
import Step8Review from './Step8Review';
import useAutoSave from '../hooks/useAutoSave';
import useFormPersistence from '../hooks/useFormPersistence';
import DraftRecoveryModal from './DraftRecoveryModal';

export default function MainLayout() {
  const {
    step, setStep, step3Consent, isPanVerified, isAadhaarVerified, isStep6Required,
  } = useFormStore();

  // Initialize secure autosave hook in background
  useAutoSave();

  // Initialize draft recovery checks on mount
  const {
    showModal, draftInfo, handleResume, handleStartFresh,
  } = useFormPersistence();

  const handleBack = () => {
    if (step === 7 && !isStep6Required()) {
      setStep(5);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const stepsList = [
    { num: 1, label: 'Loan Details', icon: 'payments' },
    { num: 2, label: 'Personal Info', icon: 'person' },
    { num: 3, label: 'KYC & Verification', icon: 'security' },
    { num: 4, label: 'Address Info', icon: 'home' },
    { num: 5, label: 'Employment Details', icon: 'work' },
    ...(isStep6Required() ? [{ num: 6, label: 'Co-Applicant', icon: 'group' }] : []),
    {
      num: 7, label: 'Documents', icon: 'description',
    },
    {
      num: 8, label: 'Review & Submit', icon: 'send',
    },
  ];

  const getStepButtonClass = (sNum: number) => {
    if (step === sNum) {
      return 'bg-[#00375e]/10 text-[#00375e] font-semibold';
    }
    if (step > sNum) {
      return 'text-[#006d37] hover:bg-green-50/50 font-medium';
    }
    return 'text-gray-500 cursor-not-allowed';
  };

  const getStepNumberClass = (sNum: number) => {
    if (step === sNum) {
      return 'bg-[#00375e] text-white';
    }
    if (step > sNum) {
      return 'bg-[#006d37] text-white';
    }
    return 'bg-gray-200 text-gray-600';
  };

  const isNextDisabled = () => {
    if (step === 3) {
      return !step3Consent || !isPanVerified || !isAadhaarVerified;
    }
    return false;
  };

  const getFormId = () => {
    if (step === 1) return 'step1-form';
    if (step === 2) return 'step2-form';
    if (step === 3) return 'step3-form';
    if (step === 4) return 'step4-form';
    if (step === 5) return 'step5-form';
    if (step === 6) return 'step6-form';
    return 'step7-form';
  };

  const getSubmitText = () => {
    if (step === 7) return 'Proceed';
    if (step === 6) return 'Proceed';
    if (step === 5) return 'Proceed';
    return 'Next Step';
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      {/* Top Header */}
      <header className="fixed top-0 left-0 w-full z-50 h-16 bg-white border-b border-gray-200 flex justify-between items-center px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-[#00375e] tracking-tight">LendSwift</h1>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 font-medium">Loan Portal</span>
        </div>
        <div className="text-xs text-gray-500 font-mono">App ID: LS-48291</div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 pt-16 pb-16">
        {/* Sidebar Stepper */}
        <nav className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 p-6 hidden md:flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Application Steps</h2>
              <p className="text-xs text-gray-500 mt-1">Provide information to apply</p>
            </div>
            <ul className="space-y-3">
              {stepsList.map((s) => {
                const isCompleted = step > s.num;

                return (
                  <li key={s.num}>
                    <button
                      type="button"
                      disabled={!isCompleted}
                      onClick={() => isCompleted && setStep(s.num)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all ${getStepButtonClass(s.num)}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getStepNumberClass(s.num)}`}
                      >
                        {isCompleted ? '✓' : s.num}
                      </span>
                      <span>{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">&copy; 2026 LendSwift Inc.</p>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 p-6 md:p-8 max-w-4xl mx-auto w-full">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            {step === 1 && <Step1LoanDetails />}
            {step === 2 && <Step2PersonalInfo />}
            {step === 3 && <Step3KYC />}
            {step === 4 && <Step4Address />}
            {step === 5 && <Step5Employment />}
            {step === 6 && <Step6CoApplicant />}
            {step === 7 && <Step7Documents />}
            {step === 8 && <Step8Review />}
          </div>
          <DraftRecoveryModal
            show={showModal}
            onResume={handleResume}
            onStartFresh={handleStartFresh}
            draftInfo={draftInfo}
          />
        </main>
      </div>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 w-full md:left-64 md:w-[calc(100%-256px)] h-16 bg-white border-t border-gray-200 flex justify-between items-center px-6 shadow-md z-40">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className="flex items-center gap-2 px-4 h-11 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed transition-all"
        >
          Back
        </button>

        {step < 8 && (
          <button
            type="submit"
            form={getFormId()}
            disabled={isNextDisabled()}
            className="flex items-center gap-2 px-5 h-11 bg-[#00375e] text-white rounded-lg text-sm font-medium hover:bg-[#1f4e79] disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {getSubmitText()}
          </button>
        )}
      </footer>
    </div>
  );
}
