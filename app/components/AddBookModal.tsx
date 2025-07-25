"use client";
import { useState } from 'react';

interface AddBookModalProps {
  show: boolean;
  onClose: () => void;
  onAdd: (bookName: string) => void;
  isLoading: boolean; // Prop to indicate loading state
}

const AddBookModal = ({ show, onClose, onAdd, isLoading }: AddBookModalProps) => {
  const [newBookName, setNewBookName] = useState('');

  const handleSubmit = () => {
    if (newBookName.trim() && !isLoading) { // Prevent multiple clicks
      onAdd(newBookName);
      setNewBookName('');
    }
  };
  
  // Allow submitting with the Enter key
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Enter Book Name</h2>
        <input
          type="text"
          value={newBookName}
          onChange={(e) => setNewBookName(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md mb-6 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., Personal Savings"
          autoFocus
        />
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors duration-200">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center min-w-[120px] disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              'Add Book'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBookModal;