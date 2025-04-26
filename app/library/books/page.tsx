import { auth } from '@/auth'
import { db } from '@/db/drizzle'
import { users, libraries, books } from '@/db/schema'
import { eq } from 'drizzle-orm'
import React from 'react'
import { Book } from '@/types'
import BookManagerClient from '@/components/library/forms/BookManagerClient'

const page = async() => {
  const session = await auth()
  // Get user id from session
  const userId = session?.user?.id
  if (!userId) {
    throw new Error("User not logged in");
  }
  
  // Get user from db and check role should be LIBRARY
  const [userRecord] = await db.select().from(users).where(eq(users.id, userId));
  if (!userRecord || userRecord.role !== 'LIBRARY') {
    throw new Error("User is not authorized to access this page.");
  }
  
  // Get library ID associated with the user
  const [libraryRecord] = await db.select({
    id: libraries.id
  }).from(libraries).where(eq(libraries.userId, userId));
  
  if (!libraryRecord) {
    throw new Error("No library found for this user.");
  }
  
  const libraryId = libraryRecord.id;

  // Get the books from books schema
  const dbBooks = await db.select().from(books).where(eq(books.libraryId, libraryId));
  
  const allbooks = dbBooks.map(book => {
    // Cast to Book type - this handles the null vs undefined issue
    return {
      ...book,
      isbn: book.isbn || undefined,
      publicationYear: book.publicationYear || undefined,
      publisher: book.publisher || undefined,
      approvedBy: book.approvedBy || undefined
    } as Book;
  });
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Library Management</h1>
      <BookManagerClient books={allbooks} libraryId={libraryId} />
    </div>
  )
}

export default page