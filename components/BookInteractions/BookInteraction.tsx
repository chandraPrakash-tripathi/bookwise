"use client";

import React from "react";
import BookLike from "./BookLike";
import BookComments from "./BookComments";
import { cn } from "@/lib/utils";

interface BookInteractionsProps {
  bookId: string;
  userId?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const BookInteractions = ({
  bookId,
  userId,
  size = "md",
  className,
}: BookInteractionsProps) => {
  return (
    <div className={cn("flex space-x-3", className)}>
      <BookLike 
        bookId={bookId} 
        userId={userId} 
        size={size}
      />
      <BookComments 
        bookId={bookId} 
        userId={userId} 
        size={size}
      />
    </div>
  );
};

export default BookInteractions;