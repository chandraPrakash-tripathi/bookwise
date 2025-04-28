import BorrowMembers from '@/components/library/BorrowMembers'
import { db } from '@/db/drizzle'
import { books, borrowRecords, users } from '@/db/schema'
import {  eq, isNotNull } from 'drizzle-orm'
import React from 'react'

const page = async() => {
// Fetching borrowed books data from the database
// and joining with users and books tables to get additional information

  const borrowedBooks = await db
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
  })
  .from(borrowRecords)
  .innerJoin(users, eq(borrowRecords.userId, users.id))  // Join with users table
  .innerJoin(books, eq(borrowRecords.bookId, books.id))  // Join with books table
  .where(isNotNull(borrowRecords.borrowDate))  // Only books with a borrowDate (borrowed books)
  .orderBy(borrowRecords.borrowDate);
  
              
  


  return (
    <div>
      <BorrowMembers borrowedBooks={borrowedBooks} />
    </div>
  )
}

export default page
