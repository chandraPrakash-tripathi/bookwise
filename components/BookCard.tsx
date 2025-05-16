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
    <div className="flex justify-center">
      <div className="group w-full max-w-xs bg-gray-900/30 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <Link href={`/book/${id}`} className="block">
          <div className="h-60 w-full flex items-center justify-center overflow-hidden">
            <BookCover coverColor={coverColor} coverImage={coverUrl} />
          </div>
          
          <div className="p-4 text-center">
            <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
              {title}
            </h3>
            <p className="mt-1 text-sm italic text-light-100 group-hover:text-light-200 transition-colors">
              {genre}
            </p>
          </div>
        </Link>

        <div className="px-4 pb-6 pt-2 relative" onClick={(e) => e.stopPropagation()}>
          <BookInteractions
            bookId={id}
            userId={userId}
            size="sm"
            className="justify-center min-h-12 space-y-2"
          />
        </div>
      </div>
    </div>
  );
};

export default BookCard;