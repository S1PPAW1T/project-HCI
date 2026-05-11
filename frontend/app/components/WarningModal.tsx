"use client";

interface WarningModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function WarningModal({ isOpen, title, message, onClose }: WarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border-t-4 border-[#7C2AE8] transform transition-all">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">⚠️</span>
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
        </div>
        <div className="mb-6">
          <p className="text-gray-700 text-sm mb-1">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="w-full bg-[#7C2AE8] text-white rounded-lg py-2.5 font-semibold hover:bg-[#6a23c8] transition-colors shadow-md"
        >
          Got it
        </button>
      </div>
    </div>
  );
}