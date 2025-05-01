'use client'
import React, { useState } from "react";
import { BookOpen, Calendar, Library, AlertCircle, Receipt as R } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookType, BorrowRecordType, DatabaseReceipt, LibraryType } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface BorrowBookListProps {
  book: BookType;
  borrowRecord: BorrowRecordType;
  library: LibraryType;
  receipt: DatabaseReceipt | null; // Use the more flexible database receipt type
}

const BorrowBookList = ({
  book,
  borrowRecord,
  library,
  receipt
}: BorrowBookListProps) => {
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toFixed(2)}`;
  };

  return (
    <>
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
            
            {receipt && (
              <div className="flex items-center gap-1 text-gray-600">
                <R size={14} />
                <span>Receipt Available</span>
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
          <Button 
            variant="outline" 
            className="text-black" 
            size="sm"
            onClick={() => setIsReceiptOpen(true)}
            disabled={!receipt}
          >
            View {receipt ? "Receipt" : "Details"}
          </Button>
        </div>
      </div>
      
      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <R className="mr-2 h-5 w-5" />
              Receipt Details
            </DialogTitle>
            <DialogDescription>
              {receipt ? `Receipt for "${book.title}"` : "No receipt available"}
            </DialogDescription>
          </DialogHeader>
          
          {receipt ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Receipt ID:</span>
                  <span>{receipt.id ? receipt.id.substring(0, 8) + '...' : 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Type:</span>
                  <span className="capitalize">{receipt.type ? receipt.type.toLowerCase() : 'N/A'}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Base Charge:</span>
                  <span>{typeof receipt.baseCharge === 'number' ? formatCurrency(receipt.baseCharge) : 'N/A'}</span>
                </div>
                {receipt.extraDays !== null && receipt.extraDays > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Extra Days:</span>
                    <span>{receipt.extraDays} days</span>
                  </div>
                )}
                {receipt.extraCharge !== null && receipt.extraCharge > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Extra Charge:</span>
                    <span>{formatCurrency(receipt.extraCharge)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 mt-2 font-semibold">
                  <span>Total Charge:</span>
                  <span>{typeof receipt.totalCharge === 'number' ? formatCurrency(receipt.totalCharge) : 'N/A'}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Generated: {formatDate(receipt.generatedAt)}</p>
                {receipt.notes && (
                  <p className="mt-2">Notes: {receipt.notes}</p>
                )}
              </div>
              
              <Button className="w-full" onClick={() => window.print()}>
                Print Receipt
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p>No receipt is available for this book.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BorrowBookList;