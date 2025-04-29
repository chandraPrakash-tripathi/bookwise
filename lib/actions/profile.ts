"use server";

import { db } from "@/db/drizzle";
import { users, userProfiles, deliveryAddresses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { UpdateProfileInput } from "@/types";

/**
 * Updates a user's profile information and delivery address
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
      await db.update(users).set(userUpdateData).where(eq(users.id, userId));
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

    // Handle delivery address if provided
    if (formData.deliveryAddress) {
      const {
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode,
        country,
        isDefault,
      } = formData.deliveryAddress;

      // If this is set as default, unset any existing default addresses
      if (isDefault) {
        await db
          .update(deliveryAddresses)
          .set({ isDefault: false })
          .where(eq(deliveryAddresses.userId, userId));
      }

      // Check if address with this ID exists (for update)
      if (formData.deliveryAddress.id) {
        // Update existing address
        await db
          .update(deliveryAddresses)
          .set({
            fullName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            zipCode,
            country,
            isDefault: isDefault || false,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(deliveryAddresses.id, formData.deliveryAddress.id),
              eq(deliveryAddresses.userId, userId)
            )
          );
      } else {
        // Create new address
        await db.insert(deliveryAddresses).values({
          userId,
          fullName,
          phone,
          addressLine1,
          addressLine2,
          city,
          state,
          zipCode,
          country,
          isDefault: isDefault || false,
        });
      }
    }

    // Revalidate the profile page to reflect changes
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Fetch user's delivery addresses
 */
export async function getUserDeliveryAddresses() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated", addresses: [] };
    }

    const addresses = await db
      .select()
      .from(deliveryAddresses)
      .where(eq(deliveryAddresses.userId, session.user.id))
      .orderBy(deliveryAddresses.isDefault);

    return { success: true, addresses };
  } catch (error) {
    console.error("Failed to fetch delivery addresses:", error);
    return {
      success: false,
      error: "Failed to fetch addresses",
      addresses: [],
    };
  }
}

/**
 * Delete a delivery address
 */
export async function deleteDeliveryAddress(addressId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    // Only allow deletion if the address belongs to the user
    await db
      .delete(deliveryAddresses)
      .where(
        and(
          eq(deliveryAddresses.id, addressId),
          eq(deliveryAddresses.userId, session.user.id)
        )
      );

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete address:", error);
    return { success: false, error: "Failed to delete address" };
  }
}
