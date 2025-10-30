import type { SeoMeta } from '@/utils/seo';

const SITE = 'https://geteuse.com.br';

export const itemsListingPtBR: SeoMeta = {
  title: 'Precisou? Get&Use | Aluguel de items em geral',
  description: 'Alugue ferramentas em São Paulo. Seguro, rápido e com ótimos preços. Reserve pelo app.',
  canonical: `${SITE}/items`,
  robots: { index: true, follow: true },
  hreflang: [
    { lang: 'pt-BR', href: `${SITE}/items` },
    { lang: 'en-US', href: `${SITE}/en/items` },
    { lang: 'x-default', href: `${SITE}/items` },
  ],
  openGraph: {
    title: 'Precisou? Get&Use | Aluguel de items em geral',
    description: 'Alugue ferramentas em São Paulo. Seguro, rápido e com ótimos preços. Reserve pelo app.',
    type: 'website',
    url: `${SITE}/items`,
    siteName: 'Get&Use',
    images: [
      { url: `${SITE}/og/listing.png`, alt: 'Get&Use — Aluguel de ferramentas em São Paulo', width: 1200, height: 630 },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Precisou? Get&Use | Aluguel de items em geral',
    description: 'Alugue ferramentas em São Paulo. Seguro, rápido e com ótimos preços. Reserve pelo app.',
    image: `${SITE}/og/listing.png`,
  },
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Precisou? Get&Use | Aluguel de items em geral',
      description: 'Alugue ferramentas em São Paulo. Seguro, rápido e com ótimos preços. Reserve pelo app.',
      url: `${SITE}/items`,
    },
  ],
};


