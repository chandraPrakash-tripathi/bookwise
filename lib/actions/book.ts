'use server'

import { db } from "@/db/drizzle";
import { books, borrowRecords } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BorrowBookParams, ApiResponse, BorrowRecord } from "@/types";

export async function borrowBook(params: BorrowBookParams): Promise<ApiResponse<BorrowRecord>> {
  // Destructuring the params according to BorrowBookParams interface
  const { bookId, userId, deliveryMethod, deliveryAddressId, notes } = params;

  try {
    // Get book details to check availability and get libraryId
    const bookResult = await db
      .select({
        availableCopies: books.availableCopies,
        libraryId: books.libraryId
      })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!bookResult.length) {
      return {
        success: false,
        error: "Book not found",
        message: "The requested book could not be found"
      };
    }

    const book = bookResult[0];
    
    // Check if there are available copies
    if (book.availableCopies <= 0) {
      return {
        success: false,
        error: "No copies available",
        message: "This book is currently out of stock"
      };
    }

    // Create borrow record
    const [record] = await db
      .insert(borrowRecords)
      .values({
        userId,
        bookId,
        libraryId: book.libraryId,
        requestDate: new Date(),
        status: "PENDING",
        deliveryMethod,
        deliveryAddressId,
        notes,
        reminderSent: false
      })
      .returning();

    // Update available copies of the book
    await db
      .update(books)
      .set({ availableCopies: book.availableCopies - 1 })
      .where(eq(books.id, bookId));

    // Return success response with properly typed data
    return {
      success: true,
      message: "Book borrowed successfully",
      data: { 
        ...record, 
        dueDate: record.dueDate ? new Date(record.dueDate) : undefined,
        returnDate: record.returnDate ? new Date(record.returnDate) : undefined,
        createdAt: record.createdAt ? new Date(record.createdAt) : record.createdAt,
        updatedAt: record.updatedAt ? new Date(record.updatedAt) : record.updatedAt 
      } as BorrowRecord
    };
  } catch (error) {
    console.error("Error in borrowing book:", error);
    return {
      success: false,
      error: "Database error",
      message: "An error occurred while processing your request"
    };
  }
}