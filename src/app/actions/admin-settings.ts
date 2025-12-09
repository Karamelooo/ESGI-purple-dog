'use server'

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- Global Settings ---
export async function updateGlobalSettings(commissionBuyer: number, commissionSeller: number) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        // Upsert ensures we have only one settings row (id: 1)
        await prisma.globalSettings.upsert({
            where: { id: 1 },
            update: {
                commissionRateBuyer: commissionBuyer,
                commissionRateSeller: commissionSeller
            },
            create: {
                id: 1,
                commissionRateBuyer: commissionBuyer,
                commissionRateSeller: commissionSeller
            }
        });
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        return { error: "Failed to update settings" };
    }
}

// --- Categories ---
export async function createCategory(name: string, slug: string, commBuyer?: number, commSeller?: number) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        await prisma.category.create({
            data: {
                name,
                slug,
                commissionRateBuyer: commBuyer,
                commissionRateSeller: commSeller
            }
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to create category" };
    }
}

export async function updateCategory(id: number, name: string, slug: string, commBuyer?: number, commSeller?: number) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        await prisma.category.update({
            where: { id },
            data: {
                name,
                slug,
                commissionRateBuyer: commBuyer,
                commissionRateSeller: commSeller
            }
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { error: "Failed to update category" };
    }
}

export async function deleteCategory(id: number) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        await prisma.category.delete({
            where: { id }
        });
        revalidatePath('/admin/categories');
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete category" };
    }
}
