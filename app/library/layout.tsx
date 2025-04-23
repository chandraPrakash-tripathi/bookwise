import { auth } from '@/auth';
import Header from '@/components/library/HeaderLib';
import Sidebar from '@/components/library/SidebarLib'
import { redirect } from 'next/navigation';
import React, { ReactNode } from 'react'

const Layout = async({ children }: { children: ReactNode }) => {

    const session = await auth();
      if (!session?.user?.id) {
        redirect("/sign-in");
      }
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar session={session}/>

      <div className="flex-1 flex flex-col">
        <Header session={session} />

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}



export default Layout
