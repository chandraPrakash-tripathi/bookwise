import { auth, signOut } from "@/auth";
import BorrowBookList from "@/components/BorrowBookList";
import MyProfileForm from "@/components/MyProfileForm";
import { Button } from "@/components/ui/button";
import { db } from "@/db/drizzle";
import { books, borrowRecords, libraries } from "@/db/schema";
import { BorrowRecordType } from "@/types";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
  const session = await auth();
  if (!session) {
    redirect("/sign-in");
  }
  if (!session.user || !session.user.id) {
    redirect("/sign-in");
  }

  // const user = await db
  //   .select()
  //   .from(users)
  //   .where(eq(users.id, session?.user?.id))
  //   .limit(1);

  // Get user borrowed books
  const userBorrowedBooks = await db
    .select({
      book: books,
      borrowRecord: borrowRecords,
      library: libraries
    })
    .from(borrowRecords)
    .innerJoin(books, eq(borrowRecords.bookId, books.id))
    .innerJoin(libraries, eq(borrowRecords.libraryId, libraries.id))
    .where(eq(borrowRecords.userId, session?.user?.id));

  return (
    <div className="mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <Button variant="outline" className="text-black">Logout</Button>
        </form>
      </div>
      
      <div className="mb-10">
        <MyProfileForm />
      </div>
      
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold">Your Borrowed Books</h2>
        
        {userBorrowedBooks.length > 0 ? (
          <div className="space-y-4">
            {userBorrowedBooks.map((item) => (
              <BorrowBookList
                key={item.borrowRecord.id}
                book={item.book}
                borrowRecord={item.borrowRecord as BorrowRecordType}
                library={item.library}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven&apos;t borrowed any books yet.</p>
        )}
      </div>
    </div>
  );
};

export default Page;