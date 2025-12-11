import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/NotificationBell";

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


    const isProOrAdmin = session.user.role === 'PRO' || session.user.role === 'ADMIN';

    
    const basePath = `/dashboard/${isPro ? 'pro' : 'user'}`;
    
    const feedbackLink = isPro ? null : (
        <Link href={`${basePath}/feedback`}> 
            <Button variant="ghost" className="w-full justify-start text-blue-600 hover:text-blue-700 font-semibold">
                ⭐️ Donner mon avis
            </Button>
        </Link>
    );

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-64 shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                    
                    <div className="mb-6 flex items-start justify-between"> 
                        <div className="flex flex-col">
                           
                            <h2 className="font-bold text-lg mb-0">{session.user.name}</h2> 
                            <p className="text-sm text-gray-500">{isPro ? 'Compte professionnel' : 'Compte particulier'}</p>
                        </div>
                        <div className="flex-shrink-0 pt-0.5"> 
                            <NotificationBell />
                        </div>
                    </div>

                    <nav className="flex flex-col gap-2">
                        {/* Vue d'ensemble */}
                        <Link href={basePath}>
                            <Button variant="ghost" className="w-full justify-start font-bold">
                                Vue d'ensemble
                            </Button>
                        </Link>
                        
                        {/* Mes annonces */}
                        <Link href={`${basePath}/ads`}>
                            <Button variant="ghost" className="w-full justify-start">
                                Mes annonces
                            </Button>
                        </Link>
                        
                        {/* Mes achats / enchères */}
                        {/* Mes achats / enchères (Affiché seulement si PRO ou ADMIN) */}
{isProOrAdmin && (
    <Link href={`${basePath}/bi`}>
        <Button variant="ghost" className="w-full justify-start">
            Mes achats et enchères
        </Button>
    </Link>
)}
                        
                        <Link href={`${basePath}/profile`}> 
                            <Button variant="ghost" className="w-full justify-start text-indigo-600 hover:text-indigo-700">
                                Mon profil et sécurité
                            </Button>
                        </Link>
                        
                        {/* ⭐️ LIEN FEEDBACK RÉTATABLI ICI ⭐️ */}
                        {feedbackLink} 
                        {/* ------------------------------------------- */}


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