import { auth, signOut } from "@/auth";
import BorrowBookList from "@/components/BorrowBookList";
import MyProfileForm from "@/components/MyProfileForm";
import { Button } from "@/components/ui/button";
import { db } from "@/db/drizzle";
import {
  books,
  borrowRecords,
  libraries,
  receipts,
  userProfiles,
  users,
} from "@/db/schema";
import { BorrowRecordType, User, UserProfile } from "@/types";
import { eq, inArray } from "drizzle-orm";
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
  const user = session?.user?.id;
  if (!user) {
    return <div>User not found</div>;
  }
  //get userProfile from db
  const profiles = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user))
    .limit(1);
  console.log("profile", profiles);

  const userDetails = await db
    .select()
    .from(users)
    .where(eq(users.id, user))
    .limit(1);

  console.log("userDetails", userDetails);

  // Get user borrowed books
  const userBorrowedBooks = await db
    .select({
      book: books,
      borrowRecord: borrowRecords,
      library: libraries,
    })
    .from(borrowRecords)
    .innerJoin(books, eq(borrowRecords.bookId, books.id))
    .innerJoin(libraries, eq(borrowRecords.libraryId, libraries.id))
    .where(eq(borrowRecords.userId, session?.user?.id));

  // Get receipts from db for user's borrowed books
  const userBorrowIds = userBorrowedBooks.map(item => item.borrowRecord.id);
  
  const userReceipts = await db
    .select()
    .from(receipts)
    .where(
      userBorrowIds.length > 0 
        ? inArray(receipts.borrowRecordId, userBorrowIds) 
        : undefined
    );
    
  console.log("User receipts:", userReceipts);

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-8">
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <Button variant="outline" className="text-black">
            Logout
          </Button>
        </form>
      </div>

      <div className="mb-10">
        <MyProfileForm
          profile={profiles as Partial<UserProfile>[]}
          userDetails={userDetails as unknown as Partial<User>[]}
        />
      </div>

      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold">Your Borrowed Books</h2>

        {userBorrowedBooks.length > 0 ? (
          <div className="space-y-4">
            {userBorrowedBooks.map((item) => {
              // Find corresponding receipt for this borrow record
              const receipt = userReceipts.find(
                receipt => receipt.borrowRecordId === item.borrowRecord.id
              );
              
              return (
                <BorrowBookList
                  key={item.borrowRecord.id}
                  book={item.book}
                  borrowRecord={item.borrowRecord as BorrowRecordType}
                  library={item.library}
                  receipt={receipt || null}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">
            You haven&apos;t borrowed any books yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Page;