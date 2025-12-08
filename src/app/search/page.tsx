import Link from 'next/link'
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation"

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
    // Await searchParams for Next.js 15+ compatibility
    const params = await searchParams;
    const query = params.q || "";

    // If explicit search action (form submission usually does GET ?q=...)
    async function searchAction(formData: FormData) {
        "use server"
        const q = formData.get("q");
        redirect(`/search?q=${encodeURIComponent(q as string)}`);
    }

    const ads = query ? await prisma.ad.findMany({
        where: {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { category: { name: { contains: query, mode: 'insensitive' } } }
            ],
            status: 'ACTIVE'
        },
        include: { user: true, category: true }
    }) : [];

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Recherche</h1>

            {/* Search Bar */}
            <form action={searchAction} className="flex gap-4 max-w-2xl mb-12">
                <Input
                    name="q"
                    placeholder="Rechercher un objet, une catégorie..."
                    defaultValue={query}
                    className="h-12 text-lg bg-white"
                />
                <Button type="submit" size="lg" className="h-12 px-8">Rechercher</Button>
            </form>

            {/* Results */}
            {query && (
                <div className="mb-8">
                    <h2 className="text-xl text-gray-600 mb-6">
                        {ads.length} résultat(s) pour "<span className="font-bold text-gray-900">{query}</span>"
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {ads.map((ad) => (
                            <Link key={ad.id} href={`/ad/${ad.id}`} className="group block">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="aspect-square bg-gray-100 relative">
                                        <img
                                            src={`https://placehold.co/400x400?text=${encodeURIComponent(ad.title)}`}
                                            alt={ad.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold uppercase">
                                            {ad.type === 'AUCTION' ? 'Enchère' : 'Vente'}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="text-xs text-purple-600 font-bold mb-1">{ad.category.name}</div>
                                        <h3 className="font-bold text-gray-900 truncate mb-2">{ad.title}</h3>
                                        <div className="flex justify-between items-end">
                                            <span className="text-lg font-bold text-gray-900">{ad.price ?? 0} €</span>
                                            <span className="text-xs text-gray-500">{new Date(ad.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {ads.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-xl">
                            <p className="text-gray-500 text-lg">Aucun résultat trouvé. Essayez d'autres mots-clés.</p>
                        </div>
                    )}
                </div>
            )}

            {!query && (
                <div className="text-center py-20 text-gray-400">
                    Commencez par taper une recherche ci-dessus.
                </div>
            )}
        </div>
    )
}
