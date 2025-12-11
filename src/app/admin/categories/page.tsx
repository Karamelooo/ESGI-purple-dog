
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CategoryList from "@/components/admin/CategoryList";

export default async function AdminCategoriesPage() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    const categories = await prisma.category.findMany({
        include: { _count: { select: { ads: true } } },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Catégories</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CategoryList categories={categories} />
            </div>
        </div>
    );
}
