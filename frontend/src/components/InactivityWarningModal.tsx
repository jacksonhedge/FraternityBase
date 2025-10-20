import { Clock, AlertTriangle, LogOut, RefreshCw } from 'lucide-react';

interface InactivityWarningModalProps {
  isOpen: boolean;
  timeLeft: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

const InactivityWarningModal = ({
  isOpen,
  timeLeft,
  onStayLoggedIn,
  onLogout,
}: InactivityWarningModalProps) => {
  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-t-2xl p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Still There?</h2>
                <p className="text-white/90 text-sm mt-1">You've been inactive for a while</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Countdown Timer */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 mb-6 border-2 border-orange-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-orange-600 animate-pulse" />
                <p className="text-gray-700 font-medium">Auto-logout in:</p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-orange-600 tabular-nums">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Click "Stay Logged In" to continue your session
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700 text-sm text-center">
                For your security, we'll automatically log you out after{' '}
                <span className="font-semibold">{minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : `${seconds} seconds`}</span>{' '}
                of inactivity.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onLogout}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
              <button
                onClick={onStayLoggedIn}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InactivityWarningModal;
