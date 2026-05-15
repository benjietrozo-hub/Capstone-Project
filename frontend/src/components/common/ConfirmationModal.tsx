import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, LogOut, LogIn } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'info' | 'logout' | 'login';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showCancel = true,
  autoClose = false,
  autoCloseDelay = 2000,
}: ConfirmationModalProps) {
  const [countdown, setCountdown] = React.useState(Math.ceil(autoCloseDelay / 1000));

  // Auto-close functionality
  useEffect(() => {
    if (isOpen && autoClose) {
      // Reset countdown when modal opens
      setCountdown(Math.ceil(autoCloseDelay / 1000));

      // Update countdown every second
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);

      // Auto-close after delay
      const timer = setTimeout(() => {
        onConfirm();
        onClose();
      }, autoCloseDelay);

      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    }
  }, [isOpen, autoClose, autoCloseDelay, onConfirm, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />;
      case 'warning':
        return <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />;
      case 'logout':
        return <LogOut className="w-16 h-16 text-red-500 mx-auto mb-4" />;
      case 'login':
        return <LogIn className="w-16 h-16 text-green-500 mx-auto mb-4" />;
      default:
        return <AlertCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
      case 'login':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          button: 'bg-green-600 hover:bg-green-700',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          button: 'bg-amber-600 hover:bg-amber-700',
        };
      case 'logout':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          button: 'bg-red-600 hover:bg-red-700',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          button: 'bg-blue-600 hover:bg-blue-700',
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Content */}
        <div className={`p-8 ${colors.bg} border-b ${colors.border}`}>
          {getIcon()}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            {title}
          </h2>
          <p className="text-gray-600 text-center">
            {message}
          </p>
          {autoClose && (
            <p className="text-sm text-gray-500 text-center mt-3">
              Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
          )}
        </div>

        {/* Modal Actions */}
        {!autoClose && (
          <div className="p-6 bg-white flex gap-3 justify-center">
            {showCancel && (
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium min-w-[120px]"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={() => {
                onConfirm();
                if (!showCancel) {
                  onClose();
                }
              }}
              className={`px-6 py-3 ${colors.button} text-white rounded transition-colors font-medium min-w-[120px] shadow-md`}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
