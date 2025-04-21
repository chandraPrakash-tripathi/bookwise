import Image from "next/image";
import React from "react";
import BookCover from "./BookCover";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import BookBorrow from "./BookBorrow";

interface Props extends Book {
  userId: string;
}

const BookOverview = async ({
  title,
  author,
  genre,
  rating,
  totalCopies,
  availableCopies,
  description,
  coverColor,
  coverUrl,
  userId,
  id,
}: Props) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);



    const borrowingEligibility = {
      isEligible: availableCopies>0 && user?.status=== "APPROVED",
      message: availableCopies>0 ? "Book is not available" : "You are not eligible to borrow books",

    }
    
  return (
    <section className="flex flex-col-reverse items-center gap-12 sm:gap-32 xl:flex-row xl:gap-8 ">
      <div className="flex flex-1 flex-col gap-5">
        <h1>{title}</h1>
        <div className="book-info  mt-7 flex flex-row flex-wrap gap-4 text-xl text-light-100">
          <p>
            By <span>{author}</span>
          </p>
          <p>
            Category{" "}
            <span className="font-semibold text-light-200">{genre}</span>
          </p>

          <div className="flex  flex-row gap-1">
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
          </div>
          <p className="book-description mt-2 text-justify text-xl text-light-100">
            {description}
          </p>

          {user && (
          <BookBorrow
            bookId={id}
            userId={userId}
            borrowingEligibility={borrowingEligibility}
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
        </div>
      </div>
    </section>
  );
};

export default BookOverview;
