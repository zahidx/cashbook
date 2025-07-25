"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlusCircle, FaCog } from 'react-icons/fa';
import { getBooks, addBook, deleteBook, updateBookName } from './lib/firebase';
import Wallet from './Wallet';
import AddBookModal from './components/AddBookModal';
import EditBookModal from './components/EditBookModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import BookItem from './components/BookItem';

export interface Book {
  id: string;
  name: string;
  updated: string;
  balance: number;
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const LOCAL_STORAGE_KEY = "offline-books";

  const fetchBooks = async () => {
    try {
      const booksData = await getBooks();
      setBooks(booksData as Book[]);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(booksData));
    } catch (error) {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        setBooks(JSON.parse(cached));
      } else {
        console.error("No internet and no cached data found");
      }
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddNewBook = async (bookName: string) => {
    setIsLoading(true);
    try {
      await addBook(bookName);
      await fetchBooks();
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add book:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBook = async (newName: string) => {
    if (bookToEdit) {
      setIsLoading(true);
      try {
        await updateBookName(bookToEdit.id, newName);
        await fetchBooks();
        setShowEditModal(false);
        setBookToEdit(null);
      } catch (error) {
        console.error("Failed to update book:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const confirmDeleteBook = async () => {
    if (bookToDelete) {
      setIsLoading(true);
      try {
        await deleteBook(bookToDelete.id);
        await fetchBooks();
        setShowDeleteModal(false);
        setBookToDelete(null);
      } catch (error) {
        console.error("Failed to delete book:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStartEdit = (book: Book) => {
    setBookToEdit(book);
    setShowEditModal(true);
  };

  const handleStartDelete = (bookId: string) => {
    const bookToDeleteDetails = books.find(book => book.id === bookId);
    if (bookToDeleteDetails) {
      setBookToDelete(bookToDeleteDetails);
      setShowDeleteModal(true);
    }
  };

  if (activeBook) {
    return <Wallet book={activeBook} onBack={() => setActiveBook(null)} />;
  }

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen flex flex-col overflow-hidden">
      {/* Animated Fixed Header */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 w-full bg-gradient-to-r from-gray-800 to-gray-950 shadow-lg z-30"
      >
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex items-center space-x-3"
          >
            {/* Replaced icon with custom image */}
            <Image
              src="/icons/icon-512x512.png"
              alt="App Icon"
              width={32}
              height={32}
              className="rounded-sm drop-shadow-lg"
            />
            <h1 className="text-3xl font-bold">CashBook</h1>
          </motion.div>
          {/* Slower glowing cog icon */}
          <motion.div
            animate={{ rotate: 360, opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
            className="drop-shadow-[0_0_8px_rgba(99,102,241,0.7)] cursor-pointer"
          >
            <FaCog size={24} className="text-gray-300 hover:text-gray-200 transition-colors" />
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content (with padding-top to offset fixed header) */}
      <main className="container mx-auto flex-1 p-4 sm:p-6 pt-28">
        <motion.hr
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="border-gray-700 mb-8 origin-left"
        />

        <section className="space-y-4 mb-24 sm:mb-8">
          <AnimatePresence>
            {books.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <BookItem
                  book={book}
                  onSelect={setActiveBook}
                  onStartEdit={handleStartEdit}
                  onStartDelete={handleStartDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {/* Animated Add New Book Button */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="fixed bottom-8 left-0 right-0 flex justify-center z-20 sm:static sm:mt-0"
        >
          <button
            className="flex items-center space-x-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-2xl hover:bg-indigo-700 transition-all duration-300 ease-in-out hover:scale-110 active:scale-95"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlusCircle size={20} className="animate-bounce" />
            <span>Add New Book</span>
          </button>
        </motion.div>

        {/* Modals */}
        <AddBookModal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddNewBook}
          isLoading={isLoading}
        />

        <EditBookModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateBook}
          book={bookToEdit}
          isLoading={isLoading}
        />

        <DeleteConfirmModal
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setBookToDelete(null);
          }}
          onConfirm={confirmDeleteBook}
          isLoading={isLoading}
          bookName={bookToDelete?.name || ''}
        />
      </main>
    </div>
  );
}
