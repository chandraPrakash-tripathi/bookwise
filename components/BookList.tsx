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
    <section className={`py-10 ${containerClassName}`}>
      <div className="container mx-auto px-4">
        <h2 className="font-bebas-neue text-white mb-8 text-center font-extrabold text-8xl">{title}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {books.map((book) => (
            <BookCard key={book.title} {...book} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BookList;