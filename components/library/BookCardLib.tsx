'use client'
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

import { Book } from "@/types";
import BookCover from "../BookCover";
import { EditIcon } from "lucide-react";
import { Button } from "../ui/button";

interface BookCardLibProps extends Book {
  onEdit?: (book: Book) => void;
  isBeingEdited?: boolean;
}
const BookCardLib = ({
  title,
  coverColor,
  coverUrl,
  availableCopies,
  isBeingEdited,
  onEdit,
  ...bookData
}: BookCardLibProps) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); //prevent any parent click handlers from firing
    if (onEdit) {
      onEdit({
        title,
        coverColor,
        coverUrl,
        availableCopies,
        isBeingEdited,
        ...bookData,
      } as Book);
    }
  };
  return (
    <Card className="w-[250px] bg-gray-400 shadow-md">
      <CardContent className="flex flex-col items-center p-4">
        <BookCover coverColor={coverColor} coverImage={coverUrl} />
        <div className={cn("mt-4", "xs:max-w-40 w-[200px]")}>
          <p className="book-title mt-2 line-clamp-1 text-base font-semibold text-white xs:text-xl">
            {title} 
          </p>
          <p className="book-genre line-clamp-1 text-sm italic text-white xs:text-base">
            Available Copies: {availableCopies}
          </p>
          <Button
            onClick={handleEditClick}
            className="mt-2 flex items-center text-white hover:text-blue-200 transition-colors"
          >
            <EditIcon className="h-4 w-4 text-white" />
            <span className="text-sm">{isBeingEdited ? "Currently Editing" : "Edit"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookCardLib;
