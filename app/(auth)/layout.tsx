import { auth } from "@/auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

const layout = async ({ children }: { children: ReactNode }) => {

  // redirect to home if already logged in
  // this is a server component so we can use auth() directly
  // this will check if the user is logged in and redirect to home if they are
  const session = await auth()
  if(session){
    redirect("/")
  }
  return (
    <main className="auth.container relative flex flex-col-reverse text-white sm:flex-row">
      <section className="auth.form my-auto flex h-full min-h-screen flex-1 items-center bg-cover bg-top bg-gradient-to-br from-gray-900 via-blue-950 to-black px-5 py-10">
        <div className="auth-box bg-gray-700 px-4 py-4 rounded-3xl ml-10">
          <div className="flex flex-row gap-3">
            <Image src="/icons/logo.svg" alt="logo" width={37} height={37} />
            <h1 className="text-2xl font-semibold text-white">Bookwise</h1>
          </div>
          <div>{children}</div>
        </div>
      </section>

      <section className="auth-illustration sticky h-40 w-full sm:top-0 sm:h-screen sm:flex-1">
        <Image src ="/images/auth-illustration.png" alt="auth-illustration" height={1000} width={1000} className="size-full object-cover" />
      </section>
    </main>
  );
};

export default layout;
