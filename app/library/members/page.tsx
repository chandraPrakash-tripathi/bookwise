import { auth } from '@/auth'
import MembersHistory from '@/components/library/MembersHistory'
import { db } from '@/db/drizzle'
import { 
  books, 
  borrowRecords, 
  users, 
  bookConditionRecords, 
  deliveryAddresses, 
  receipts,
  libraries 
} from '@/db/schema'
import { 
  BookConditionRecord, 
  DeliveryAddress, 
  Receipt, 
  BorrowHistory 
} from '@/types'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import React from 'react'

const page = async () => {
  // Get the current session
  const session = await auth()
  
  if (!session || !session.user?.email) {
    // Redirect to login if no session exists
    redirect('/login?callbackUrl=/library/members-history');
  }

  // Get the current user details from database
  const currentUserResult = await db
    .select({
      id: users.id,
      role: users.role,
    })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)
    .execute();
  const currentUser = currentUserResult[0];

  if (!currentUser) {
    redirect('/sign-in');
  }

  // Check if user has LIBRARY role
  if (currentUser.role !== "LIBRARY") {
    // Redirect to unauthorized page or dashboard
    redirect('/sign-in');
  }

  // Get the library linked to this user
  const userLibraryResult = await db
    .select({
      id: libraries.id,
    })
    .from(libraries)
    .where(eq(libraries.userId, currentUser.id))
    .limit(1)
    .execute();
  const userLibrary = userLibraryResult[0];

  if (!userLibrary || !userLibrary.id) {
    // This should not happen for a LIBRARY role user, but handle it just in case
    redirect('/sign-in');
  }

  const libraryId = userLibrary.id;
  
  // Now fetch all members who have borrowed books from this library
  const membersHistoryRaw = await db
    .select({
      // Borrow record info
      borrowId: borrowRecords.id,
      requestDate: borrowRecords.requestDate,
      borrowDate: borrowRecords.borrowDate,
      dueDate: borrowRecords.dueDate,
      returnDate: borrowRecords.returnDate,
      status: borrowRecords.status,
      deliveryMethod: borrowRecords.deliveryMethod,
      notes: borrowRecords.notes,
      
      // User information
      userId: users.id,
      fullName: users.fullName,
      email: users.email,
      universityId: users.universityId,
      universityCard: users.universityCard,
      profilePicture: users.profilePicture,
      
      // Book information
      bookId: books.id,
      bookTitle: books.title,
      bookAuthor: books.author,
      bookCoverUrl: books.coverUrl,
      bookIsbn: books.isbn,
      
      // Library information
      libraryId: libraries.id,
      libraryName: libraries.name,
      
      // Delivery address
      deliveryAddress: {
        id: deliveryAddresses.id,
        fullName: deliveryAddresses.fullName,
        phone: deliveryAddresses.phone,
        addressLine1: deliveryAddresses.addressLine1,
        addressLine2: deliveryAddresses.addressLine2,
        city: deliveryAddresses.city,
        state: deliveryAddresses.state,
        zipCode: deliveryAddresses.zipCode,
        country: deliveryAddresses.country
      },
      
      // Book condition record
      conditionRecord: {
        id: bookConditionRecords.id,
        borrowRecordId: bookConditionRecords.borrowRecordId,
        beforeBorrowPhotos: bookConditionRecords.beforeBorrowPhotos,
        afterReturnPhotos: bookConditionRecords.afterReturnPhotos,
        beforeConditionNotes: bookConditionRecords.beforeConditionNotes,
        afterConditionNotes: bookConditionRecords.afterConditionNotes,
        createdAt: bookConditionRecords.createdAt,
        updatedAt: bookConditionRecords.updatedAt,
      },
      
      // Receipt information
      receipt: {
        id: receipts.id,
        borrowRecordId: receipts.borrowRecordId,
        type: receipts.type,
        baseCharge: receipts.baseCharge,
        extraDays: receipts.extraDays,
        extraCharge: receipts.extraCharge,
        totalCharge: receipts.totalCharge,
        generatedAt: receipts.generatedAt,
        notes: receipts.notes,
        isPrinted: receipts.isPrinted
      }
    })
    .from(borrowRecords)
    .innerJoin(users, eq(borrowRecords.userId, users.id))
    .innerJoin(books, eq(borrowRecords.bookId, books.id))
    .innerJoin(libraries, eq(borrowRecords.libraryId, libraries.id))
    .leftJoin(bookConditionRecords, eq(borrowRecords.id, bookConditionRecords.borrowRecordId))
    .leftJoin(deliveryAddresses, eq(borrowRecords.deliveryAddressId, deliveryAddresses.id))
    .leftJoin(receipts, eq(borrowRecords.id, receipts.borrowRecordId))
    .where(eq(borrowRecords.libraryId, libraryId))
    .orderBy(borrowRecords.requestDate);

  // Transform the raw data to handle nulls and ensure proper typing
  const membersHistory = membersHistoryRaw.map(record => {
    // Transform condition record
    const transformedConditionRecord = record.conditionRecord && record.conditionRecord.id ? {
      ...record.conditionRecord,
      beforeBorrowPhotos: Array.isArray(record.conditionRecord.beforeBorrowPhotos) 
        ? record.conditionRecord.beforeBorrowPhotos as string[]
        : [],
      afterReturnPhotos: Array.isArray(record.conditionRecord.afterReturnPhotos)
        ? record.conditionRecord.afterReturnPhotos as string[]
        : [],
      beforeConditionNotes: record.conditionRecord.beforeConditionNotes || undefined,
      afterConditionNotes: record.conditionRecord.afterConditionNotes || undefined
    } as BookConditionRecord : undefined;
    
    // Transform delivery address
    const transformedDeliveryAddress = record.deliveryAddress && record.deliveryAddress.id ? {
      ...record.deliveryAddress,
      addressLine2: record.deliveryAddress.addressLine2 || undefined
    } as DeliveryAddress : undefined;
    
    // Transform receipt
    const transformedReceipt = record.receipt && record.receipt.id ? {
      ...record.receipt,
      notes: record.receipt.notes || undefined
    } as Receipt : undefined;
    
    return {
      ...record,
      conditionRecord: transformedConditionRecord,
      deliveryAddress: transformedDeliveryAddress,
      receipt: transformedReceipt
    } as BorrowHistory;
  });

  console.log('Members History Raw:', membersHistoryRaw);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Members Borrowing History</h1>
      <MembersHistory membersHistory={membersHistory} />
    </div>
  )
}

export default page