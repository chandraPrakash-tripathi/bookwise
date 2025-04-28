import React from 'react'

interface Props {
  borrowedBooks: {
    id: string;
    userId: string;
    borrowerName: string; // Added borrower name from users table
    bookTitle: string; // Added book title from books table
    bookIsbn: string | null; // Added book ISBN from books table
    bookId: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "BORROW" | "RETURNED" | "OVERDUE" | string;
    borrowDate: Date | null;
    dueDate: string | null;
  }[]
}

const BorrowMembers = ({ borrowedBooks }: Props) => {
  // Helper function to format dates
  const formatDate = (date: Date | null): string => {
    if (!date) return '-';
    return date.toLocaleDateString();
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

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-lg shadow">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrower Name</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Name</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrow Date</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {borrowedBooks.length > 0 ? (
                borrowedBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-900 truncate">{book.borrowerName}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 truncate">{book.bookTitle}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 truncate">{book.bookIsbn}</td>
                    <td className="px-3 py-2 text-sm">
                      {getStatusDisplay(book.status)}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{formatDate(book.borrowDate)}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{formatDate(book.dueDate ? new Date(book.dueDate) : null)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-sm text-center text-gray-500">
                    No borrowed books found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default BorrowMembers