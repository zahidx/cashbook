"use client";
import { useEffect, useState } from 'react';
// Import the new delete and update functions
import { getBooks, addBook, deleteBook, updateBookName } from './lib/firebase';
import Wallet from './Wallet'; // Make sure to import the new Wallet component

// Define an interface for the Book object for type safety
interface Book {
  id: string;
  name: string;
  updated: string; // Or 'Date' if you convert the timestamp
  balance: number;
}

export default function Home() {
  // Apply the 'Book' type to your state hooks
  const [books, setBooks] = useState<Book[]>([]);
  const [newBookName, setNewBookName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeBook, setActiveBook] = useState<Book | null>(null);

  // --- New state for editing books ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null); // Book object to be edited
  const [updatedBookName, setUpdatedBookName] = useState(''); // New name for the book

  // Function to fetch and update the book list
  const fetchBooks = async () => {
    // Assuming getBooks() returns data that matches the Book[] type
    const booksData = await getBooks();
    setBooks(booksData as Book[]); // This line is now type-safe
  };

  // Fetch books from Firestore when the page loads
  useEffect(() => {
    fetchBooks();
  }, []);

  // Handle adding a new book to Firestore
  const handleAddNewBook = async () => {
    if (newBookName.trim()) {
      await addBook(newBookName);
      setNewBookName('');
      setShowModal(false);
      fetchBooks(); // Refresh book list
    }
  };

  // --- Handler functions for editing and deleting books ---

  const handleDeleteBook = async (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation(); // Prevent triggering the onClick of the parent div
    if (window.confirm("Are you sure you want to delete this book and all its transactions? This action cannot be undone.")) {
      await deleteBook(bookId);
      fetchBooks(); // Refresh book list
    }
  };

  const handleStartEdit = (e: React.MouseEvent, book: Book) => {
    e.stopPropagation(); // Prevent triggering the onClick of the parent div
    setEditingBook(book);
    setUpdatedBookName(book.name);
    setShowEditModal(true);
  };

  const handleUpdateBook = async () => {
    if (updatedBookName.trim() && editingBook) {
      await updateBookName(editingBook.id, updatedBookName);
      setShowEditModal(false);
      setEditingBook(null);
      setUpdatedBookName('');
      fetchBooks(); // Refresh book list
    }
  };

  // If a book is selected, show the Wallet component
  if (activeBook) {
    return <Wallet book={activeBook} onBack={() => setActiveBook(null)} />;
  }

  // Otherwise, show the book list page
  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <input
          type="text"
          placeholder="Search by book name..."
          className="w-3/4 p-2 border rounded-md border-gray-300"
        />
        <div className="ml-4">
          <label className="mr-2">Sort By:</label>
          <select className="p-2 border rounded-md border-gray-300">
            <option>Last Updated</option>
            <option>Alphabetical</option>
          </select>
        </div>
      </header>

      {/* Book List */}
      <section className="mb-8">
        {books.map((book) => (
          <div
            key={book.id}
            onClick={() => setActiveBook(book)}
            className="bg-gray-100 p-4 rounded-lg mb-4 shadow-md flex justify-between items-center cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <div onClick={(e) => e.stopPropagation()} className="flex items-center">
              <div onClick={() => setActiveBook(book)} className="flex-grow">
                  <h2 className="text-lg font-semibold">{book.name}</h2>
                  <p className="text-sm text-gray-500">{book.updated}</p>
              </div>
            </div>
            <div className="flex items-center">
                  <p className="text-green-500 font-semibold mr-4">${book.balance}</p>
                  {/* Edit and Delete Buttons */}
                  <button 
                    onClick={(e) => handleStartEdit(e, book)} 
                    className="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={(e) => handleDeleteBook(e, book.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
            </div>
          </div>
        ))}
      </section>

      {/* Add New Book Button */}
      <section className="flex flex-col items-center mb-8">
        <button
          className="bg-blue-600 text-white p-3 rounded-md shadow-md mb-4"
          onClick={() => setShowModal(true)}
        >
          Add New Book
        </button>
      </section>

      {/* Modal for New Book */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-lg mb-4">Enter Book Name</h2>
            <input
              type="text"
              value={newBookName}
              onChange={(e) => setNewBookName(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
              placeholder="Book Name"
            />
            <div className="flex justify-between">
              <button
                onClick={handleAddNewBook}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Add Book
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal for Editing Book --- */}
      {showEditModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-lg mb-4">Edit Book Name</h2>
            <input
              type="text"
              value={updatedBookName}
              onChange={(e) => setUpdatedBookName(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
              placeholder="New Book Name"
            />
            <div className="flex justify-between">
              <button
                onClick={handleUpdateBook}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Update Book
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Support */}
      <section className="flex justify-center mt-8">
        <a
          href="https://wa.me/1234567890" // Replace with your WhatsApp number
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="bg-green-500 text-white p-3 rounded-md shadow-md">
            Contact Us
          </button>
        </a>
      </section>
    </div>
  );
}