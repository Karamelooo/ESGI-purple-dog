'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDeliveryPlatforms() {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    return await prisma.deliveryPlatform.findMany({
        orderBy: { name: 'asc' }
    });

}

// Replaces createDeliveryPlatform and toggleDeliveryPlatform partially
export async function upsertDeliveryPlatformConfig(slug: string, config: any, isActive: boolean) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    // Validate provider exists in constants? (Optional but good practice)

    try {
        const platform = await prisma.deliveryPlatform.upsert({
            where: { slug },
            update: {
                config,
                isActive,
            },
            create: {
                slug,
                name: slug, // This will be overwritten by UI display usually, or we can look it up from constants if we import them here.
                config,
                isActive
            }
        });
        revalidatePath('/admin/delivery');
        return { success: true, platform };
    } catch (error) {
        console.error("Error configuring delivery platform:", error);
        return { success: false, error: "Failed to save configuration." };
    }
}


export async function toggleDeliveryPlatform(id: number, isActive: boolean) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    try {
        const platform = await prisma.deliveryPlatform.update({
            where: { id },
            data: { isActive }
        });
        revalidatePath('/admin/delivery');
        return { success: true, platform };
    } catch (error) {
        console.error("Error toggling delivery platform:", error);
        return { success: false, error: "Failed to update platform." };
    }
}

export async function deleteDeliveryPlatform(id: number) {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.deliveryPlatform.delete({
            where: { id }
        });
        revalidatePath('/admin/delivery');
        return { success: true };
    } catch (error) {
        console.error("Error deleting delivery platform:", error);
        return { success: false, error: "Failed to delete platform." };
    }
}
