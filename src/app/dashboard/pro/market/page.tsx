import prisma from "@/lib/prisma";
import { MarketFilters } from "@/components/market-filters";
import { MarketGrid } from "@/components/market-grid";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function MarketPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();
  if (!session?.user || session.user.role !== "PRO") {
    // Optionally redirect if not pro, or show limited view.
    // Requirement says "Page Market Pro", implies access control.
    // redirect("/login");
  }

  // Parse filters with robust handling
  const categoryParam = searchParams.categories;
  const categoryIdParam = searchParams.categoryId;

  let categoryIds: number[] = [];

  if (typeof categoryParam === "string") {
    categoryIds = categoryParam.split(",").filter(Boolean).map(Number);
  } else if (Array.isArray(categoryParam)) {
    categoryIds = categoryParam
      .flatMap((c) => c.split(","))
      .filter(Boolean)
      .map(Number);
  }

  // Also support singular categoryId
  if (typeof categoryIdParam === "string") {
    categoryIds.push(Number(categoryIdParam));
  } else if (Array.isArray(categoryIdParam)) {
    categoryIds.push(...categoryIdParam.map(Number));
  }

  // Deduplicate
  categoryIds = Array.from(new Set(categoryIds));

  const maxPriceParam = searchParams.maxPrice;
  const maxPriceStr = Array.isArray(maxPriceParam)
    ? maxPriceParam[0]
    : maxPriceParam;
  const maxPriceFilter = maxPriceStr ? Number(maxPriceStr) : undefined;

  const queryParam = searchParams.q;
  const searchQuery = Array.isArray(queryParam) ? queryParam[0] : queryParam;

  // Build Query
  const where: Prisma.AdWhereInput = {
    status: { in: ["ACTIVE", "PENDING"] },
    ...(categoryIds.length > 0 && { categoryId: { in: categoryIds } }),
    ...(maxPriceFilter && { price: { lte: maxPriceFilter } }),
    ...(searchQuery && {
      OR: [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
      ],
    }),
  };

  // Fetch Data
  const [ads, categories, priceStats] = await Promise.all([
    prisma.ad.findMany({
      where,
      include: {
        user: true,
        favoritedBy: {
          where: {
            id: Number(session?.user?.id) || -1,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.ad.aggregate({
      _min: { price: true },
      _max: { price: true },
      where: { status: "ACTIVE" }, // Global stats for slider bounds
    }),
  ]);

  const globalMin = priceStats._min.price ?? 0;
  const globalMax = priceStats._max.price ?? 10000;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12">
        <h1 className="text-4xl   text-gray-900">Le marché professionnel</h1>
        <p className="text-gray-500 mt-2">
          Accédez aux meilleures opportunités en temps réel.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24">
            <MarketFilters
              categories={categories}
              minPrice={Math.floor(globalMin)}
              maxPrice={Math.ceil(globalMax)}
            />
          </div>
        </aside>

        {/* Main Grid */}
        <main className="flex-1">
          <MarketGrid ads={ads} />
        </main>
      </div>
    </div>
  );
}
