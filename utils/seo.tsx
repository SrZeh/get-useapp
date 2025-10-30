import React from 'react';
import { Platform } from 'react-native';
import { Head } from 'expo-router';

export type HreflangLink = { lang: string; href: string };
export type OpenGraphImage = { url: string; alt?: string; width?: number; height?: number };

export type SeoMeta = {
  title: string;
  description: string;
  canonical: string;
  robots: { index: boolean; follow: boolean };
  hreflang?: HreflangLink[];
  openGraph?: {
    title?: string;
    description?: string;
    type?: string;
    url?: string;
    siteName?: string;
    images?: OpenGraphImage[];
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image';
    title?: string;
    description?: string;
    image?: string;
  };
  structuredData?: Array<Record<string, unknown>>;
};

type SeoHeadProps = { meta: SeoMeta };

export function SeoHead({ meta }: SeoHeadProps) {
  // Avoid rendering heavy head tags on native platforms
  if (Platform.OS !== 'web') return null;

  const og = meta.openGraph ?? {};
  const robotsStr = `${meta.robots.index ? 'index' : 'noindex'}, ${meta.robots.follow ? 'follow' : 'nofollow'}`;

  return (
    <Head>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="robots" content={robotsStr} />
      <link rel="canonical" href={meta.canonical} />

      {/* Hreflang */}
      {meta.hreflang?.map((h) => (
        <link key={`${h.lang}-${h.href}`} rel="alternate" hrefLang={h.lang} href={h.href} />
      ))}

      {/* Open Graph */}
      {og.title && <meta property="og:title" content={og.title} />}
      {og.description && <meta property="og:description" content={og.description} />}
      {og.type && <meta property="og:type" content={og.type} />}
      <meta property="og:url" content={og.url ?? meta.canonical} />
      {og.siteName && <meta property="og:site_name" content={og.siteName} />}      
      {og.images?.[0]?.url && (
        <meta property="og:image" content={og.images[0].url} />
      )}
      {og.images?.[0]?.alt && (
        <meta property="og:image:alt" content={og.images[0].alt} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content={meta.twitter?.card ?? 'summary_large_image'} />
      {meta.twitter?.title && <meta name="twitter:title" content={meta.twitter.title} />}
      {meta.twitter?.description && (
        <meta name="twitter:description" content={meta.twitter.description} />
      )}
      {meta.twitter?.image && <meta name="twitter:image" content={meta.twitter.image} />}

      {/* Structured Data */}
      {meta.structuredData?.map((sd, idx) => (
        <script
          key={`ld-${idx}`}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sd) }}
        />
      ))}
    </Head>
  );
}


