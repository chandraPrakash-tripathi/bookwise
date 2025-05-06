import React from "react";
import BookCard from "./BookCard";
import { Book } from "@/types";

interface Props {
  title: string;
  books: Book[];
  containerClassName?: string;
}

const BookList = ({ title, books, containerClassName }: Props) => {
  // If book length is less than 2 return null
  if (books.length < 2) return null;
  
  return (
    <section className={`py-8 ${containerClassName}`}>
      <div className="container mx-auto px-4">
        <h2 className="font-bebas-neue text-4xl text-white mb-6">{title}</h2>
        
        <div className="relative">
          <div className="book-list flex space-x-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {books.map((book) => (
              <div key={book.title} className="flex-shrink-0 w-64">
                <BookCard {...book} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookList;