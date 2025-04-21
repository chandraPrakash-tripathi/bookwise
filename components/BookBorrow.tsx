"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { borrowBook } from "@/lib/actions/book";

interface Props {
  userId: string;
  bookId: string;
  borrowingEligibility: {
    isEligible: boolean;
    message: string;
  };
}

const BookBorrow = ({
  userId,
  bookId,
  borrowingEligibility: { isEligible, message },
}: Props) => {
  const router = useRouter();
  const [borrowing, setBorrowing] = useState(false);

  const handleBorrow = async () => {
    if (!isEligible) {
      toast.error(message);
    }
    setBorrowing(true);
    try {
        //serevr action called
      const result = await borrowBook({ userId, bookId });
      if (result.success) {
        toast.success("Book borrowed successfully");
        router.push("/");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setBorrowing(false);
    }
  };
  return (
    <div>
      <Button className="bg-yellow-200" onClick={handleBorrow} disabled={borrowing}>
        <Image src="/icons/book.svg" alt="book" width={22} height={22} />
        {borrowing ? "Borrowing ..." : "Borrow Book"}
      </Button>
    </div>
  );
};

export default BookBorrow;
