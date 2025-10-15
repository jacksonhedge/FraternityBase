import { X, Lock, Unlock, Award } from 'lucide-react';

interface UnlockConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chapterName: string;
  credits: number;
  balance: number;
  tierLabel: string;
  tierBadge?: string;
}

const UnlockConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  chapterName,
  credits,
  balance,
  tierLabel,
  tierBadge
}: UnlockConfirmationModalProps) => {
  if (!isOpen) return null;

  const hasEnoughCredits = balance >= credits;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Unlock className="w-5 h-5" />
            <h3 className="text-lg font-bold">Unlock Chapter</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Chapter</p>
            <p className="font-semibold text-gray-900">{chapterName}</p>
          </div>

          {tierBadge && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900">{tierBadge}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tier</span>
              <span className="font-semibold text-gray-900">{tierLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cost</span>
              <span className="font-bold text-blue-600 text-lg">{credits} Credits</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Current Balance</span>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-gray-600" />
                <span className="font-semibold text-gray-900">{balance} Credits</span>
              </div>
            </div>
            {hasEnoughCredits && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">After Unlock</span>
                <span className="font-semibold text-green-600">{balance - credits} Credits</span>
              </div>
            )}
          </div>

          {!hasEnoughCredits && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-900">
                ❌ Insufficient Credits
              </p>
              <p className="text-xs text-red-700 mt-1">
                You need {credits - balance} more credits to unlock this chapter.
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <p className="font-medium mb-1">What you'll unlock:</p>
            <ul className="space-y-1 pl-4">
              <li>• Full officer contact information</li>
              <li>• Emails and phone numbers</li>
              <li>• Complete member roster</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (hasEnoughCredits) {
                onConfirm();
                onClose();
              }
            }}
            disabled={!hasEnoughCredits}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              hasEnoughCredits
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {hasEnoughCredits ? `Unlock for ${credits} Credits` : 'Insufficient Credits'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnlockConfirmationModal;
