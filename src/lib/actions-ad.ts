'use server'

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { estimatePrice } from "./ai";
import { z } from "zod";

const AdSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    categoryId: z.coerce.number(),
    price: z.coerce.number().min(1),
    type: z.enum(['SALE', 'AUCTION']),
    weight: z.coerce.number().optional(),
    dimensions: z.string().optional(),
    // Auction specific
    minPrice: z.coerce.number().optional(),
    endDate: z.string().optional(),
    // Media
    images: z.string().optional(),
});

export async function createAd(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user) return { message: "Non autorisé" };

    const data = Object.fromEntries(formData);
    const parsed = AdSchema.safeParse(data);

    if (!parsed.success) {
        return { message: "Données invalides: " + JSON.stringify(parsed.error.flatten()) };
    }

    const { title, description, categoryId, price, type, weight, dimensions, minPrice, endDate, images } = parsed.data;

    // Parse images (URLs separated by comma or newline)
    const imageUrls = (images || '')
        .split(/[\n,]/)
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

    // AI Content Check (Mock or Real)
    // const isSafe = await checkContentSafety(title, description);

    // Calculate End Date for Auction (mock: 7 days default if not provided)
    let finalEndDate = null;
    if (type === 'AUCTION') {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        finalEndDate = d;
    }

    // Extract custom attributes
    const customAttributes: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
        if (key.startsWith('custom_')) {
            const label = key.replace('custom_', '');
            customAttributes[label] = value;
        }
    }

    try {
        await prisma.ad.create({
            data: {
                title,
                description,
                price, // For Sale: Fixed Price. For Auction: Starting Price
                type,
                status: 'ACTIVE', // Should be PENDING in real app for validation
                categoryId,
                userId: Number(session.user.id),
                weight,
                dimensions,
                reservePrice: minPrice,
                endDate: finalEndDate,
                startDate: new Date(),
                customAttributes,
                images: imageUrls,
                documents: [],
            }
        });
    } catch (e) {
        console.error(e);
        return { message: "Erreur lors de la création." };
    }

    redirect(session.user.role === 'PRO' ? '/dashboard/pro' : '/dashboard/user');
}

export async function getPriceEstimate(title: string, description: string) {
    const estimate = await estimatePrice(title, description);
    return estimate || "Impossible d'estimer.";
}
