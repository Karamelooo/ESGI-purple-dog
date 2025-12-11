export default function LegalPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">Mentions légales</h1>

            <div className="prose prose-purple max-w-none space-y-8">
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Éditeur du site</h2>
                    <p>
                        Le site Purple Dog est édité par l'équipe du Hackathon ESGI.<br />
                        Siège social : Paris, France.<br />
                        Email : contact@purpledog.com
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Hébergement</h2>
                    <p>
                        Ce site est hébergé sur une infrastructure Docker locale (pour le moment).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Propriété intellectuelle</h2>
                    <p>
                        L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
                        Tous les droits de reproduction sont réservés.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Vente et enchères</h2>
                    <p>
                        Purple Dog agit en tant que tiers de confiance. Les ventes sont régies par nos Conditions Générales de Vente (CGV).
                        Les enchères sont soumises à une vérification stricte de l'identité des acheteurs professionnels.
                    </p>
                </section>
            </div>
        </div>
    )
}
