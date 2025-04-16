import React, { ReactNode } from "react";
import "../globals.css";
import Header from "@/components/Header";
const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <main  className="root-container flex min-h-screen flex-1 flex-col bg-gradient-to-br from-gray-900 via-blue-950 to-black bg-cover bg-top px-5 xs:px-10 md:px-16 text-white">

      <div className="mx-auto max-w-7xl">
        <Header/>
        <div className="mt-20 pb-20"> {children}</div>
      </div>
    </main>
  );
};

export default Layout;
