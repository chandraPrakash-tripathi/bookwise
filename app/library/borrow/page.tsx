import BorrowMembers from '@/components/library/BorrowMembers'
import { db } from '@/db/drizzle'
import { books, borrowRecords, users, bookConditionRecords } from '@/db/schema'
import { BookConditionRecord } from '@/types'
import { eq, isNotNull } from 'drizzle-orm'
import React from 'react'

const page = async() => {
  // Fetching borrowed books data from the database with condition records
  // and joining with users and books tables to get additional information
  const borrowedBooksRaw = await db
    .select({
      id: borrowRecords.id,
      
      userId: borrowRecords.userId,
      borrowerName: users.fullName,  // Added borrower name from users table
      
      bookId: borrowRecords.bookId,
      bookTitle: books.title,  // Added book title from books table
      bookIsbn: books.isbn,
      
      status: borrowRecords.status,
      borrowDate: borrowRecords.borrowDate,
      dueDate: borrowRecords.dueDate,
      
      // Include the condition record data
      conditionRecord: {
        id: bookConditionRecords.id,
        borrowRecordId: bookConditionRecords.borrowRecordId,
        beforeBorrowPhotos: bookConditionRecords.beforeBorrowPhotos,
        afterReturnPhotos: bookConditionRecords.afterReturnPhotos,
        beforeConditionNotes: bookConditionRecords.beforeConditionNotes,
        afterConditionNotes: bookConditionRecords.afterConditionNotes,
        createdAt: bookConditionRecords.createdAt,
        updatedAt: bookConditionRecords.updatedAt,
      }
    })
    .from(borrowRecords)
    .innerJoin(users, eq(borrowRecords.userId, users.id))  // Join with users table
    .innerJoin(books, eq(borrowRecords.bookId, books.id))  // Join with books table
    .leftJoin(bookConditionRecords, eq(borrowRecords.id, bookConditionRecords.borrowRecordId))  // Left join with condition records
    .where(isNotNull(borrowRecords.borrowDate))  // Only books with a borrowDate (borrowed books)
    .orderBy(borrowRecords.borrowDate);

  // Convert records to match the expected TypeScript interface
  const borrowedBooks = borrowedBooksRaw.map(book => {
    // If conditionRecord is null or its ID is null, return undefined
    // Otherwise, properly transform the conditionRecord to match the BookConditionRecord interface
    const transformedConditionRecord = book.conditionRecord && book.conditionRecord.id ? {
      ...book.conditionRecord,
      // Ensure photo arrays are properly typed as string[]
      beforeBorrowPhotos: Array.isArray(book.conditionRecord.beforeBorrowPhotos) 
        ? book.conditionRecord.beforeBorrowPhotos as string[]
        : [],
      afterReturnPhotos: Array.isArray(book.conditionRecord.afterReturnPhotos)
        ? book.conditionRecord.afterReturnPhotos as string[]
        : [],
      // Ensure optional string fields are undefined instead of null
      beforeConditionNotes: book.conditionRecord.beforeConditionNotes || undefined,
      afterConditionNotes: book.conditionRecord.afterConditionNotes || undefined
    } as BookConditionRecord : undefined;
    
    return {
      ...book,
      conditionRecord: transformedConditionRecord
    };
  });
  
  return (
    <div>
      <BorrowMembers borrowedBooks={borrowedBooks} />
    </div>
  )
}

export default page