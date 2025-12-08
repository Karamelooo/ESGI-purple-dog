import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { PostAdForm } from "@/components/post-ad-form";

export default async function PostAdPage() {
    const session = await auth();
    if (!session?.user) {
        redirect('/login');
    }

    const categories = await prisma.category.findMany();

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Déposer une annonce</h1>
            <PostAdForm categories={categories} />
        </div>
    );
}
