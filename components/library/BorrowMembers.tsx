"use client";
import { updateBookConditionRecord, updateBorrowStatus } from "@/lib/library/actions/book";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import FileUpload from "../FileUpload";
import { Textarea } from "../ui/textarea";
import { BookConditionRecord, ReceiptBook, ReceiptType } from "@/types";
import ReceiptGenerator from "./RecieptGenerator";

interface Props {
  borrowedBooks: {
    id: string;
    userId: string;
    borrowerName: string;
    bookTitle: string;
    bookIsbn: string | null;
    bookId: string;
    status:
      | "PENDING"
      | "APPROVED"
      | "REJECTED"
      | "BORROW"
      | "RETURNED"
      | "OVERDUE"
      | string;
    borrowDate: Date | null;
    dueDate: string | null;
    conditionRecord?: BookConditionRecord;
  }[];
}

const BorrowMembers = ({ borrowedBooks }: Props) => {
  // Define all possible statuses for filtering
  const allStatuses = [
    "ALL",
    "PENDING",
    "APPROVED",
    "REJECTED",
    "BORROW",
    "RETURNED",
    "OVERDUE",
  ];

  // State for filters
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isbnSearch, setIsbnSearch] = useState<string>("");
  const [filteredBooks, setFilteredBooks] = useState(borrowedBooks);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [isSavingCondition, setIsSavingCondition] = useState<Record<string, boolean>>({});
  
  // State for condition records
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const [conditionRecords, setConditionRecords] = useState<Record<string, {
    beforeBorrowPhotos: string[];
    afterReturnPhotos: string[];
    beforeConditionNotes?: string;
    afterConditionNotes?: string;
  }>>({});

  // State for receipt generation
  const [receiptBook, setReceiptBook] = useState<ReceiptBook | null>(null);
  const [receiptType, setReceiptType] = useState<ReceiptType>("BORROW");
  const [receiptBorrowId, setReceiptBorrowId] = useState<string | null>(null);

  // Initialize condition records from props
  useEffect(() => {
    const initialRecords: Record<string, { beforeBorrowPhotos: string[]; afterReturnPhotos: string[]; beforeConditionNotes: string; afterConditionNotes: string; }> = {};
    borrowedBooks.forEach(book => {
      if (book.conditionRecord) {
        initialRecords[book.id] = {
          beforeBorrowPhotos: book.conditionRecord.beforeBorrowPhotos || [],
          afterReturnPhotos: book.conditionRecord.afterReturnPhotos || [],
          beforeConditionNotes: book.conditionRecord.beforeConditionNotes || '',
          afterConditionNotes: book.conditionRecord.afterConditionNotes || '',
        };
      } else {
        initialRecords[book.id] = {
          beforeBorrowPhotos: [],
          afterReturnPhotos: [],
          beforeConditionNotes: '',
          afterConditionNotes: '',
        };
      }
    });
    setConditionRecords(initialRecords);
  }, [borrowedBooks]);

  // Apply both filters whenever either filter changes
  useEffect(() => {
    let result = borrowedBooks;

    // Apply status filter
    if (selectedStatus !== "ALL") {
      result = result.filter((book) => book.status === selectedStatus);
    }

    // Apply ISBN search filter
    if (isbnSearch.trim() !== "") {
      result = result.filter((book) =>
        book.bookIsbn?.toLowerCase().includes(isbnSearch.toLowerCase())
      );
    }

    setFilteredBooks(result);
  }, [borrowedBooks, selectedStatus, isbnSearch]);

  // Helper function to format dates
  const formatDate = (date: Date | null | string): string => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  // Helper function to display status with appropriate styling
  const getStatusDisplay = (status: string): React.ReactElement => {
    let className = "px-2 py-1 text-xs font-medium rounded-full ";

    switch (status) {
      case "APPROVED":
        className += "bg-green-100 text-green-800";
        break;
      case "PENDING":
        className += "bg-yellow-100 text-yellow-800";
        break;
      case "REJECTED":
        className += "bg-red-100 text-red-800";
        break;
      case "BORROW":
        className += "bg-blue-100 text-blue-800";
        break;
      case "RETURNED":
        className += "bg-gray-100 text-gray-800";
        break;
      case "OVERDUE":
        className += "bg-purple-100 text-purple-800";
        break;
      default:
        className += "bg-gray-100 text-gray-800";
    }

    return <span className={className}>{status}</span>;
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedStatus("ALL");
    setIsbnSearch("");
  };

  // Save condition record to the database
  const saveConditionRecord = async (bookId: string) => {
    const record = conditionRecords[bookId];
    if (!record) return;
    
    setIsSavingCondition((prev) => ({ ...prev, [bookId]: true }));
    
    try {
      const response = await updateBookConditionRecord({
        borrowRecordId: bookId,
        beforeBorrowPhotos: record.beforeBorrowPhotos,
        afterReturnPhotos: record.afterReturnPhotos,
        beforeConditionNotes: record.beforeConditionNotes,
        afterConditionNotes: record.afterConditionNotes
      });
      
      if (response.success) {
        toast.success("Book condition record saved successfully");
        return true;
      } else {
        toast.error(response.message || "Failed to save condition record");
        return false;
      }
    } catch (error) {
      console.error("Error saving condition record:", error);
      toast.error("An error occurred while saving the condition record");
      return false;
    } finally {
      setIsSavingCondition((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  // Handle generating receipt
  const handleGenerateReceipt = (book: Props["borrowedBooks"][0], type: "BORROW" | "RETURN") => {
    // Convert the book to ReceiptBook type
    const receiptBookData: ReceiptBook = {
      ...book,
      borrowDate: book.borrowDate ? book.borrowDate.toString() : undefined,
      dueDate: book.dueDate ? book.dueDate : undefined,
      // Make sure other required fields match ReceiptBook type
    };
    
    setReceiptBook(receiptBookData);
    setReceiptType(type);
    setReceiptBorrowId(book.id);
  };

  // Close receipt modal
  const closeReceipt = () => {
    setReceiptBook(null);
    setReceiptBorrowId(null);
  };

  // Handle status change
  const handleStatusChange = async (
    borrowId: string,
    newStatus:
      | "PENDING"
      | "APPROVED"
      | "REJECTED"
      | "BORROW"
      | "RETURNED"
      | "OVERDUE"
  ) => {
    setIsLoading((prev) => ({ ...prev, [borrowId]: true }));

    try {
      // For BORROW and RETURNED statuses, ensure condition records are created
      if (newStatus === "BORROW" && (!conditionRecords[borrowId]?.beforeBorrowPhotos?.length)) {
        toast.error("Please add condition photos before marking as borrowed");
        setExpandedBookId(borrowId);
        setIsLoading((prev) => ({ ...prev, [borrowId]: false }));
        return;
      }

      if (newStatus === "RETURNED" && (!conditionRecords[borrowId]?.afterReturnPhotos?.length)) {
        toast.error("Please add return condition photos before marking as returned");
        setExpandedBookId(borrowId);
        setIsLoading((prev) => ({ ...prev, [borrowId]: false }));
        return;
      }

      // Save condition records to database
      const saved = await saveConditionRecord(borrowId);
      if (!saved && (newStatus === "BORROW" || newStatus === "RETURNED")) {
        setIsLoading((prev) => ({ ...prev, [borrowId]: false }));
        return;
      }

      const response = await updateBorrowStatus(borrowId, newStatus);

      if (response.success) {
        toast.success(response.message || "Status updated successfully");
        // Update local state to reflect the change without full page refresh
        const updatedBooks = filteredBooks.map((book) =>
          book.id === borrowId ? { ...book, status: newStatus } : book
        );
        setFilteredBooks(updatedBooks);
        
        // Generate receipt for BORROW or RETURNED status
        const book = borrowedBooks.find(b => b.id === borrowId);
        if (book) {
          if (newStatus === "BORROW") {
            handleGenerateReceipt(book, "BORROW");
          } else if (newStatus === "RETURNED") {
            handleGenerateReceipt(book, "RETURN");
          }
        }
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating borrow status:", error);
      toast.error("An error occurred while updating the status");
    } finally {
      setIsLoading((prev) => ({ ...prev, [borrowId]: false }));
    }
  };

  // Function to get available status actions based on current status
  const getStatusActions = (book: Props["borrowedBooks"][0]) => {
    const actions: {
      status: Props["borrowedBooks"][0]["status"];
      label: string;
    }[] = [];

    switch (book.status) {
      case "PENDING":
        actions.push({ status: "APPROVED", label: "Approve" });
        actions.push({ status: "REJECTED", label: "Reject" });
        break;
      case "APPROVED":
        actions.push({ status: "BORROW", label: "Mark as Borrowed" });
        actions.push({ status: "REJECTED", label: "Reject" });
        break;
      case "BORROW":
        actions.push({ status: "RETURNED", label: "Mark as Returned" });
        actions.push({ status: "OVERDUE", label: "Mark as Overdue" });
        break;
      case "OVERDUE":
        actions.push({ status: "RETURNED", label: "Mark as Returned" });
        break;
      // No actions for REJECTED or RETURNED status
    }

    return actions;
  };

  // Handle file upload for condition photos
  const handleFileUpload = (filePath: string, bookId: string, type: 'before' | 'after') => {
    setConditionRecords(prev => {
      const record = prev[bookId] || { beforeBorrowPhotos: [], afterReturnPhotos: [], beforeConditionNotes: '', afterConditionNotes: '' };
      
      if (type === 'before') {
        return {
          ...prev,
          [bookId]: {
            ...record,
            beforeBorrowPhotos: [...record.beforeBorrowPhotos, filePath]
          }
        };
      } else {
        return {
          ...prev,
          [bookId]: {
            ...record,
            afterReturnPhotos: [...record.afterReturnPhotos, filePath]
          }
        };
      }
    });
    
    toast.success(`Photo uploaded successfully for ${type === 'before' ? 'pre-borrow' : 'post-return'} condition`);
  };

  // Handle notes change
  const handleNotesChange = (value: string, bookId: string, type: 'before' | 'after') => {
    setConditionRecords(prev => {
      const record = prev[bookId] || { beforeBorrowPhotos: [], afterReturnPhotos: [], beforeConditionNotes: '', afterConditionNotes: '' };
      
      if (type === 'before') {
        return {
          ...prev,
          [bookId]: {
            ...record,
            beforeConditionNotes: value
          }
        };
      } else {
        return {
          ...prev,
          [bookId]: {
            ...record,
            afterConditionNotes: value
          }
        };
      }
    });
  };

  // Handle manual save of condition records
  const handleSaveConditionRecord = async (bookId: string) => {
    await saveConditionRecord(bookId);
  };

  // Toggle expanded book details
  const toggleExpandBook = (bookId: string) => {
    setExpandedBookId(expandedBookId === bookId ? null : bookId);
  };

  return (
    <div className="w-full">
      {/* Filter controls */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Status dropdown */}
          <div className="flex flex-col">
            <label
              htmlFor="status-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {allStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All Statuses" : status}
                </option>
              ))}
            </select>
          </div>

          {/* ISBN search */}
          <div className="flex flex-col">
            <label
              htmlFor="isbn-search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search by ISBN
            </label>
            <input
              type="text"
              id="isbn-search"
              value={isbnSearch}
              onChange={(e) => setIsbnSearch(e.target.value)}
              placeholder="Enter ISBN..."
              className="block w-60 pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
          </div>

          {/* Reset filters button */}
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset Filters
          </button>

          {/* Filter summary */}
          <div className="ml-auto text-sm text-gray-500 self-end">
            Showing {filteredBooks.length} of {borrowedBooks.length} books
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Borrower Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Book Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ISBN
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Borrow Date
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Due Date
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Condition
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <React.Fragment key={book.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-900 truncate">
                        {book.borrowerName}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 truncate">
                        {book.bookTitle}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 truncate">
                        {book.bookIsbn || "-"}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {getStatusDisplay(book.status)}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {formatDate(book.borrowDate)}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {formatDate(book.dueDate ? book.dueDate : null)}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        <div className="flex space-x-2">
                          {getStatusActions(book).map((action) => (
                            <button
                              key={action.status}
                              onClick={() =>
                                handleStatusChange(
                                  book.id,
                                  action.status as "PENDING" | "APPROVED" | "REJECTED" | "BORROW" | "RETURNED" | "OVERDUE"
                                )
                              }
                              disabled={isLoading[book.id]}
                              className={`px-2 py-1 text-xs font-medium rounded 
                                ${
                                  action.status === "APPROVED"
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : ""
                                }
                                ${
                                  action.status === "REJECTED"
                                    ? "bg-red-600 text-white hover:bg-red-700"
                                    : ""
                                }
                                ${
                                  action.status === "BORROW"
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : ""
                                }
                                ${
                                  action.status === "RETURNED"
                                    ? "bg-gray-600 text-white hover:bg-gray-700"
                                    : ""
                                }
                                ${
                                  action.status === "OVERDUE"
                                    ? "bg-purple-600 text-white hover:bg-purple-700"
                                    : ""
                                }
                                transition-colors ease-in-out duration-150
                              `}
                            >
                              {isLoading[book.id] ? "..." : action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        <button
                          onClick={() => toggleExpandBook(book.id)}
                          className="px-2 py-1 text-xs font-medium rounded bg-gray-200 hover:bg-gray-300"
                        >
                          {expandedBookId === book.id ? "Hide Details" : "Show Details"}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        <div className="flex space-x-2">
                          {/* Only show receipt buttons for applicable statuses */}
                          {book.status === "BORROW" && (
                            <button
                              onClick={() => handleGenerateReceipt(book, "BORROW")}
                              className="px-2 py-1 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700"
                            >
                              Borrow Receipt
                            </button>
                          )}
                          {book.status === "RETURNED" && (
                            <button
                              onClick={() => handleGenerateReceipt(book, "RETURN")}
                              className="px-2 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Return Receipt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedBookId === book.id && (
                      <tr>
                        <td colSpan={9} className="px-3 py-4 bg-gray-50">
                          <div className="grid grid-cols-2 gap-4">
                            {/* Before borrow condition section */}
                            <div className="border rounded-lg p-4 bg-white">
                              <h4 className="font-medium text-gray-900 mb-2">Before Borrow Condition</h4>
                              <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-1">Upload photos of the book&apos;s condition before borrowing:</p>
                                <FileUpload
                                  onFileChange={(filePath) => handleFileUpload(filePath, book.id, 'before')}
                                  type="video"
                                  accept="video/*"
                                  placeholder="Upload book condition photo before borrowing"
                                  folder={`book-conditions/${book.id}/before`}
                                  variant="light"
                                />
                              </div>
                              
                              {conditionRecords[book.id]?.beforeBorrowPhotos?.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-sm font-medium text-gray-700 mb-1">Uploaded Photos:</p>
                                  <div className="flex gap-2 flex-wrap">
                                    {conditionRecords[book.id]?.beforeBorrowPhotos.map((photo, index) => (
                                      <div key={index} className="text-xs text-gray-500 break-all bg-gray-100 p-1 rounded">
                                        {photo.split('/').pop()}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Condition Notes:
                                </label>
                                <Textarea
                                  value={conditionRecords[book.id]?.beforeConditionNotes || ''}
                                  onChange={(e) => handleNotesChange(e.target.value, book.id, 'before')}
                                  placeholder="Describe the book condition before borrowing"
                                  className="w-full h-24"
                                />
                              </div>
                            </div>
                            
                            {/* After return condition section */}
                            <div className="border rounded-lg p-4 bg-white">
                              <h4 className="font-medium text-gray-900 mb-2">After Return Condition</h4>
                              <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-1">Upload photos of the book&apos;s condition after return:</p>
                                <FileUpload
                                  onFileChange={(filePath) => handleFileUpload(filePath, book.id, 'after')}
                                  type="video"
                                  accept="video/*"
                                  placeholder="Upload book condition photo after return"
                                  folder={`book-conditions/${book.id}/after`}
                                  variant="light"
                                />
                              </div>
                              
                              {conditionRecords[book.id]?.afterReturnPhotos?.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-sm font-medium text-gray-700 mb-1">Uploaded Photos:</p>
                                  <div className="flex gap-2 flex-wrap">
                                    {conditionRecords[book.id]?.afterReturnPhotos.map((photo, index) => (
                                      <div key={index} className="text-xs text-gray-500 break-all bg-gray-100 p-1 rounded">
                                        {photo.split('/').pop()}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Condition Notes:
                                </label>
                                <Textarea
                                  value={conditionRecords[book.id]?.afterConditionNotes || ''}
                                  onChange={(e) => handleNotesChange(e.target.value, book.id, 'after')}
                                  placeholder="Describe the book condition after return"
                                  className="w-full h-24"
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Save condition button */}
                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => handleSaveConditionRecord(book.id)}
                              disabled={isSavingCondition[book.id]}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {isSavingCondition[book.id] ? "Saving..." : "Save Condition Record"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-4 text-center text-sm text-gray-500"
                  >
                    No borrowed books found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Receipt Modal */}
      <div className="bg-white">
      {receiptBook && receiptBorrowId && (
        <ReceiptGenerator
          borrowRecordId={receiptBorrowId}
          book={receiptBook}
          type={receiptType}
          onClose={closeReceipt}
        />
      )}
      </div>
     
    </div>
  )
}
export default BorrowMembers;