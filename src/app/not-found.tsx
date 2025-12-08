import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <h1 className="text-9xl font-extrabold text-purple-900 mb-4">404</h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Oups ! Cette page n'existe pas.</h2>
            <p className="text-lg text-gray-500 max-w-md mb-8">
                L'objet que vous recherchez a peut-être été vendu, ou la page a été déplacée vers une nouvelle collection.
            </p>
            <Link href="/">
                <Button size="lg" className="bg-purple-700 hover:bg-purple-800">
                    Retour à l'accueil
                </Button>
            </Link>
        </div>
    )
}
