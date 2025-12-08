export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-6 text-purple-900">Qui sommes-nous ?</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Purple Dog redéfinit l'expérience de vente d'objets d'exception en alliant expertise humaine et intelligence artificielle.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                <div className="order-2 md:order-1">
                    <h2 className="text-3xl font-bold mb-4">Notre Mission</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Nous avons créé Purple Dog avec une conviction simple : vendre un objet de valeur devrait être aussi simple que sécurisé.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        Que vous soyez un particulier souhaitant se séparer d'un héritage ou un professionnel à la recherche de la perle rare, notre plateforme offre un cadre de confiance, transparent et efficace.
                    </p>
                </div>
                <div className="order-1 md:order-2 bg-gray-100 rounded-2xl h-80 flex items-center justify-center">
                    <span className="text-gray-400 font-bold text-xl">Image Équipe</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-purple-50 p-8 rounded-xl">
                    <h3 className="text-xl font-bold text-purple-900 mb-3">Expertise</h3>
                    <p className="text-gray-600">Un réseau de professionnels vérifiés pour garantir des transactions sûres.</p>
                </div>
                <div className="bg-purple-50 p-8 rounded-xl">
                    <h3 className="text-xl font-bold text-purple-900 mb-3">Technologie</h3>
                    <p className="text-gray-600">L'IA au service de l'estimation pour vous donner le juste prix instantanément.</p>
                </div>
                <div className="bg-purple-50 p-8 rounded-xl">
                    <h3 className="text-xl font-bold text-purple-900 mb-3">Confiance</h3>
                    <p className="text-gray-600">Paiement sécurisé et vérification d'identité à chaque étape.</p>
                </div>
            </div>
        </div>
    )
}
