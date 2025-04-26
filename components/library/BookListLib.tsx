import { Book } from "@/types";
import React, { useState } from "react";
import BookCardLib from "./BookCardLib";

interface Props {
  book: Book[];
  onEdit?: (book: Book) => void;
}

const BookListLib = ({ book, onEdit }: Props) => {
  const [activeTab, setActiveTab] = useState<'approved' | 'pending'>('approved');
  
  // Filter books based on approval status
  const approvedBooks = book.filter(b => b.isApproved);
  const pendingBooks = book.filter(b => !b.isApproved);
  
  // Select which books to display based on active tab
  const booksToDisplay = activeTab === 'approved' ? approvedBooks : pendingBooks;
  
  return (
    <section>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'approved'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('approved')}
        >
          APPROVED ({approvedBooks.length})
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'pending'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          PENDING ({pendingBooks.length})
        </button>
      </div>
      
      {/* Book list */}
      {booksToDisplay.length > 0 ? (
        <ul className="book-list flex flex-row gap-8 overflow-x-auto">
          {booksToDisplay.map((book) => (
            <li key={book.id} className="flex-shrink-0">
              <BookCardLib {...book} onEdit={onEdit} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No {activeTab === 'approved' ? 'approved' : 'pending'} books found.
        </div>
      )}
    </section>
  );
};

export default BookListLib;