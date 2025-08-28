import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorModalProps {
  show: boolean;
  message: string;
  onClose: () => void;
  onRetry: () => void;
}

export function ErrorModal({ show, message, onClose, onRetry }: ErrorModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Analysis Failed</h3>
          <p className="text-sm text-slate-600 mb-6">{message}</p>
          <div className="flex space-x-4">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onRetry}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
