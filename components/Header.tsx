
'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { cn} from "@/lib/utils";
import Image from "next/image";

const Header = () => {
    const pathname = usePathname();

  return (
    <header className="my-10 flex justify-between gap-5">
      <Link
        href="/"
        className="text-2xl font-bold text-dark-100 dark:text-light-100"
      >
        <Image src='/icons/logo.svg' alt="logo" width={40} height={40} />
      </Link>

      <ul className="flex flex-row items-center gap-8">
        <li>
          <Link href="/" className={cn( "text-dark-100 dark:text-light-100", pathname === "/library" ? "text-light-200" : "text-light-100")}> 
            Library
          </Link>
        </li>
      </ul>
    </header>
  );
};

export default Header;
