"use client";
import { updateBorrowStatus } from "@/lib/library/actions/book";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

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
      const response = await updateBorrowStatus(borrowId, newStatus);

      if (response.success) {
        toast.success(response.message || "Status updated successfully");
        // Update local state to reflect the change without full page refresh
        const updatedBooks = borrowedBooks.map((book) =>
          book.id === borrowId ? { ...book, status: newStatus } : book
        );
        setFilteredBooks(updatedBooks);
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-4 text-sm text-center text-gray-500"
                  >
                    No borrowed books found matching the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BorrowMembers;
