import React, { ReactNode } from "react";
import "../globals.css";
import Header from "@/components/Header";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
const Layout = async ({ children }: { children: ReactNode }) => {

  const session = await auth()
    if(!session){
      redirect("/sign-in")
    }
  return (
    <main  className="root-container flex min-h-screen flex-1 flex-col bg-gradient-to-br from-gray-900 via-blue-950 to-black bg-cover bg-top px-5 xs:px-10 md:px-16 text-white">

      <div className="mx-auto max-w-7xl">
        <Header session  ={session}/>
        <div className="mt-20 pb-20"> {children}</div>
      </div>
    </main>
  );
};

export default Layout;
