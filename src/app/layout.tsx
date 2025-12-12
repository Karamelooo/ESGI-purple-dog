import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { SignInButton, SignOutButton } from '@/components/auth-buttons';
import { Toaster } from 'sonner';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: "Purple Dog",
  description: "Plateforme de vente d'objets de valeur",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="fr">
      <body className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 h-[72px] flex items-center shadow-sm">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-extrabold text-purple-700 tracking-tighter"
            >
              <Image
                src="/PurpleDog.svg"
                alt="Purple Dog"
                width={100}
                height={40}
                className="h-15 w-auto"
              />
            </Link>

            <nav className="flex items-center gap-4">
              {session?.user ? (
                <div className="flex items-center gap-4">
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="text-red-500 font-bold hover:text-red-700"
                    >
                      Admin
                    </Link>
                  )}
                  {session.user.role === "PRO" && (
                    <Link
                      href="/dashboard/pro"
                      className="font-bold hover:text-primary"
                    >
                      Espace professionnel
                    </Link>
                  )}
                  {session.user.role === "USER" && (
                    <Link
                      href="/dashboard/user"
                      className="font-bold hover:text-primary"
                    >
                      Mon espace
                    </Link>
                  )}
                  <Link
                    href="/dashboard/purchases"
                    className="text-sm font-semibold hover:text-purple-700"
                  >
                    Mes achats
                  </Link>
                  <Link
                    href="/dashboard/purchases?tab=reservations"
                    className="text-sm font-semibold hover:text-purple-700"
                  >
                    Panier
                  </Link>
                  <span className="text-sm text-gray-400 hidden sm:inline">
                    |
                  </span>
                  <span className="text-sm font-semibold hidden sm:inline">
                    {session.user.name || session.user.email}
                  </span>
                  <SignOutButton />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 font-bold text-gray-700 hover:text-primary"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-800 transition-colors"
                  >
                    S&apos;inscrire
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </header>
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
