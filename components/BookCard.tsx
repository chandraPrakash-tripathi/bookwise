import Link from "next/link";
import React from "react";
import BookCover from "./BookCover";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "./ui/button";

const BookCard = ({
  id,
  title,
  genre,
  color,
  cover,
  isLoanedBook = false,
}: Book) => {
  return (
    <li className={cn(isLoanedBook && "xs:w-52 w-full")}>
      <Link
        href={`/book/${id}`}
        className={cn(isLoanedBook && "w-full flex flex-col items-centre")}
      >
        <BookCover coverColor={color} coverImage={cover} />
        <div className={cn("mt-4", !isLoanedBook && "xs:max-w-40 max-w-28")}>
          <p className="book-title mt-2 line-clamp-1 text-base font-semibold text-white xs:text-xl">
            {title}
          </p>
          <p className="book-genre  mt-1 line-clamp-1 text-sm italic text-light-100 xs:text-base">
            {genre}
          </p>
        </div>

        {isLoanedBook && (
          <div className="mt-3 w-full">
            <div className="book-loaned flex flex-row items-center gap-1 max-xs:justify-center">
              <Image
                src="/icons/calendar.svg"
                alt="calendar"
                width={18}
                height={18}
                className="object-contain"
              />
              <p className="text-white"> 11 days left to return </p>
            </div>
            <Button className="book-btn bg-green-600 mt-3 min-h-14 w-1/2 font-bebas-neue text-base text-primary">
              Download Reciept
            </Button>
          </div>
        )}
      </Link>
    </li>
  );
};

export default BookCard;
