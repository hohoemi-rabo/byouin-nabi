'use client';

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
}

export default function SuccessModal({
  isOpen,
  title,
  message,
  buttonText = '閉じる',
  onClose,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl animate-bounceIn">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-3">
            {title}
          </h2>
          <p className="text-gray-700 text-base whitespace-pre-line">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-green-700 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
