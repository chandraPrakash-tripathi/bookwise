'use server'
import { db } from "@/db/drizzle";
import { books, borrowRecords } from "@/db/schema";
import { eq } from "drizzle-orm";
import dayjs from "dayjs";

export const borrowBook = async (params: BorrowBookParams) => {
  //destructuring the params
  const { userId, bookId } = params;
  try {
    const book = await db
      .select({ availableCopies: books.availableCopies })
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book.length || book[0].availableCopies <= 0) {
      return {
        success: false,
        message: "Book not available",
      };
    }
    //set the deadline
    const dueDate = dayjs().add(7, "day").toDate().toDateString();
    //record of borrowed books
    const record = await db.insert(borrowRecords).values({
      userId,
      bookId,
      dueDate,
      status: "BORROW",
    });

    //update the available copies of the book
    await db
      .update(books)
      .set({ availableCopies: book[0].availableCopies - 1 })
      .where(eq(books.id, bookId));

        // return the record of borrowed books
      return{
        success: true,
        message: "Book borrowed successfully",
        data:JSON.parse(JSON.stringify(record))
      }
  } catch (error) {
    console.log("Error in borrowing book", error);
    return {
      success: false,
      message: "Error in borrowing book",
    };
  }
};
