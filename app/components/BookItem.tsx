// code2: components/BookItem.tsx
"use client";
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPencilAlt, FaTrash, FaEllipsisV, FaClock, FaDollarSign, FaBook } from 'react-icons/fa';
import { Book } from '../page';
import { formatRelativeTime } from '../utils/time';

interface BookItemProps {
  book: Book;
  onSelect: (book: Book) => void;
  onStartEdit: (book: Book) => void;
  onStartDelete: (bookId: string) => void;
}

const BookItem = ({ book, onSelect, onStartEdit, onStartDelete }: BookItemProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartEdit(book);
    setIsMenuOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartDelete(book.id);
    setIsMenuOpen(false);
  };

  return (
    <motion.div
      onClick={() => onSelect(book)}
      initial={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-gray-800 p-5 rounded-2xl mb-4 shadow-xl cursor-pointer border border-transparent hover:border-indigo-500 transition-all duration-200 ease-in-out"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <FaBook className="text-indigo-400" size={24} />
          <h2 className="text-2xl font-bold text-gray-100">{book.name}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <FaDollarSign className="text-green-400" />
            <span className="text-green-400 font-semibold text-lg">{book.balance.toFixed(2)}</span>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={handleMenuToggle}
              className="p-2 rounded-full hover:bg-gray-600 transition-transform active:scale-90 sm:hidden"
              aria-label="Options"
            >
              <FaEllipsisV className="text-white" />
            </button>
            <div
              className={`
                transition-all duration-150 ease-out transform
                ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
                sm:opacity-100 sm:scale-100 sm:pointer-events-auto sm:flex
                flex-col sm:flex-row items-start sm:items-center
                absolute sm:static top-10 right-0 sm:top-auto sm:right-auto
                bg-gray-700 sm:bg-transparent p-2 sm:p-0 rounded-lg
                shadow-2xl sm:shadow-none min-w-[140px] z-10
              `}
            >
              <button
                onClick={handleEdit}
                className="text-white hover:bg-gray-600 p-2 sm:ml-2 flex items-center space-x-2 w-full sm:w-auto rounded-md transition-colors duration-200"
                title="Edit Book"
              >
                <FaPencilAlt size={16} />
                <span className="font-medium">Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 hover:bg-gray-600 p-2 flex items-center space-x-2 w-full sm:w-auto rounded-md transition-colors duration-200"
                title="Delete Book"
              >
                <FaTrash size={16} />
                <span className="font-medium">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center text-sm text-gray-400 space-x-2">
        <FaClock />
        <span>{formatRelativeTime(book.updated)}</span>
      </div>
    </motion.div>
  );
};

export default BookItem;
