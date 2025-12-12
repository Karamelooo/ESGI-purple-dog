import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { EditAdForm } from "@/components/edit-ad-form";

export default async function EditAdPage({ params }: { params: { id: string } }) {
    const { id } = await params; // Next.js 15 params are async
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    const adId = parseInt(id);
    if (isNaN(adId)) return notFound();

    const ad = await prisma.ad.findUnique({
        where: { id: adId },
    });

    if (!ad) return notFound();

    // Ownership check
    if (ad.userId !== Number(session.user.id)) {
        redirect('/dashboard/ads'); // Or validation error
    }

    // Restrictions
    if (ad.status === 'SOLD' || ad.type === 'AUCTION') {
        redirect('/dashboard/ads');
    }

    const categories = await prisma.category.findMany();

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">
                Modifier l'annonce
            </h1>
            <EditAdForm categories={categories} ad={ad} />
        </div>
    );
}
