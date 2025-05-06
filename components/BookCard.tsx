"use client";

import Link from "next/link";
import React from "react";
import BookCover from "./BookCover";
import { cn } from "@/lib/utils";
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
    <li className={cn("xs:w-52 w-full relative")}>
      <Link
        href={`/book/${id}`}
        className={cn("w-full flex flex-col items-center")}
      >
        <BookCover coverColor={coverColor} coverImage={coverUrl} />
        <div className={cn("mt-4 w-full", "xs:max-w-40 max-w-28")}>
          <p className="book-title mt-2 line-clamp-1 text-base font-semibold text-white xs:text-xl">
            {title}
          </p>
          <p className="book-genre mt-1 line-clamp-1 text-sm italic text-light-100 xs:text-base">
            {genre}
          </p>
        </div>
      </Link>

      {/* Like and comment interactions */}
      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
      <BookInteractions
          bookId={id}
          userId={userId}
          size="sm"
        />
      </div>
    </li>
  );
};

export default BookCard;