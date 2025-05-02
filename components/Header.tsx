"use client";
import Link from "next/link";
import React from "react";
import {  getInitials } from "@/lib/utils";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Session } from "next-auth";
import NearbyLibrariesButton from "./NearbyLibrariesButton";

const Header = ({session}: {session: Session}) => {

  return (
    <header className="my-10 flex justify-between gap-5">
      <Link
        href="/"
        className="text-2xl font-bold text-dark-100 dark:text-light-100"
      >
        <Image src="/icons/logo.svg" alt="logo" width={40} height={40} />
        BOOKWISE
      </Link>

      <ul className="flex flex-row items-center gap-8">
        <li>
          
            <NearbyLibrariesButton/>
        </li>
        <li>
          
          <Link href="/my-profile">
            <Avatar>
              <AvatarFallback className="text-black bg-gray-300">{getInitials(session?.user?.name || 'IN')}</AvatarFallback>
            </Avatar>
          </Link>
        </li>
      </ul>
    </header>
  );
};

export default Header;
