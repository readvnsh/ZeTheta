import useFormStore from '../store/formStore';
import Step1LoanDetails from './Step1LoanDetails';
import Step2PersonalInfo from './Step2PersonalInfo';

export default function MainLayout() {
  const {
    step, setStep,
  } = useFormStore();

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const stepsList = [
    { num: 1, label: 'Loan Details', icon: 'payments' },
    { num: 2, label: 'Personal Info', icon: 'person' },
    {
      num: 3, label: 'Co-Applicant', icon: 'group', disabled: true,
    },
    {
      num: 4, label: 'Documents', icon: 'description', disabled: true,
    },
    {
      num: 5, label: 'Review & Submit', icon: 'send', disabled: true,
    },
  ];

  const getStepButtonClass = (sNum: number) => {
    if (step === sNum) {
      return 'bg-[#00375e]/10 text-[#00375e] font-semibold';
    }
    if (step > sNum) {
      return 'text-[#006d37] hover:bg-green-50/50 font-medium';
    }
    return 'text-gray-400 cursor-not-allowed';
  };

  const getStepNumberClass = (sNum: number) => {
    if (step === sNum) {
      return 'bg-[#00375e] text-white';
    }
    if (step > sNum) {
      return 'bg-[#006d37] text-white';
    }
    return 'bg-gray-100 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      {/* Top Header */}
      <header className="fixed top-0 left-0 w-full z-50 h-16 bg-white border-b border-gray-200 flex justify-between items-center px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xl font-extrabold text-[#00375e] tracking-tight">LendSwift</span>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 font-medium">Loan Portal</span>
        </div>
        <div className="text-xs text-gray-400 font-mono">App ID: LS-48291</div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 pt-16 pb-16">
        {/* Sidebar Stepper */}
        <nav className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 p-6 hidden md:flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Application Steps</h2>
              <p className="text-xs text-gray-500 mt-1">Provide information to apply</p>
            </div>
            <ul className="space-y-3">
              {stepsList.map((s) => {
                const isCompleted = step > s.num;

                return (
                  <li key={s.num}>
                    <button
                      type="button"
                      disabled={!(s.disabled || isCompleted)}
                      onClick={() => !s.disabled && isCompleted && setStep(s.num)}
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
            <p className="text-xs text-gray-400">&copy; 2026 LendSwift Inc.</p>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 p-6 md:p-8 max-w-4xl mx-auto w-full">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
            {step === 1 && <Step1LoanDetails />}
            {step === 2 && <Step2PersonalInfo />}
          </div>
        </main>
      </div>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 w-full md:left-64 md:w-[calc(100%-256px)] h-16 bg-white border-t border-gray-200 flex justify-between items-center px-6 shadow-md z-40">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Back
        </button>

        <button
          type="submit"
          form={step === 1 ? 'step1-form' : 'step2-form'}
          className="flex items-center gap-2 px-5 py-2 bg-[#00375e] text-white rounded-lg text-sm font-medium hover:bg-[#1f4e79] transition-all shadow-sm"
        >
          {step === 2 ? 'Submit Application' : 'Next Step'}
        </button>
      </footer>
    </div>
  );
}
