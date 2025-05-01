"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ReceiptBook, ReceiptType } from "@/types";
import { toast } from "sonner";
import { generateReceipt, updateReceipt } from "@/lib/library/actions/book";

interface ReceiptGeneratorProps {
  borrowRecordId: string;
  book: ReceiptBook;
  type: ReceiptType;
  onClose: () => void;
}

const ReceiptGenerator = ({ borrowRecordId, book, type, onClose }: ReceiptGeneratorProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);

  // Calculate charges based on the rules
  const calculateCharges = () => {
    const baseRate = 70; // 70 Rs for 7 days
    const extraDayRate = 2; // 2 Rs per day after due date

    if (type === "BORROW") {
      return baseRate; // Initial charge is always 70 Rs
    } else if (type === "RETURN") {
      // For return receipt, calculate if there are any extra charges
      if (!book.borrowDate || !book.dueDate) return baseRate;

      const dueDate = new Date(book.dueDate);
      const returnDate = new Date(); // Current date is considered return date

      // If returned before or on due date, only base charge applies
      if (returnDate <= dueDate) {
        return baseRate;
      } else {
        // Calculate extra days
        const diffTime = Math.abs(returnDate.getTime() - dueDate.getTime());
        const extraDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const extraCharge = extraDays * extraDayRate;

        return baseRate + extraCharge;
      }
    }

    return baseRate; // Default
  };

  // Generate receipt on component mount
  useEffect(() => {
    const createReceipt = async () => {
      setIsLoading(true);
      try {
        const response = await generateReceipt({
          borrowRecordId,
          type,
        });

        if (response.success && response.data) {
          setReceiptId(response.data.id);
        } else {
          toast.error(response.message || "Failed to generate receipt");
        }
      } catch (error) {
        console.error("Error generating receipt:", error);
        toast.error("An error occurred while generating the receipt");
      } finally {
        setIsLoading(false);
      }
    };

    createReceipt();
  }, [borrowRecordId, type]);

  const totalCharge = calculateCharges();
  const currentDate = new Date().toLocaleDateString();
  const dueDate = book.dueDate
    ? new Date(book.dueDate).toLocaleDateString()
    : "N/A";
  // Handle both Date object and string for borrowDate
  const borrowDate = book.borrowDate
    ? book.borrowDate instanceof Date
      ? book.borrowDate.toLocaleDateString()
      : new Date(book.borrowDate).toLocaleDateString()
    : currentDate;

  // Handle print functionality
  const handlePrint = async () => {
    setIsPrinting(true);
    
    try {
      // If we have a receipt ID, mark it as printed
      if (receiptId) {
        await updateReceipt({
          receiptId,
          isPrinted: true,
        });
      }
      
      setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 300);
    } catch (error) {
      console.error("Error updating receipt:", error);
      toast.error("An error occurred while updating the receipt");
      setIsPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/75 backdrop-blur-md flex items-center justify-center z-50 print:bg-transparent">
      {isLoading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-lg">Generating receipt...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md print:shadow-none print:max-w-full relative">
          {/* Close button - visible only when not printing */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 print:hidden"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Receipt Content */}
          <div className="p-6" id="receipt-content">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Library Receipt</h2>
              <p className="text-gray-600">
                {type === "BORROW"
                  ? "Book Borrowing Receipt"
                  : "Book Return Receipt"}
              </p>
              <p className="text-sm text-gray-500">Date: {currentDate}</p>
            </div>

            <div className="border-t border-b border-gray-200 py-4 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <p className="text-gray-600">Borrower:</p>
                <p className="font-medium">{book.borrowerName}</p>

                <p className="text-gray-600">Book Title:</p>
                <p className="font-medium">{book.bookTitle}</p>

                <p className="text-gray-600">ISBN:</p>
                <p className="font-medium">{book.bookIsbn || "N/A"}</p>

                <p className="text-gray-600">Borrow Date:</p>
                <p className="font-medium">{borrowDate}</p>

                <p className="text-gray-600">Due Date:</p>
                <p className="font-medium">{dueDate}</p>

                {type === "RETURN" && (
                  <>
                    <p className="text-gray-600">Return Date:</p>
                    <p className="font-medium">{currentDate}</p>
                  </>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Charges:</h3>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-gray-600">Base charge (7 days):</p>
                <p className="font-medium">₹70.00</p>

                {type === "RETURN" &&
                  book.dueDate &&
                  new Date() > new Date(book.dueDate) && (
                    <>
                      <p className="text-gray-600">Extra days:</p>
                      <p className="font-medium">
                        {Math.ceil(
                          Math.abs(
                            new Date().getTime() -
                              new Date(book.dueDate).getTime()
                          ) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days @ ₹2.00 per day
                      </p>

                      <p className="text-gray-600">Late fee:</p>
                      <p className="font-medium">
                        ₹
                        {(
                          Math.ceil(
                            Math.abs(
                              new Date().getTime() -
                                new Date(book.dueDate).getTime()
                            ) /
                              (1000 * 60 * 60 * 24)
                          ) * 2
                        ).toFixed(2)}
                      </p>
                    </>
                  )}

                <p className="text-gray-600 font-semibold">Total:</p>
                <p className="font-bold">₹{totalCharge.toFixed(2)}</p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mt-8">
              <p>Thank you for using our library services!</p>
              <p>Please keep this receipt for your records.</p>
              {receiptId && <p className="text-xs mt-2">Receipt ID: {receiptId}</p>}
            </div>
          </div>

          {/* Print button - visible only when not printing */}
          <div className="p-4 border-t border-gray-200 flex justify-end print:hidden">
            <button
              onClick={handlePrint}
              disabled={isPrinting || !receiptId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isPrinting ? "Printing..." : "Print Receipt"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptGenerator;