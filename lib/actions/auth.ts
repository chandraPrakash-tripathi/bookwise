"use server";

import { signIn } from "@/auth";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { ratelimit } from "../ratelimit";
import { redirect } from "next/navigation";
import { workflowClient } from "../workflow";
import config from "../config";
import { AuthCredentials } from "@/types";

//sign in with credentials
export const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">
) => {
  const { email, password } = params;

  //here we get the current ip address of the user
  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  //apply ratelimit to the ip address
  //this will limit the number of requests to 5 per minuUTE
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return redirect("/too-fast");
  }
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      return { success: false, error: result.error };
    }
    return { success: true };
  } catch (error) {
    console.log("Signin error", error);
    return { success: false, error: "Signin error" };
  }
};

//to insert a new user into the database
export const signUp = async (params: AuthCredentials) => {
  const { fullName, email, password, universityId, universityCard } = params;

  //here we get the current ip address of the user
  const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
  //apply ratelimit to the ip address
  //this will limit the number of requests to 5 per minute
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return redirect("/too-fast");
  }

  //check for existing user
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, error: "User already exists" };
  }

  //convert pwd to hash if the user doesnt already exists
  const hashedPassword = await hash(password, 10);

  try {
    //insert user into the database
    await db.insert(users).values({
      fullName,
      email,
      password: hashedPassword,
      universityId,
      universityCard,
    });

    //add workflowclient
    await workflowClient.trigger({
      url: `${config.env.prodApiEndpoint}/api/workflows/onboarding`,
      body: {
        email,
        fullName,
      },
    });

    await signInWithCredentials({ email, password });
    return { success: true };
  } catch (error) {
    console.log("Signup error", error);
    return { success: false, error: "Signup error" };
  }
};
