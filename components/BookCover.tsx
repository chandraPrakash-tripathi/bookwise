import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import BookCoverSvg from "./BookCoverSvg";

type BookCoverVariant = "extrasmall" | "small" | "medium" | "regular" | "wide";

const variantStyles: Record<BookCoverVariant, string> = {
    extrasmall: "w-[28.95px] h-10",
    small: "book-cover_small  w-[55px] h-[76px]",
    medium: "book-cover_medium w-[144px] h-[199px]",
    regular: "book-cover_regular xs:w-[174px] w-[114px] xs:h-[239px] h-[169px]",
    wide: "book-cover_wide xs:w-[296px] w-[256px] xs:h-[404px] h-[354px]",
  };

interface Props {
  coverColor: string;
  coverImage: string;
  classname?: string;
  variant?: BookCoverVariant;
}

const BookCover = ({
  coverColor = "#012B48",
  coverImage = "https://placehold.co/400x600.png",
  classname,
  variant = "regular",
}:Props) => {
  return (
    <div className={cn('relative transition-all duration-300', variantStyles[variant], classname)}>
      <BookCoverSvg coverColor={coverColor} />
      <div
        className="absolute z-10"
        style={{ left: "12%", width: "87.5%", height: "88%" }}
      >
        <Image
          src={coverImage}
          alt="Book Cover"
          fill
          className="rounded-sm object-fill"
        />
      </div>
    </div>
  );
};

export default BookCover;
