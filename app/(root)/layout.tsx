import React, { ReactNode } from "react";
import "../globals.css";
import Header from "@/components/Header";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  if (!session) {
    redirect("/sign-in");
  }
  if (!session.user || !session.user.id) {
    redirect("/sign-in");
  }

  // Now TypeScript knows userId is a string
  const userId = session.user.id;

  //get the single user and see if the lasta ctivity date is today
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user[0].lastActivityDate === new Date().toISOString().slice(0, 10))
    return;

  after(async () => {
    if (!session?.user?.id) return;
    await db
      .update(users)
      .set({ lastActivityDate: new Date().toString().slice(0, 10) })
      .where(eq(users.id, session?.user?.id));
  });

  return (
    <main className="root-container flex min-h-screen flex-1 flex-col bg-gradient-to-br from-gray-900 via-blue-950 to-black bg-cover bg-top px-5 xs:px-10 md:px-16 text-white">
      <div className="mx-auto max-w-7xl">
        <Header session={session} />
        <div className="mt-20 pb-20"> {children}</div>
      </div>
    </main>
  );
};

export default Layout;
