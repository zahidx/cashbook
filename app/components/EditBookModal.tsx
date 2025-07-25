// EditBookModal.tsx
"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, BookOpenText } from 'lucide-react';
import { Book } from '../page';

interface EditBookModalProps {
  show: boolean;
  onClose: () => void;
  onUpdate: (newName: string) => void;
  book: Book | null;
  isLoading: boolean;
}

const EditBookModal = ({ show, onClose, onUpdate, book, isLoading }: EditBookModalProps) => {
  const [updatedBookName, setUpdatedBookName] = useState('');

  useEffect(() => {
    if (book) {
      setUpdatedBookName(book.name);
    }
  }, [book]);

  const handleSubmit = () => {
    if (updatedBookName.trim() && book && !isLoading) {
      onUpdate(updatedBookName);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-gray-800 rounded-t-2xl sm:rounded-lg shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-gray-100">Edit Book Name</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div className="relative">
                <BookOpenText
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={updatedBookName}
                  onChange={(e) => setUpdatedBookName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter new book name"
                  autoFocus
                />
              </div>

              {/* Action Button --- MODIFIED SECTION --- */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-1/2 sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center font-semibold disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Updating...
                    </>
                  ) : (
                    'Update Book'
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

export default EditBookModal;