"use server";

import { db } from "@/db/drizzle";
import { users, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { UpdateProfileInput } from "@/types";

/**
 * Updates a user's profile information
 */
export async function updateUserProfile(formData: UpdateProfileInput) {
  try {
    // Get the current session to identify the user
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = session.user.id;

    // Update user data (bio and profile picture if provided)
    const userUpdateData: Partial<typeof users.$inferInsert> = {};
    
    if (formData.bio !== undefined) {
      userUpdateData.bio = formData.bio;
    }
    
    if (formData.profilePicture) {
      userUpdateData.profilePicture = formData.profilePicture;
    }

    // Only update user table if there's something to update
    if (Object.keys(userUpdateData).length > 0) {
      await db
        .update(users)
        .set(userUpdateData)
        .where(eq(users.id, userId));
    }

    // Check if user profile exists
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    // Prepare profile update data
    const profileData: Partial<typeof userProfiles.$inferInsert> = {
      favoriteGenres: formData.favoriteGenres || [],
      favoriteAuthors: formData.favoriteAuthors || [],
      readingGoal: formData.readingGoal || 0,
      updatedAt: new Date(),
    };

    // If profile exists, update it; otherwise create a new one
    if (existingProfile.length > 0) {
      await db
        .update(userProfiles)
        .set(profileData)
        .where(eq(userProfiles.userId, userId));
    } else {
      await db.insert(userProfiles).values({
        userId,
        ...profileData,
      });
    }

    // Revalidate the profile page to reflect changes
    revalidatePath("/my-profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}