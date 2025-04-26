import Link from "next/link";
import React from "react";
import BookCover from "./BookCover";
import { cn } from "@/lib/utils";

import { Book } from "@/types";

const BookCard = ({ id, title, genre, coverColor, coverUrl }: Book) => {
  return (
    <li className={cn("xs:w-52 w-full")}>
      <Link
        href={`/book/${id}`}
        className={cn("w-full flex flex-col items-centre")}
      >
        <BookCover coverColor={coverColor} coverImage={coverUrl} />
        <div className={cn("mt-4", "xs:max-w-40 max-w-28")}>
          <p className="book-title mt-2 line-clamp-1 text-base font-semibold text-white xs:text-xl">
            {title}
          </p>
          <p className="book-genre  mt-1 line-clamp-1 text-sm italic text-light-100 xs:text-base">
            {genre}
          </p>
        </div>

       
      </Link>
    </li>
  );
};

export default BookCard;
