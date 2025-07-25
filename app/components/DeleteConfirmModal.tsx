// DeleteConfirmModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertTriangle, Keyboard } from 'lucide-react';

interface DeleteConfirmModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  bookName: string; // <-- New prop to receive the book's name
}

const DeleteConfirmModal = ({ show, onClose, onConfirm, isLoading, bookName }: DeleteConfirmModalProps) => {
  const [confirmationInput, setConfirmationInput] = useState('');

  // Reset input when the modal opens or the book changes
  useEffect(() => {
    if (show) {
      setConfirmationInput('');
    }
  }, [show]);

  const isMatch = confirmationInput === bookName;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="relative w-full max-w-md bg-gray-800 rounded-t-2xl sm:rounded-lg shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center p-4 border-b border-gray-700">
              <div className="bg-red-500/10 p-2 rounded-full">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <h2 className="text-xl font-bold text-white ml-3">Confirm Deletion</h2>
              <button
                onClick={onClose}
                className="ml-auto p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-300 text-sm sm:text-base">
                This action is permanent. To confirm, please type the book name below.
              </p>

              {/* --- MODIFIED SECTION --- */}
              <div className="relative my-4">
                <Keyboard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  placeholder={`Type "${bookName}" to confirm`}
                  className="w-full pl-12 pr-4 p-3 bg-gray-900 border border-gray-600 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoFocus
                />
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  onClick={onConfirm}
                  disabled={!isMatch || isLoading} // <-- Logic updated here
                  className="w-1/2 sm:w-auto bg-red-600 text-white px-5 py-2.5 rounded-md font-semibold hover:bg-red-700 transition-colors duration-200 flex items-center justify-center disabled:bg-red-500/50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
             {/* Padding for iPhone home bar */}
            <div className="pb-[env(safe-area-inset-bottom)]"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;