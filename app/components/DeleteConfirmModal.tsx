"use client";

import { X } from "lucide-react";

interface DeleteConfirmModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteConfirmModal = ({ show, onClose, onConfirm, isLoading }: DeleteConfirmModalProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-end sm:items-center bg-black/60 z-50 p-4 backdrop-blur-sm">
      {/* This div uses animate-in from 'tailwindcss-animate' for a smooth entrance.
        On mobile, it slides up from the bottom (slide-in-from-bottom-full).
        On larger screens (sm:), it fades and zooms in (fade-in-0 zoom-in-95).
      */}
      <div
        className="
        relative bg-gray-800 text-gray-100 p-6 rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-md
        border-t border-gray-700 sm:border-none
        animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300 ease-out
      "
      >
        {/* Optional: Mobile grab handle for bottom-sheet affordance */}
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-600 mb-4 sm:hidden" />

        {/* Close button for better accessibility */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col">
          <h2 className="text-xl font-bold mb-2 text-white">Confirm Deletion</h2>
          <p className="text-gray-300 mb-6 text-sm sm:text-base">
            Are you sure you want to delete this book? This action is permanent and cannot be undone.
          </p>
          {/* Button container:
            - flex-col-reverse: Stacks buttons vertically on mobile with the primary action (Delete) on top.
            - sm:flex-row: Switches to a horizontal layout on larger screens.
          */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
            <button
              onClick={onClose}
              className="mt-3 sm:mt-0 px-4 py-2.5 rounded-lg text-white font-semibold hover:bg-gray-700 transition-colors duration-200 w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-red-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 w-full sm:w-auto flex items-center justify-center min-w-[120px] disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;