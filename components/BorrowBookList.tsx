import React from "react";
import { BookOpen, Calendar, Library, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookType, BorrowRecordType, LibraryType } from "@/types";

interface BorrowBookListProps {
  book: BookType;
  borrowRecord: BorrowRecordType;
  library: LibraryType;
}

const BorrowBookList = ({
  book,
  borrowRecord,
  library,
}: BorrowBookListProps) => {
  // Calculate days until due
  const dueDate = new Date(borrowRecord.dueDate);
  const today = new Date();
  const isOverdue = today > dueDate && !borrowRecord.returnDate;
  const isReturned = !!borrowRecord.returnDate;

  // Format dates
  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-white shadow-sm">
      {/* Book Details */}
      <div className="flex-grow space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-black">{book.title}</h3>
            <p className="text-gray-600">{book.author}</p>
          </div>

          <Badge
            className={`${
              isReturned
                ? "bg-green-100 text-green-800"
                : isOverdue
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {isReturned
              ? "Returned"
              : isOverdue
              ? "Overdue"
              : borrowRecord.status}
          </Badge>
        </div>

        <div className="flex items-center gap-1 text-gray-600 text-sm">
          <Library size={14} />
          <span>{library.name}</span>
        </div>

        <div className="flex items-center gap-1 text-gray-600 text-sm">
          <BookOpen size={14} />
          <span>{book.genre}</span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm mt-2 text-black">
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-gray-600" />
            <span>Borrowed: {formatDate(borrowRecord.borrowDate)}</span>
          </div>

          <div className="flex items-center gap-1 text-black">
            <Calendar
              size={14}
              className={isOverdue ? "text-red-600" : "text-gray-600"}
            />
            <span className={isOverdue ? "text-red-600 font-medium" : ""}>
              Due: {formatDate(borrowRecord.dueDate)}
            </span>
          </div>

          {isOverdue && !isReturned && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle size={14} />
              <span>Please return this book</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex md:flex-col justify-end gap-2 mt-4 md:mt-0">
        {!isReturned && (
          <Button variant="outline" className="text-black" size="sm">
            Mark as Returned
          </Button>
        )}
        <Button variant="outline" className="text-black" size="sm">
          View Details
        </Button>
      </div>
    </div>
  );
};

export default BorrowBookList;
