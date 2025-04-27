import React from "react";
import BookCard from "./BookCard";
import { Book } from "@/types";

interface Props {
  title: string;
  books: Book[];
  containerClassName?: string;
}

const BookList = ({ title, books, containerClassName }: Props) => {
  //if book length is less tgan 2 return null
  if(books.length <2) return
  return (
    <section className={containerClassName}>
      <h2 className="font-bebas-neue text-4xl text-white">{title}</h2>
      <ul className="book-list flex flex-row overflow-x-auto">
        {books.map((book) => (
          <BookCard key={book.title} {...book} />
        ))}
      </ul>
    </section>
  );
};

export default BookList;
