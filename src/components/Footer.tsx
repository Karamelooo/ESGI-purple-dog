import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 text-center text-sm mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex gap-6">
          <Link href="/legal" className="hover:text-white transition-colors">Mentions légales</Link>
          <Link href="/about" className="hover:text-white transition-colors">Qui sommes nous ?</Link>
        </div>
        <Link href="/contact">
          <Button variant="outline" className="border-gray-600 text-white bg-gray-800 hover:bg-gray-700 hover:text-white hover:border-white transition-all">
            Nous contacter
          </Button>
        </Link>
      </div>
    </footer>
  )
}
