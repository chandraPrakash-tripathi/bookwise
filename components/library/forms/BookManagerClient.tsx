'use client'
import { useState } from 'react'
import { Book } from '@/types'
import BookFormLib from './BookFormLib';
import BookListLib from '../BookListLib';

interface BookManagerClientProps {
  books: Book[];
  libraryId: string | number;
}

export default function BookManagerClient({ books, libraryId }: BookManagerClientProps) {
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  
  const handleEdit = (book: Book) => {
    setBookToEdit(book);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <>
      <BookFormLib 
        libraryId={libraryId.toString()} 
        bookToEdit={bookToEdit} 
      />
      <BookListLib 
        book={books} 
        onEdit={handleEdit} 
      />
    </>
  );
}