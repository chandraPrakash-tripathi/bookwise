import { Session } from "next-auth";
import React from "react";

const Header = ({ session }: { session: Session }) => {
  return (
    <header className="admin-header flex lg:items-end items-start justify-between lg:flex-row flex-col gap-5 sm:mb-10 mb-5">
      <div>
        <h2 className="text-2xl font-semibold text-black">
          {session?.user?.name}
        </h2>
        <p className="text-base text-slate-500">
          Monitor all of yours users and books here
        </p>
      </div>
      <p>Search</p>
    </header>
  );
};

export default Header;
