'use server'

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleBlockUser(userId: number, isBlocked: boolean) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isBlocked }
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        return { error: "Failed to update user" };
    }
}

export async function updateUserRole(userId: number, role: 'USER' | 'PRO' | 'ADMIN') {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role }
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        return { error: "Failed to update role" };
    }
}

export async function revokeUserPlan(userId: number) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                planId: null,
                subscriptionStatus: 'canceled',
                subscriptionEndDate: new Date()
            }
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        return { error: "Failed to revoke plan" };
    }
}
