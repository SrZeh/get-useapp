import type { SeoMeta } from '@/utils/seo';

const SITE = 'https://geteuse.com.br';

export function buildItemDetailPtBR(params: {
  itemName: string;
  city?: string;
  dailyRate?: number | string;
  category?: string;
  path: string; // e.g., `/item/abc123`
  image?: string;
}): SeoMeta {
  const city = params.city ?? 'Florianópolis';
  const title = `${params.itemName} para alugar em ${city} | Get&Use`;
  const description = `Alugue ${params.itemName} em ${city}. Seguro, rápido e com ótimos preços. Reserve pelo app.`;
  const ogImage = params.image ?? `${SITE}/og/item.png`;
  const canonical = `${SITE}${params.path}`;

  const productLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.itemName,
    description,
    brand: 'Get&Use',
    category: params.category ?? 'Itens para aluguel',
    url: canonical,
    image: [ogImage],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: String(params.dailyRate ?? ''),
      availability: 'https://schema.org/InStock',
      url: canonical,
    },
  };

  return {
    title,
    description,
    canonical,
    robots: { index: true, follow: true },
    hreflang: [
      { lang: 'pt-BR', href: canonical },
      { lang: 'en-US', href: canonical.replace(SITE, `${SITE}/en`) },
      { lang: 'x-default', href: canonical },
    ],
    openGraph: {
      title,
      description,
      type: 'product',
      url: canonical,
      siteName: 'Get&Use',
      images: [{ url: ogImage, alt: `${params.itemName} para alugar em ${city} — Get&Use`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image: ogImage,
    },
    structuredData: [productLd],
  };
}


