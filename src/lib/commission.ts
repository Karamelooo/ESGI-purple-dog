import prisma from "@/lib/prisma";

export async function getCommissionRate(categoryId: number, role: 'BUYER' | 'SELLER' = 'BUYER'): Promise<number> {
    const category = await prisma.category.findUnique({
        where: { id: categoryId }
    });

    // 1. Category Specific Rate
    if (role === 'BUYER' && category?.commissionRateBuyer != null) return category.commissionRateBuyer;
    if (role === 'SELLER' && category?.commissionRateSeller != null) return category.commissionRateSeller;

    // 2. Global Default
    const globalSettings = await prisma.globalSettings.findFirst();
    if (globalSettings) {
        if (role === 'BUYER') return globalSettings.commissionRateBuyer;
        if (role === 'SELLER') return globalSettings.commissionRateSeller;
    }

    // 3. Fallback to 0 if not configured
    return 0;
}
