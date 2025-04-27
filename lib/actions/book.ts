"use server";

import { db } from "@/db/drizzle";
import { books, borrowRecords } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { BorrowBookParams, ApiResponse, BorrowRecord } from "@/types";

export async function borrowBook(
  params: BorrowBookParams
): Promise<ApiResponse<BorrowRecord>> {
  // Destructuring the params according to BorrowBookParams interface
  const { bookId, userId, deliveryMethod, deliveryAddressId, notes } = params;

  try {
    // Get book details to check availability and get libraryId
    const bookResult = await db
      .select({
        availableCopies: books.availableCopies,
        libraryId: books.libraryId,
      })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!bookResult.length) {
      return {
        success: false,
        error: "Book not found",
        message: "The requested book could not be found",
      };
    }

    const book = bookResult[0];

    // Check if there are available copies
    if (book.availableCopies <= 0) {
      return {
        success: false,
        error: "No copies available",
        message: "This book is currently out of stock",
      };
    }

    // Check if user already has an active borrow record for this book
    const existingBorrows = await db
      .select()
      .from(borrowRecords)
      .where(
        and(
          eq(borrowRecords.userId, userId),
          eq(borrowRecords.bookId, bookId),
          or(
            eq(borrowRecords.status, "PENDING"),
            eq(borrowRecords.status, "APPROVED"),
            eq(borrowRecords.status, "BORROW"),
            eq(borrowRecords.status, "OVERDUE")
          )
        )
      );

    if (existingBorrows.length > 0) {
      return {
        success: false,
        error: "Already borrowed",
        message: "You already have an active borrow record for this book",
      };
    }

    // Set borrowDate to current date
    const borrowDate = new Date();

    // Set dueDate to 7 days from borrowDate
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 7);

    // Format dueDate in YYYY-MM-DD format for date columns
    const dueDateStr = `${dueDate.getFullYear()}-${String(
      dueDate.getMonth() + 1
    ).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")}`;

    // Create borrow record with PENDING status - don't reduce available copies yet
    const [record] = await db
      .insert(borrowRecords)
      .values({
        userId,
        bookId,
        libraryId: book.libraryId,
        requestDate: new Date(),
        borrowDate: borrowDate,
        dueDate: dueDateStr,
        status: "PENDING", // Initial status is PENDING
        deliveryMethod,
        deliveryAddressId,
        notes,
        reminderSent: false,
      })
      .returning();

    // Note: We don't reduce book.availableCopies here anymore
    // The available copies will be reduced when the status is changed to APPROVED

    // Return success response with properly typed data
    return {
      success: true,
      message: "Borrow request submitted successfully",
      data: {
        ...record,
        dueDate: record.dueDate ? new Date(record.dueDate) : undefined,
        returnDate: record.returnDate ? new Date(record.returnDate) : undefined,
        createdAt: record.createdAt
          ? new Date(record.createdAt)
          : record.createdAt,
        updatedAt: record.updatedAt
          ? new Date(record.updatedAt)
          : record.updatedAt,
      } as BorrowRecord,
    };
  } catch (error) {
    console.error("Error in borrowing book:", error);
    return {
      success: false,
      error: "Database error",
      message: "An error occurred while processing your request",
    };
  }
}

// Create a new server action to approve borrow requests
export async function approveBorrowRequest(
  borrowId: string
): Promise<ApiResponse<BorrowRecord>> {
  try {
    // Get the borrow record
    const borrowRecordResult = await db
      .select()
      .from(borrowRecords)
      .where(eq(borrowRecords.id, borrowId))
      .limit(1);

    if (!borrowRecordResult.length) {
      return {
        success: false,
        error: "Record not found",
        message: "The borrow record could not be found",
      };
    }

    const borrowRecord = borrowRecordResult[0];
    
    // Check if the record is already approved
    if (borrowRecord.status !== "PENDING") {
      return {
        success: false,
        error: "Invalid status",
        message: `This request cannot be approved because its current status is ${borrowRecord.status}`,
      };
    }
    
    // Get book to check available copies
    const bookResult = await db
      .select({
        availableCopies: books.availableCopies,
      })
      .from(books)
      .where(eq(books.id, borrowRecord.bookId))
      .limit(1);
      
    if (!bookResult.length || bookResult[0].availableCopies <= 0) {
      return {
        success: false,
        error: "No copies available",
        message: "This book is currently out of stock",
      };
    }

    // Update the borrow record status to APPROVED
    const [updatedRecord] = await db
      .update(borrowRecords)
      .set({
        status: "APPROVED",
        updatedAt: new Date(),
      })
      .where(eq(borrowRecords.id, borrowId))
      .returning();

    // Now that the request is approved, reduce the available copies
    await db
      .update(books)
      .set({ 
        availableCopies: bookResult[0].availableCopies - 1 
      })
      .where(eq(books.id, borrowRecord.bookId));

    return {
      success: true,
      message: "Borrow request approved successfully",
      data: {
        ...updatedRecord,
        dueDate: updatedRecord.dueDate ? new Date(updatedRecord.dueDate) : undefined,
        returnDate: updatedRecord.returnDate ? new Date(updatedRecord.returnDate) : undefined,
        createdAt: updatedRecord.createdAt
          ? new Date(updatedRecord.createdAt)
          : updatedRecord.createdAt,
        updatedAt: updatedRecord.updatedAt
          ? new Date(updatedRecord.updatedAt)
          : updatedRecord.updatedAt,
      } as BorrowRecord,
    };
  } catch (error) {
    console.error("Error in approving borrow request:", error);
    return {
      success: false,
      error: "Database error",
      message: "An error occurred while processing your request",
    };
  }
}