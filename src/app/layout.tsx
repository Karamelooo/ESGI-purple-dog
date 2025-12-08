import type { Metadata } from 'next'
import './globals.css'
import { auth } from "@/auth";
import { SignInButton, SignOutButton } from '@/components/auth-buttons';

export const metadata: Metadata = {
  title: 'Purple Dog',
  description: 'Plateforme de vente d\'objets de valeur',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();
  return (
    <html lang="fr">
      <body>
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 h-[72px] flex items-center shadow-sm">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <a href="/" className="text-2xl font-extrabold text-purple-700 tracking-tighter">Purple Dog</a>

            <nav className="flex items-center gap-4">
              {session?.user ? (
                <div className="flex items-center gap-4">
                  {session.user.role === 'ADMIN' && (
                    <a href="/admin" className="text-red-500 font-bold hover:text-red-700">Admin</a>
                  )}
                  {session.user.role === 'PRO' && (
                    <a href="/dashboard/pro" className="font-bold hover:text-primary">Espace Pro</a>
                  )}
                  {session.user.role === 'USER' && (
                    <a href="/dashboard/user" className="font-bold hover:text-primary">Mon Espace</a>
                  )}
                  <span className="text-sm font-semibold hidden sm:inline">{session.user.name || session.user.email}</span>
                  <SignOutButton />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <a href="/login" className="px-4 py-2 font-bold text-gray-700 hover:text-primary">Se connecter</a>
                  <a href="/register" className="px-4 py-2 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-800 transition-colors">
                    S&apos;inscrire
                  </a>
                </div>
              )}
            </nav>
          </div>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
