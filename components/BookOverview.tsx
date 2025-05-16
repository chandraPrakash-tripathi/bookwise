import Image from "next/image";
import React from "react";
import BookCover from "./BookCover";
import { db } from "@/db/drizzle";
import { deliveryAddresses, libraries, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import BookBorrow from "./BookBorrow";
import { Book } from "@/types";
import BookInteractions from "./BookInteractions/BookInteraction";

interface Props extends Book {
  userId: string;
}

const BookOverview = async ({
  id,
  libraryId,
  title,
  isbn,
  author,
  genre,
  publicationYear,
  publisher,
  rating,
  totalCopies,
  availableCopies,
  description,
  coverColor,
  coverUrl,

  userId,
}: Props) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const [library] = await db
    .select()
    .from(libraries)
    .where(eq(libraries.id, libraryId))
    .limit(1);

  const borrowingEligibility = {
    isEligible: availableCopies > 0 && user?.status === "APPROVED",
    message:
      availableCopies > 0
        ? "You are not eligible to borrow books"
        : "Book is not available",
  };

  const userAddresses = await db
    .select()
    .from(deliveryAddresses)
    .where(eq(deliveryAddresses.userId, userId))
    .orderBy(
      desc(deliveryAddresses.isDefault),
      desc(deliveryAddresses.createdAt)
    );

 return (
  <section className="flex flex-col-reverse items-center gap-12 sm:gap-32 xl:flex-row xl:gap-8">
    <div className="flex flex-1 flex-col gap-5">
      <h1 className="text-4xl font-bold text-white mb-6">{title}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
        {/* Author */}
        <div className="flex items-center">
          <span className="text-gray-400 text-lg w-36">Author:</span>
          <span className="text-white text-lg">{author}</span>
        </div>
        
        {/* Category/Genre */}
        <div className="flex items-center">
          <span className="text-gray-400 text-lg w-36">Category:</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900 text-blue-200">
            {genre}
          </span>
        </div>
        
        {/* Library */}
        <div className="flex items-center">
          <span className="text-gray-400 text-lg w-36">Library:</span>
          <span className="text-white text-lg">{library?.name}</span>
        </div>
        
        {/* Rating */}
        <div className="flex items-center">
          <span className="text-gray-400 text-lg w-36">Rating:</span>
          <div className="flex items-center">
            <Image src="/icons/star.svg" alt="star" width={20} height={20} className="text-yellow-300" />
            <span className="ml-2 text-white text-lg">{rating}</span>
          </div>
        </div>
        
        {/* Total Books */}
        <div className="flex items-center">
          <span className="text-gray-400 text-lg w-36">Total Books:</span>
          <span className="text-white text-lg">{totalCopies}</span>
        </div>
        
        {/* Available Books */}
        <div className="flex items-center">
          <span className="text-gray-400 text-lg w-36">Available:</span>
          <span className={`text-lg font-medium ${availableCopies > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {availableCopies}
          </span>
        </div>
        
        {/* ISBN */}
        <div className="flex items-center">
          <span className="text-gray-400 text-lg w-36">Book No:</span>
          <span className="text-white text-lg">{isbn}</span>
        </div>
        
        {/* Publisher (conditional) */}
        {publisher && (
          <div className="flex items-center">
            <span className="text-gray-400 text-lg w-36">Publisher:</span>
            <span className="text-white text-lg">{publisher}</span>
          </div>
        )}
        
        {/* Publication Year (conditional) */}
        {publicationYear && (
          <div className="flex items-center">
            <span className="text-gray-400 text-lg w-36">Publication Year:</span>
            <span className="text-white text-lg">{publicationYear}</span>
          </div>
        )}
      </div>
      
      {/* Description */}
      <div className="mt-8">
        <h3 className="text-xl font-medium text-gray-300 mb-3">Description</h3>
        <p className="text-gray-300 leading-relaxed text-lg">{description}</p>
      </div>

      {/* Borrow functionality */}
      {user && (
        <div className="mt-8">
          <BookBorrow
            bookId={id}
            userId={userId}
            libraryId={libraryId}
            borrowingEligibility={borrowingEligibility}
            deliveryAddresses={userAddresses}
          />
        </div>
      )}
      
      {/* If not signed in, show borrow button */}
      {!user && (
        <div className="mt-8">
          <button className="flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-2 px-6 rounded-md transition-colors">
            <span className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </span>
            Borrow Book
          </button>
        </div>
      )}
    </div>
    
    {/* Book cover section - kept as is */}
    <div className="relative flex flex-1 justify-center">
      <div className="relative">
        <BookCover
          variant="wide"
          classname="z-10"
          coverColor={coverColor}
          coverImage={coverUrl}
        />

        <div className="absolute left-16 top-10 rotate-12 opacity-40 max-sm:hidden">
          <BookCover
            variant="wide"
            coverColor={coverColor}
            coverImage={coverUrl}
          />
        </div>
        <BookInteractions bookId={id} userId={userId} size="sm" />
      </div>
    </div>
  </section>
)
};

export default BookOverview;
