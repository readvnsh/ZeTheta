interface DraftRecoveryModalProps {
  show: boolean;
  onResume: () => void;
  onStartFresh: () => void;
  draftInfo: { step: number; loanType: string } | null;
}

export default function DraftRecoveryModal({
  show,
  onResume,
  onStartFresh,
  draftInfo,
}: DraftRecoveryModalProps) {
  if (!show || !draftInfo) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 transform scale-100 transition-all duration-300">
        <div className="space-y-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-2xl" data-icon="restore">restore</span>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">Retrieve Stored Draft?</h3>
            <p className="text-sm text-gray-500">
              We found an incomplete secure draft of a
              {' '}
              <strong className="text-gray-700">
                {draftInfo.loanType}
                {' '}
                Loan
              </strong>
              {' '}
              application at
              {' '}
              <strong className="text-gray-700">
                Step
                {draftInfo.step}
              </strong>
              . Would you like to resume?
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onStartFresh}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              Start Fresh
            </button>
            <button
              type="button"
              onClick={onResume}
              className="px-5 py-2 bg-[#00375e] text-white rounded-lg text-sm font-medium hover:bg-[#1f4e79] transition-all shadow-sm"
            >
              Resume Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
