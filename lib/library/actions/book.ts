"use server";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { books, users, libraries, borrowRecords } from "@/db/schema";
import { ApiResponse, Book, BorrowRecord } from "@/types";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { bookSchemaLib } from "@/lib/validations";

// Use the schema type instead of BookParams
type BookLibParams = z.infer<typeof bookSchemaLib>;

export const createLibraryBook = async (
  params: BookLibParams
): Promise<ApiResponse<Book>> => {
  try {
    // First, authenticate the user
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
        message: "You must be logged in to perform this action",
      };
    }

    // Check if the user is a library owner
    const userCheck = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!userCheck.length || userCheck[0].role !== "LIBRARY") {
      return {
        success: false,
        error: "Unauthorized",
        message: "Only library owners can submit books",
      };
    }

    // Verify the library belongs to the current user
    const libraryCheck = await db
      .select({ id: libraries.id })
      .from(libraries)
      .where(eq(libraries.userId, session.user.id))
      .limit(1);

    if (!libraryCheck.length) {
      return {
        success: false,
        error: "Unauthorized",
        message: "You don't have a registered library",
      };
    }

    // Convert IDs to strings for comparison if needed
    const userLibraryId = String(libraryCheck[0].id);
    const submittedLibraryId = String(params.libraryId);

    // Now compare as strings
    if (userLibraryId !== submittedLibraryId) {
      console.log(
        `Library ID mismatch: User library=${userLibraryId}, Submitted=${submittedLibraryId}`
      );
      return {
        success: false,
        error: "Unauthorized",
        message: "You can only submit books for your own library",
      };
    }

    // Create book object matching the schema structure
    const bookData = {
      libraryId: params.libraryId,
      title: params.title,
      author: params.author,
      genre: params.genre,
      isbn: params.isbn || null,
      publicationYear: params.publicationYear || null,
      publisher: params.publisher || null,
      rating: params.rating,
      coverUrl: params.coverUrl,
      coverColor: params.coverColor,
      description: params.description,
      totalCopies: params.totalCopies,
      availableCopies: params.availableCopies ?? params.totalCopies, // Use provided value or default to total copies
      videoUrl: params.videoUrl,
      summary: params.summary,
      isApproved: false, // Set as not approved by default
    };

    // Log the data being inserted for debugging
    console.log("Inserting book data:", bookData);

    const newBook = await db.insert(books).values(bookData).returning();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newBook[0])),
      message: "Book submitted successfully and awaiting admin approval",
    };
  } catch (error) {
    // Comprehensive error logging
    console.error("Error creating library book:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      error: `Failed to submit book: ${errorMessage}`,
      message: "An error occurred while submitting the book for approval",
    };
  }
};

export const updateLibraryBook = async (
  bookId: string,
  params: BookLibParams
): Promise<ApiResponse<Book>> => {
  try {
    // First, authenticate the user
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
        message: "You must be logged in to perform this action",
      };
    }

    // Check if the user is a library owner
    const userCheck = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!userCheck.length || userCheck[0].role !== "LIBRARY") {
      return {
        success: false,
        error: "Unauthorized",
        message: "Only library owners can update books",
      };
    }

    // Verify the library belongs to the current user
    const libraryCheck = await db
      .select({ id: libraries.id })
      .from(libraries)
      .where(eq(libraries.userId, session.user.id))
      .limit(1);

    if (!libraryCheck.length) {
      return {
        success: false,
        error: "Unauthorized",
        message: "You don't have a registered library",
      };
    }

    // Check that the book exists and belongs to this library
    const bookCheck = await db
      .select({
        id: books.id,
        libraryId: books.libraryId,
        availableCopies: books.availableCopies,
        isApproved: books.isApproved, // Get the current approval status
      })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!bookCheck.length) {
      return {
        success: false,
        error: "Not Found",
        message: "Book not found",
      };
    }

    const book = bookCheck[0];
    console.log("Book approval status:", book.isApproved);

    // Ensure the book belongs to the user's library
    const userLibraryId = String(libraryCheck[0].id);
    const bookLibraryId = String(book.libraryId);

    if (userLibraryId !== bookLibraryId) {
      return {
        success: false,
        error: "Unauthorized",
        message: "You can only update books in your own library",
      };
    }

    // Calculate the difference in total copies to adjust available copies
    const currentBook = bookCheck[0];
    const totalCopiesDiff =
      params.totalCopies - (currentBook.availableCopies || 0);

    // Create book object matching the schema structure for update
    const bookData = {
      title: params.title,
      author: params.author,
      genre: params.genre,
      isbn: params.isbn || null,
      publicationYear: params.publicationYear || null,
      publisher: params.publisher || null,
      rating: params.rating,
      coverUrl: params.coverUrl,
      coverColor: params.coverColor,
      description: params.description,
      totalCopies: params.totalCopies,
      // If availableCopies is explicitly provided, use it, otherwise adjust based on total copies difference
      availableCopies:
        params.availableCopies !== undefined
          ? params.availableCopies
          : Math.max(0, (currentBook.availableCopies || 0) + totalCopiesDiff),
      videoUrl: params.videoUrl,
      summary: params.summary,
      // Preserve the existing approval status - don't change it
      // isApproved field is intentionally omitted so it won't be updated
    };

    // Log the data being updated for debugging
    console.log("Updating book data:", bookData);
    console.log("Current approval status:", currentBook.isApproved);

    const updatedBook = await db
      .update(books)
      .set(bookData)
      .where(eq(books.id, bookId))
      .returning();

    // Determine the appropriate success message based on approval status
    const successMessage = currentBook.isApproved
      ? "Book updated successfully"
      : "Book updated successfully and awaiting admin approval";

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedBook[0])),
      message: successMessage,
    };
  } catch (error) {
    // Comprehensive error logging
    console.error("Error updating library book:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      error: `Failed to update book: ${errorMessage}`,
      message: "An error occurred while updating the book",
    };
  }
};



export async function updateBorrowStatus(
  borrowId: string,
  newStatus: "PENDING" | "APPROVED" | "REJECTED" | "BORROW" | "RETURNED" | "OVERDUE"
): Promise<ApiResponse<BorrowRecord>> {
  try {
    // First, authenticate the user
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
        message: "You must be logged in to perform this action",
      };
    }

    // Check if the user is a library owner or admin
    const userCheck = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (
      !userCheck.length ||
      (userCheck[0].role !== "LIBRARY" && userCheck[0].role !== "ADMIN")
    ) {
      return {
        success: false,
        error: "Unauthorized",
        message:
          "Only library owners or administrators can change borrow status",
      };
    }

    // Get the current borrow record
    const borrowRecordCheck = await db
      .select({
        id: borrowRecords.id,
        status: borrowRecords.status,
        bookId: borrowRecords.bookId,
        libraryId: borrowRecords.libraryId,
      })
      .from(borrowRecords)
      .where(eq(borrowRecords.id, borrowId))
      .limit(1);

    if (!borrowRecordCheck.length) {
      return {
        success: false,
        error: "Not Found",
        message: "Borrow record not found",
      };
    }

    const borrowRecord = borrowRecordCheck[0];

    // If user is a library owner, ensure the book belongs to their library
    if (userCheck[0].role === "LIBRARY") {
      const libraryCheck = await db
        .select({ id: libraries.id })
        .from(libraries)
        .where(eq(libraries.userId, session.user.id))
        .limit(1);

      if (!libraryCheck.length) {
        return {
          success: false,
          error: "Unauthorized",
          message: "You don't have a registered library",
        };
      }

      const userLibraryId = String(libraryCheck[0].id);
      const borrowLibraryId = String(borrowRecord.libraryId);

      if (userLibraryId !== borrowLibraryId) {
        return {
          success: false,
          error: "Unauthorized",
          message: "You can only manage borrow records for your own library",
        };
      }
    }

    const oldStatus = borrowRecord.status;
    
    // Prepare update data - using a clean object with Record type to avoid 'any'
    const updateData: Record<string, string | Date> = {
      status: newStatus,
      handled_by: session.user.id, // Using snake_case to match schema field
      updated_at: new Date(),
    };
    
    // Add timestamps for specific status changes
    if (newStatus === "BORROW" && oldStatus !== "BORROW") {
      updateData.borrow_date = new Date(); // Using dot notation is fine with Record type
      // Set due date to 2 weeks from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      updateData.due_date = dueDate;
    } else if (newStatus === "RETURNED") {
      updateData.return_date = new Date();
    }

    // Update borrow record
    const updatedBorrowRecord = await db
      .update(borrowRecords)
      .set(updateData)
      .where(eq(borrowRecords.id, borrowId))
      .returning();

    // After status update, call the function to update book availability if needed
    if (oldStatus !== newStatus) {
      try {
        await updateBookAvailability(borrowRecord.bookId, oldStatus, newStatus);
      } catch (error) {
        console.error("Error updating book availability:", error);
        // We continue anyway, as the main status update was successful
      }
    }

    // Generate appropriate success message
    let successMessage = "Book status updated successfully";
    if (newStatus === "APPROVED") {
      successMessage = "Borrow request approved successfully";
    } else if (newStatus === "REJECTED") {
      successMessage = "Borrow request rejected";
    } else if (newStatus === "BORROW") {
      successMessage = "Book marked as borrowed";
    } else if (newStatus === "RETURNED") {
      successMessage = "Book marked as returned";
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedBorrowRecord[0])),
      message: successMessage,
    };
  } catch (error) {
    // Comprehensive error logging
    console.error("Error changing borrow status:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      error: `Failed to update borrow status: ${errorMessage}`,
      message: "An error occurred while updating the borrow status",
    };
  }
}

// Function to handle just the book availability count update
export async function updateBookAvailability(
  bookId: string,
  oldStatus: string,
  newStatus: string
): Promise<boolean> {
  try {
    // Get current book information
    const bookCheck = await db
      .select({
        id: books.id,
        availableCopies: books.availableCopies,
        totalCopies: books.totalCopies,
      })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!bookCheck.length) {
      console.error("Book not found during availability update");
      return false;
    }

    const book = bookCheck[0];
    let availableCopiesAdjustment = 0;

    // Determine how to adjust available copies based on status transition
    if (oldStatus !== newStatus) {
      // If transitioning to BORROW, decrement available copies (if not already in BORROW status)
      if (newStatus === "BORROW" && oldStatus !== "BORROW") {
        availableCopiesAdjustment = -1;
      }
      // If transitioning from BORROW to RETURNED/REJECTED, increment available copies
      else if (
        oldStatus === "BORROW" &&
        (newStatus === "RETURNED" || newStatus === "REJECTED")
      ) {
        availableCopiesAdjustment = 1;
      }
    }

    // Only update if there's an adjustment needed
    if (availableCopiesAdjustment !== 0) {
      // Calculate new available copies with bounds checking
      const newAvailableCopies = Math.min(
        Math.max(0, (book.availableCopies || 0) + availableCopiesAdjustment),
        book.totalCopies
      );

      // Update book's available copies
      await db
        .update(books)
        .set({ availableCopies: newAvailableCopies }) // Using camelCase to match schema field
        .where(eq(books.id, bookId));
    }

    return true;
  } catch (error) {
    console.error("Error updating book availability:", error);
    return false;
  }
}

