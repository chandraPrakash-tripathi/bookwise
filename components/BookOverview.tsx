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
        <h1>{title}</h1>
        <div className="book-info mt-7 flex flex-row flex-wrap gap-4 text-xl text-light-100">
          <p>
            By <span>{author}</span>
          </p>
          <p>
            Category{" "}
            <span className="font-semibold text-light-200">{genre}</span>
          </p>

          <p>
            Library <span>{library?.name}</span>
          </p>

          <div className="flex flex-row gap-1">
            <Image src="/icons/star.svg" alt="star" width={20} height={20} />
            <p>
              Rating <span>{rating}</span>
            </p>
          </div>
          <div className="book-copies text-xl text-light-100">
            <p>
              Total Books <span>{totalCopies}</span>
            </p>

            <p>
              Available Books <span>{availableCopies}</span>
            </p>
            <p>Book No. {isbn}</p>
          </div>

          {publisher && (
            <p>
              Publisher <span>{publisher}</span>
            </p>
          )}

          {publicationYear && (
            <p>
              Publication Year <span>{publicationYear}</span>
            </p>
          )}

          <p className="book-description mt-2 text-justify text-xl text-light-100">
            {description}
          </p>

          {user && (
            <BookBorrow
              bookId={id}
              userId={userId}
              libraryId={libraryId}
              borrowingEligibility={borrowingEligibility}
              deliveryAddresses={userAddresses}
            />
          )}
        </div>
      </div>
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
  );
};

export default BookOverview;
