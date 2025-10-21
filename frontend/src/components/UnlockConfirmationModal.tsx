import { X, Lock, Unlock, Award, Crown, Sparkles } from 'lucide-react';
import { createPortal } from 'react-dom';

interface UnlockConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chapterName: string;
  credits: number;
  balance: number;
  tierLabel: string;
  tierBadge?: string;
  subscriptionUnlocksRemaining?: number;
  isUnlimitedUnlocks?: boolean;
  willUseSubscriptionUnlock?: boolean;
  isUnlocking?: boolean;
}

const UnlockConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  chapterName,
  credits,
  balance,
  tierLabel,
  tierBadge,
  subscriptionUnlocksRemaining = 0,
  isUnlimitedUnlocks = false,
  willUseSubscriptionUnlock = false,
  isUnlocking = false
}: UnlockConfirmationModalProps) => {
  if (!isOpen) return null;

  console.log('🔍 Modal props:', {
    chapterName,
    credits,
    balance,
    tierLabel,
    subscriptionUnlocksRemaining,
    isUnlimitedUnlocks,
    willUseSubscriptionUnlock,
    isUnlocking
  });

  const hasEnoughCredits = balance >= credits;
  const canUnlock = willUseSubscriptionUnlock || hasEnoughCredits;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden" style={{ maxWidth: '28rem' }}>
        {/* Header - Purple gradient for subscription, Blue gradient for credits */}
        <div className={`px-6 py-4 flex items-center justify-between ${
          willUseSubscriptionUnlock
            ? 'bg-gradient-to-r from-purple-600 to-purple-700'
            : 'bg-gradient-to-r from-blue-600 to-blue-700'
        }`}>
          <div className="flex items-center gap-2 text-white">
            <Unlock className="w-5 h-5" />
            <h3 className="text-lg font-bold">
              {willUseSubscriptionUnlock ? '✨ Subscription Unlock' : 'Unlock Chapter'}
            </h3>
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

          {/* Subscription Unlock Notification */}
          {willUseSubscriptionUnlock && (
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Crown className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-base font-bold text-purple-900 mb-2">
                    ✨ Using Subscription Unlock - No Credits Charged!
                  </p>
                  <p className="text-sm text-purple-800">
                    {isUnlimitedUnlocks
                      ? 'You have unlimited unlocks for Premium chapters this month.'
                      : `You have ${subscriptionUnlocksRemaining} subscription unlock${subscriptionUnlocksRemaining !== 1 ? 's' : ''} remaining for Premium chapters this month.`}
                  </p>
                  {!isUnlimitedUnlocks && (
                    <div className="mt-2 pt-2 border-t border-purple-200">
                      <p className="text-sm font-medium text-purple-900">
                        💰 You're saving {credits} credits (${(credits * 0.99).toFixed(2)}) by using your subscription!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Only show cost details for credit-based unlocks */}
          {!willUseSubscriptionUnlock && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Chapter Tier</span>
                <span className="font-semibold text-gray-900">
                  {tierLabel}
                  {tierLabel === 'Premium' && ' (5.0⭐)'}
                  {tierLabel === 'Quality' && ' (4.5⭐)'}
                  {tierLabel === 'Good' && ' (4.0⭐)'}
                  {tierLabel === 'Standard' && ' (3.5⭐)'}
                  {tierLabel === 'Basic' && ' (3.0⭐)'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Regular Cost (Without Subscription)</span>
                <span className="font-semibold text-gray-900 line-through">{credits} Credits</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Your Cost Today</span>
                <span className="font-bold text-2xl text-purple-600">$0.00 <span className="text-sm font-normal">FREE</span></span>
              </div>
            </div>
          )}

          {/* Show subscription unlock count for subscription unlocks */}
          {willUseSubscriptionUnlock && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Subscription Unlocks</span>
                <span className="font-semibold text-purple-600">
                  {isUnlimitedUnlocks ? '∞ Unlimited' : `${subscriptionUnlocksRemaining} remaining`}
                </span>
              </div>
              {!isUnlimitedUnlocks && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">After Unlock</span>
                  <span className="font-semibold text-green-600">{subscriptionUnlocksRemaining - 1} remaining</span>
                </div>
              )}
            </div>
          )}

          {!canUnlock && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-900">
                ❌ Insufficient Credits
              </p>
              <p className="text-xs text-red-700 mt-1">
                You need {credits - balance} more credits to unlock this chapter. Purchase credits or upgrade your subscription for monthly unlock allowances.
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
              console.log('🎯 Unlock button clicked', { canUnlock, isUnlocking });
              if (canUnlock && !isUnlocking) {
                console.log('✅ Calling onConfirm');
                onConfirm();
              } else {
                console.log('❌ Cannot unlock', { canUnlock, isUnlocking });
              }
            }}
            disabled={!canUnlock || isUnlocking}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              canUnlock && !isUnlocking
                ? willUseSubscriptionUnlock
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isUnlocking ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Unlocking...</span>
              </div>
            ) : canUnlock ? (
              willUseSubscriptionUnlock
                ? '✨ Unlock FREE with Subscription'
                : `Unlock for ${credits} Credits`
            ) : (
              'Insufficient Credits'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UnlockConfirmationModal;
