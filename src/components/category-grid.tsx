import Link from "next/link";
import { Category } from "@prisma/client";
import { ArrowUpRight } from "lucide-react";

// Generate a deterministic gradient based on string hash
function getGradient(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c1 = Math.floor(Math.abs(Math.sin(hash) * 16777215)).toString(16);
  const c2 = Math.floor(Math.abs(Math.cos(hash) * 16777215)).toString(16);
  return `linear-gradient(135deg, #${c1.padEnd(6, "0")}20, #${c2.padEnd(
    6,
    "0"
  )}40)`;
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl  text-gray-900 mb-4">
              Explorez par Collection
            </h2>
            <p className="text-gray-500 max-w-xl">
              Découvrez nos catégories les plus prisées, sélectionnées pour leur
              rareté et leur excellence.
            </p>
          </div>
          <Link
            href="/dashboard/pro/market"
            className="hidden md:flex items-center text-purple-900 hover:text-purple-700 font-medium transition-colors"
          >
            Tout voir <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-[200px]">
          {categories.map((cat, idx) => {
            const isLarge = idx === 0 || idx === 6; // Example layout variation
            return (
              <Link
                href={`/dashboard/pro/market?categoryId=${cat.id}`}
                key={cat.id}
                className={`group relative overflow-hidden rounded-xl bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isLarge ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
                }`}
              >
                {/* Background Pattern/Gradient */}
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  style={{ background: getGradient(cat.name) }}
                />

                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3
                    className={`${
                      isLarge ? "text-3xl" : "text-xl"
                    }  font-medium text-gray-900 group-hover:text-purple-900 transition-colors`}
                  >
                    {cat.name}
                  </h3>
                  {isLarge && (
                    <p className="text-gray-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                      Explorer la collection &rarr;
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
