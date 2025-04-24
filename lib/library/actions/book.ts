"use server";

import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { books, users, libraries } from "@/db/schema";
import { BookParams, ApiResponse, Book } from "@/types";
import { eq } from "drizzle-orm";

export const createLibraryBook = async (params: BookParams): Promise<ApiResponse<Book>> => {
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

  // If no library found for this user or if the provided libraryId doesn't match
  if (!libraryCheck.length || libraryCheck[0].id !== params.libraryId) {
    return {
      success: false,
      error: "Unauthorized",
      message: "You can only submit books for your own library",
    };
  }

  try {
    const newBook = await db
      .insert(books)
      .values({
        ...params,
        availableCopies: params.totalCopies,
        isApproved: false, // Set as not approved by default
      })
      .returning();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newBook[0])),
      message: "Book submitted successfully and awaiting admin approval",
    };
  } catch (error) {
    console.error("Error creating library book:", error);

    return {
      success: false,
      error: "Failed to submit book",
      message: "An error occurred while submitting the book for approval",
    };
  }
};