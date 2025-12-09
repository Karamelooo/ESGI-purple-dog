export const PALIER_RULES = [
    { maxPrice: 100, increment: 10 },
    { maxPrice: 500, increment: 50 },
    { maxPrice: 1000, increment: 100 },
    { maxPrice: 5000, increment: 200 },
    { maxPrice: Infinity, increment: 500 },
];


export function getRequiredIncrement(currentPrice: number): number {
    for (const rule of PALIER_RULES) {
        if (currentPrice < rule.maxPrice) {
            return rule.increment;
        }
    }
    return 500;
}