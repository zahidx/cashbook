"use client";
import { useEffect, useState } from 'react';
import { getBooks, addBook, deleteBook, updateBookName } from './lib/firebase';
import Wallet from './Wallet';
import AddBookModal from './components/AddBookModal';
import EditBookModal from './components/EditBookModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import BookItem from './components/BookItem';

// Define the Book interface
export interface Book {
  id: string;
  name: string;
  updated: string;
  balance: number;
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);

  // Modal visibility states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // State for the book being edited or deleted
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  
  // A single loading state for all async operations
  const [isLoading, setIsLoading] = useState(false);

  const fetchBooks = async () => {
    const booksData = await getBooks();
    setBooks(booksData as Book[]);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // --- Handlers with Loading State ---

  const handleAddNewBook = async (bookName: string) => {
    setIsLoading(true);
    try {
      await addBook(bookName);
      await fetchBooks(); // Wait for data to be refetched
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add book:", error);
      // Here you could add user-facing error notifications
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
        await deleteBook(bookToDelete);
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
    setBookToDelete(bookId);
    setShowDeleteModal(true);
  };

  // If a book is selected, show the Wallet view
  if (activeBook) {
    return <Wallet book={activeBook} onBack={() => setActiveBook(null)} />;
  }

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen">
      <main className="container mx-auto p-4 sm:p-6">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-100">My Books 📚</h1>
        </header>

        <hr className="border-gray-700 mb-8" />

        {/* Book List */}
        <section className="mb-24 sm:mb-8">
          {books.map((book) => (
            <BookItem
              key={book.id}
              book={book}
              onSelect={setActiveBook}
              onStartEdit={handleStartEdit}
              onStartDelete={handleStartDelete}
            />
          ))}
        </section>

        {/* Floating Add New Book Button */}
        <section>
          <div className="fixed bottom-10 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent sm:static sm:p-0 sm:bg-transparent sm:flex sm:justify-center z-20">
            <button
              className="bg-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out hover:scale-105 active:scale-100 w-1/2 ml-[110px] sm:w-auto sm:px-8 mx-auto sm:mx-0"
              onClick={() => setShowAddModal(true)}
            >
              Add New Book
            </button>
          </div>
        </section>

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
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDeleteBook}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}