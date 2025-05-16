import React, { ReactNode } from "react";
import "../globals.css";
import Header from "@/components/Header";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Create a new BackgroundEffect component
const BackgroundEffect = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated gradient background - darker theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950/80 via-blue-950/70 to-indigo-950/80 animate-gradient-slow"></div>
      
      {/* Animated stars/particles - increased quantity */}
      <div className="stars-container">
        {Array.from({ length: 80 }).map((_, i) => (
          <div 
            key={i}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          />
        ))}
      </div>
      
      {/* Subtle glow effects - darker */}
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-900/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-indigo-900/5 rounded-full blur-3xl"></div>
    </div>
  );
};

const Layout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  if (!session) {
    redirect("/sign-in");
  }
  if (!session.user || !session.user.id) {
    redirect("/sign-in");
  }

  // Now TypeScript knows userId is a string
  after(async () => {
    if (!session?.user?.id) return;

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session?.user?.id))
      .limit(1);

    if (user[0].lastActivityDate === new Date().toISOString().slice(0, 10)) return;

    await db
      .update(users)
      .set({ lastActivityDate: new Date().toISOString().slice(0, 10) })
      .where(eq(users.id, session?.user?.id));
  });

  return (
    <main className="root-container flex min-h-screen flex-1 flex-col bg-gradient-to-br from-gray-900 via-blue-950 to-black bg-cover bg-top px-5 xs:px-10 md:px-16 text-white relative overflow-hidden">
      {/* Add the background effect */}
      <BackgroundEffect />
      
      <div className="w-full max-w-full relative z-10">
        <Header session={session} />
        <div className="mt-20 pb-20 w-full">{children}</div>
      </div>
    </main>
  );
};

export default Layout;