export default function LegalPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-purple-900">Mentions Légales</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Éditeur du site</h2>
        <p className="text-gray-600 mb-2">
          Le site Purple Dog est édité par la société Purple Dog SAS.
        </p>
        <ul className="list-disc list-inside text-gray-600 pl-4">
          <li>Siège social : 123 Avenue de l'Innovation, 75000 Paris</li>
          <li>Capital social : 100 000 €</li>
          <li>RCS Paris B 123 456 789</li>
          <li>Numéro de TVA : FR 12 345678900</li>
          <li>Email : contact@purpledog.com</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Hébergement</h2>
        <p className="text-gray-600">
          Le site est hébergé par Vercel Inc.<br />
          440 N Barranca Ave #4133<br />
          Covina, CA 91723<br />
          privacy@vercel.com
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Propriété intellectuelle</h2>
        <p className="text-gray-600">
          L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
          Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Données personnelles</h2>
        <p className="text-gray-600">
          Conformément à la loi "Informatique et Libertés", vous disposez d'un droit d'accès, de modification et de suppression des données qui vous concernent.
          Pour l'exercer, adressez-vous à notre délégué à la protection des données à l'adresse dpo@purpledog.com.
        </p>
      </section>
    </div>
  )
}
