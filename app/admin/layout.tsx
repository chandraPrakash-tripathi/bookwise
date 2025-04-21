import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";
import "../globals.css";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const isAdmin = await db
    .select({ isAdmin: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)
    .then((res) => res[0]?.isAdmin === "ADMIN");

  if (!isAdmin) redirect("/");
  return (
    <main className="flex min-h-screen w-full flex-row">
      <Sidebar session={session} />
      <div className="admin-container flex w-[calc(100%-264px)] flex-1 flex-col bg-gradient-to-br from-purple-200 via-indigo-300 to-blue-200 p-5 xs:p-10 shadow-xl border border-white/20 backdrop-blur-md bg-opacity-60">
        <Header session={session} />
        {children}
      </div>
    </main>
  );
};

export default Layout;
