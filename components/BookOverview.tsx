import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import BookCover from "./BookCover";

const BookOverview = ({
  title,
  author,
  genre,
  rating,
  total_copies,
  available_copies,
  description,
  color,
  cover,
}: Book) => {
  return (
    <section className="book-overview flex flex-col-reverse items-center gap-12 sm:gap-32 xl:flex-row xl:gap-8">
      <div className="flex flex-1 flex-col gap-5">
        <h1>{title}</h1>
        <div className="book-info  mt-7 flex flex-row flex-wrap gap-4 text-xl text-light-100">
          <p>
            By <span>{author}</span>
          </p>
          <p>
            Category <span className="font-semibold text-light-200">{genre}</span>
          </p>

          <div className="flex  flex-row gap-1">
            <Image src="/icons/star.svg" alt="star" width={20} height={20} />
            <p>
              Rating <span>{rating}</span>
            </p>
          </div>
          <div className="book-copies text-xl text-light-100">
          <p>
            Total Books <span>{total_copies}</span>
          </p>

          <p>
            Available Books <span>{available_copies}</span>
          </p>
        </div>
          <p className="book-description mt-2 text-justify text-xl text-light-100">
             {description}
          </p>

          <Button className="bg-yellow-200">
            <Image src="/icons/book.svg" alt="book" width={22} height={22} />
            <p className="font-bebas-neue text-xl text-black ">Borrow</p>
          </Button>
        </div>
        <div className="relative flex flex-1 justify-center">
          <div className="relative">
          <BookCover
            variant="wide"
            classname="z-10"
            coverColor={color}
            coverImage={cover}
          />

            <div className="absolute left-16 top-10 rotate-12 opacity-40 max-sm:hidden">
              <BookCover variant="wide" coverColor={color} coverImage={cover} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookOverview;
