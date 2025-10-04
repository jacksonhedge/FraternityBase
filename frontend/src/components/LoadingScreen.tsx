import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface LoadingScreenProps {
  isComplete?: boolean;
}

const LoadingScreen = ({ isComplete = false }: LoadingScreenProps) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isComplete) {
      // Show success state briefly before transitioning
      setShowSuccess(true);
    }
  }, [isComplete]);

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        {/* Baseball Cap Logo */}
        <div className={`mb-8 transition-transform duration-300 ${showSuccess ? 'scale-110' : 'animate-pulse'}`}>
          <div className="text-9xl">🧢</div>
        </div>

        {/* Loading or Success State */}
        {!showSuccess ? (
          <>
            {/* Loading bar */}
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full animate-loading-bar" />
            </div>
            <p className="mt-4 text-gray-600 text-sm">Loading your dashboard...</p>
          </>
        ) : (
          <>
            {/* Success checkmark */}
            <div className="flex items-center gap-2 text-green-600 animate-in fade-in zoom-in duration-300">
              <CheckCircle className="w-6 h-6" />
              <p className="font-medium">Welcome!</p>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 75%;
            margin-left: 0%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }

        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
