"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma"; // Assuming this is where prisma client is exported
import { revalidatePath } from "next/cache";

export async function toggleFavorite(adId: number) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const userId = parseInt(session.user.id);
    const advertisementId = Number(adId);

    if (isNaN(advertisementId)) {
      throw new Error("Invalid Ad ID");
    }

    // Verify User exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error("User not found");
    }

    // Verify Ad exists
    const ad = await prisma.ad.findUnique({ where: { id: advertisementId } });
    if (!ad) {
        throw new Error("Ad not found");
    }

    // Check if already favorited
    const existingFavorite = await prisma.user.findFirst({
      where: {
        id: userId,
        favorites: {
          some: {
            id: advertisementId,
          },
        },
      },
    });

    if (existingFavorite) {
      // Unfavorite
      await prisma.user.update({
        where: { id: userId },
        data: {
          favorites: {
            disconnect: { id: advertisementId },
          },
        },
      });
    } else {
      // Favorite
      await prisma.user.update({
        where: { id: userId },
        data: {
          favorites: {
            connect: { id: advertisementId },
          },
        },
      });
    }
    
    revalidatePath("/dashboard/favorites");
    revalidatePath("/dashboard/pro/market"); 
    revalidatePath(`/ad/${advertisementId}`);
    
    return !existingFavorite;
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw new Error("Failed to toggle favorite");
  }
}
