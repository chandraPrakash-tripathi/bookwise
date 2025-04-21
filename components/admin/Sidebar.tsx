"use client";
import { adminSideBarLinks } from "@/constants";
import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Session } from "next-auth";

const Sidebar = ({ session }: { session: Session }) => {
  const pathname = usePathname();
  return (
    <div className="admin-sidebar sticky left-0 top-0 flex h-dvh flex-col justify-between bg-gradient-to-b from-violet-100 via-indigo-100 to-sky-100 px-5 pb-5 pt-10 shadow-md">
      <div>
        <div className="logo flex flex-row items-center gap-2 border-b border-dashed pb-10 max-md:justify-center">
          <Image
            src="/icons/admin/logo.svg"
            alt="logo"
            height={37}
            width={37}
          />
          <h1 className="text-2xl font-bold">BookWise</h1>
        </div>
        <div className="mt-10 flex flex-col gap-5 ">
          {adminSideBarLinks.map((link) => {
            // const isSelected = false;
            // Update this isSelected from false to dynamic access of the link based on the click done

            const isSelected =
              (link.route !== "/admin" &&
                pathname.includes(link.route) &&
                link.route.length > 1) ||
              pathname === link.route;

            return (
              <Link href={link.route} key={link.route}>
                <div
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors duration-200",
                    isSelected && "bg-blue-400 shadow-sm"
                  )}
                >
                  <div className="relative size-5">
                    <Image
                      src={link.img}
                      alt={`${link.text}-icon`}
                      fill
                      className={cn(
                        "object-contain",
                        isSelected && "brightness-0 invert"
                      )}
                    />
                  </div>
                  <p className="text-black text-sm font-medium">{link.text}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-8 px-2 py-3 rounded-md bg-white/80 shadow-inner backdrop-blur-sm">
        <Avatar className="size-10">
          <AvatarFallback className="text-black bg-gray-300">
            {getInitials(session?.user?.name || "IN")}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col text-sm text-black max-md:hidden leading-tight">
          <p className="font-medium truncate">{session?.user?.name || "IN"}</p>
          <p className="text-xs text-gray-600 truncate">
            {session?.user?.email || "IN"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
