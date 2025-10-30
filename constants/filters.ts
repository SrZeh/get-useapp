export interface PriceRange {
  id: string;
  label: string;
  min: number | null;
  max: number | null;
}

export const PRICE_RANGES: PriceRange[] = [
  { id: 'free', label: 'Grátis', min: 0, max: 0 },
  { id: '0-50', label: 'R$ 0-50', min: 0, max: 50 },
  { id: '50-100', label: 'R$ 50-100', min: 50, max: 100 },
  { id: '100-200', label: 'R$ 100-200', min: 100, max: 200 },
  { id: '200-500', label: 'R$ 200-500', min: 200, max: 500 },
  { id: '500+', label: 'R$ 500+', min: 500, max: null },
];


