import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db/drizzle";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import {compare} from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  //manage sesion using jwt
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.select().from(users).where(eq(users.email, credentials.email.toString())).limit(1)
        if(user.length === 0) {
          return null;
        }
        const isPasswordValid = await compare(credentials.password.toString(), user[0].password)
        if (!isPasswordValid) {
          return null;
        }
        return{
            id:user[0].id.toString(),
            name:user[0].fullName,
            email:user[0].email,
        } as User 
      },
    }),
  ],

  pages:{
    signIn: "/signin",
  },

  callbacks:{
    async jwt({token , user}) {
        if(user) {
            token.id = user.id
            token.name = user.name
        }
        return token
    },
    //session function
    async session({session, token}) {
        if(session.user){
            session.user.id = token.id as string
            session.user.name = token.name as string
        }
        return session
    }


  }
});
