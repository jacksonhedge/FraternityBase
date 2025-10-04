import { Clock, Lock } from 'lucide-react';

interface ApprovalPendingOverlayProps {
  message?: string;
}

const ApprovalPendingOverlay = ({ message = "Waiting for Approval" }: ApprovalPendingOverlayProps) => {
  return (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg">
      <div className="text-center p-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <Clock className="w-8 h-8 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{message}</h3>
        <p className="text-sm text-gray-600 max-w-xs">
          Your account is being reviewed. You'll have full access once approved.
        </p>
      </div>
    </div>
  );
};

export default ApprovalPendingOverlay;
