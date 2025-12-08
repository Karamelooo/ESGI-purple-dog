import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const isPro = session.user.role === 'PRO';

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-64 shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                    <div className="mb-6">
                        <h2 className="font-bold text-lg mb-1">{session.user.name}</h2>
                        <p className="text-sm text-gray-500">{isPro ? 'Compte Professionnel' : 'Compte Particulier'}</p>
                    </div>

                    <nav className="flex flex-col gap-2">
                        <Link href={isPro ? "/dashboard/pro" : "/dashboard/user"}>
                            <Button variant="ghost" className="w-full justify-start font-bold">
                                Vue d'ensemble
                            </Button>
                        </Link>
                        <Link href={`/dashboard/${isPro ? 'pro' : 'user'}/ads`}>
                            <Button variant="ghost" className="w-full justify-start">
                                Mes Annonces
                            </Button>
                        </Link>
                        <Link href={`/dashboard/${isPro ? 'pro' : 'user'}/bi`}>
                            <Button variant="ghost" className="w-full justify-start">
                                {isPro ? 'Mes Achats & Enchères' : 'Mes Achats'}
                            </Button>
                        </Link>
                        <Link href="/deposer-une-annonce">
                            <Button className="w-full mt-4 bg-purple-700 hover:bg-purple-800 text-white font-bold">
                                + Déposer une annonce
                            </Button>
                        </Link>
                    </nav>
                </div>
            </aside>
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
