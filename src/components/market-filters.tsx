"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Category } from "@prisma/client";

interface MarketFiltersProps {
  categories: Category[];
  minPrice: number;
  maxPrice: number;
}

export function MarketFilters({
  categories,
  minPrice,
  maxPrice,
}: MarketFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL
  const initialCategories = searchParams.get("categories")?.split(",") || [];
  const initialCategoryId = searchParams.get("categoryId");
  if (initialCategoryId && !initialCategories.includes(initialCategoryId)) {
    initialCategories.push(initialCategoryId);
  }

  const [selectedCats, setSelectedCats] = useState<string[]>(initialCategories);
  const [priceRange, setPriceRange] = useState<number>(
    Number(searchParams.get("maxPrice")) || maxPrice
  );

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleCategoryChange = (catId: number, checked: boolean) => {
    let newCats = [...selectedCats];
    const catIdStr = catId.toString();
    if (checked) {
      newCats.push(catIdStr);
    } else {
      newCats = newCats.filter((id) => id !== catIdStr);
    }
    setSelectedCats(newCats);
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCats.length > 0) {
      params.set("categories", selectedCats.join(","));
    } else {
      params.delete("categories");
    }

    // Clean up singular categoryId if it exists, as we use 'categories' now
    params.delete("categoryId");

    if (priceRange < maxPrice) {
      params.set("maxPrice", priceRange.toString());
    } else {
      params.delete("maxPrice");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className=" text-lg mb-4 text-gray-900 border-b pb-2">
          Catégories
        </h3>
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-3">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={selectedCats.includes(cat.id.toString())}
                onCheckedChange={(c) =>
                  handleCategoryChange(cat.id, c as boolean)
                }
                className="border-gray-300 data-[state=checked]:bg-purple-900 data-[state=checked]:border-purple-900"
              />
              <Label
                htmlFor={`cat-${cat.id}`}
                className="font-light text-gray-700 cursor-pointer hover:text-black transition-colors"
              >
                {cat.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className=" text-lg mb-4 text-gray-900 border-b pb-2">
          Budget Max
        </h3>
        <div className="space-y-4">
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={10}
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-900"
          />
          <div className="flex justify-between text-sm text-gray-500 font-mono">
            <span>{minPrice} €</span>
            <span className="font-bold text-purple-900">{priceRange} €</span>
          </div>
        </div>
      </div>

      <Button
        className="w-full bg-gray-900 hover:bg-black text-white rounded-none py-6"
        onClick={applyFilters}
      >
        Filtrer les résultats
      </Button>
    </div>
  );
}
