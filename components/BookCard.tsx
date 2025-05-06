"use client";

import Link from "next/link";
import React from "react";
import BookCover from "./BookCover";
import { useSession } from "next-auth/react";

import { Book } from "@/types";
import BookInteractions from "./BookInteractions/BookInteraction";

interface BookCardProps extends Book {
  initialLikeCount?: number;
  initialLiked?: boolean;
  initialCommentCount?: number;
}

const BookCard = ({
  id,
  title,
  genre,
  coverColor,
  coverUrl,
}: BookCardProps) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return (
    <li className="group w-full xs:w-52 relative transition-transform duration-300 hover:scale-105">
      <Link
        href={`/book/${id}`}
        className="w-full flex flex-col items-center"
      >
        <div className="relative w-full overflow-hidden rounded-lg shadow-lg">
          <BookCover coverColor={coverColor} coverImage={coverUrl} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="mt-4 w-full max-w-28 xs:max-w-40 px-1">
          <p className="book-title mt-2 line-clamp-1 text-base font-semibold text-white xs:text-xl transition-colors group-hover:text-blue-300">
            {title}
          </p>
          <p className="book-genre mt-1 line-clamp-1 text-sm italic text-light-100 xs:text-base transition-colors group-hover:text-light-200">
            {genre}
          </p>
        </div>
      </Link>

      {/* Like and comment interactions */}
      <div 
        className="mt-3 transition-all duration-300 opacity-80 group-hover:opacity-100" 
        onClick={(e) => e.stopPropagation()}
      >
        <BookInteractions
          bookId={id}
          userId={userId}
          size="sm"
          className="justify-center xs:justify-start"
        />
      </div>
    </li>
  );
};

export default BookCard;