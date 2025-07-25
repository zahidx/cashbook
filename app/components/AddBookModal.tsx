"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, BookPlus } from 'lucide-react'; // <-- Nicer icons

interface AddBookModalProps {
  show: boolean;
  onClose: () => void;
  onAdd: (bookName: string) => void;
  isLoading: boolean;
}

const AddBookModal = ({ show, onClose, onAdd, isLoading }: AddBookModalProps) => {
  const [newBookName, setNewBookName] = useState('');

  // Reset input when modal opens
  useEffect(() => {
    if (show) {
      setNewBookName('');
    }
  }, [show]);

  const handleSubmit = () => {
    if (newBookName.trim() && !isLoading) {
      onAdd(newBookName);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    // --- NEW: AnimatePresence allows the component to animate when it's removed ---
    <AnimatePresence>
      {show && (
        // --- MODIFIED: Main container now positions modal at the bottom on mobile ---
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50">
          {/* --- NEW: Animated backdrop --- */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* --- MODIFIED: Modal content with bottom-to-up animation --- */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            // --- MODIFIED: Responsive styling for mobile bottom-sheet ---
            className="relative w-full max-w-md bg-gray-800 rounded-t-2xl sm:rounded-lg shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center p-4 border-b border-gray-700">
              <BookPlus className="text-indigo-400" size={24} />
              <h2 className="text-xl font-bold text-white ml-3">Add a New Book</h2>
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
              <input
                type="text"
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Personal Savings"
                autoFocus
              />
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !newBookName.trim()}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-md font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center min-w-[130px] disabled:bg-indigo-500/50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Adding...
                    </>
                  ) : (
                    'Add Book'
                  )}
                </button>
              </div>
            </div>
            {/* --- NEW: Padding for iPhone home bar --- */}
            <div className="pb-[env(safe-area-inset-bottom)]"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddBookModal;