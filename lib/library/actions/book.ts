"use server";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { books, users, libraries } from "@/db/schema";
import { ApiResponse, Book } from "@/types";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { bookSchemaLib } from "@/lib/validations";

// Use the schema type instead of BookParams
type BookLibParams = z.infer<typeof bookSchemaLib>;

export const createLibraryBook = async (params: BookLibParams): Promise<ApiResponse<Book>> => {
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
      console.log(`Library ID mismatch: User library=${userLibraryId}, Submitted=${submittedLibraryId}`);
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
      isApproved: false // Set as not approved by default
    };

    // Log the data being inserted for debugging
    console.log("Inserting book data:", bookData);

    const newBook = await db
      .insert(books)
      .values(bookData)
      .returning();

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
    const totalCopiesDiff = params.totalCopies - (currentBook.availableCopies || 0);
    
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
      availableCopies: params.availableCopies !== undefined 
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