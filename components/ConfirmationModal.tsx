
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 m-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl font-bold text-brand-danger">{title}</h2>
           <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Tutup modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-lg text-gray-600 mb-8">{message}</p>
        <div className="flex justify-end space-x-4">
          <button 
            onClick={onClose} 
            className="px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm} 
            className="px-6 py-3 bg-brand-danger text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
