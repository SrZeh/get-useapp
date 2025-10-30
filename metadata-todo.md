## Metadata TODO — AI Composer Prompt (SEO + Geo Expert)

Purpose: Provide an AI with a precise, repeatable checklist and prompt blocks to generate complete, geo-targeted SEO metadata (titles, descriptions, canonical, structured data, social tags, hreflang, and local SEO assets) for app/web routes in this project.

### 1) Project/Brand Context
- **Brand name**: Get&Use
- **Brand tone**: Helpful, trustworthy, modern, concise
- **Primary value**: Rent and lend items safely and easily
- **Brand color**: #96ff9a (mint green)
- **Platforms**: iOS, Android, Web (Expo)
- **Target locales**: pt-BR (primary), en-US (secondary)

### 2) Geo Strategy Inputs
- **Primary country**: Brazil
- **Priority cities/metros**: São Paulo, Rio de Janeiro, Belo Horizonte, Curitiba, Porto Alegre, Brasília, Salvador, Recife, Fortaleza, Florianópolis
- **Service radius**: City-wide; neighborhood-level variants when useful
- **NAP source of truth**: Centralized in app config (business/legal page); keep consistent across pages

### 3) Route-Level Inputs (Provide to AI)
- routePath: e.g., `/items`, `/item/[id]`, `/transactions`, `/profile`
- pageType: listing, detail, category, transactional, profile, legal, blog
- locale: `pt-BR` | `en-US`
- city: e.g., São Paulo (optional)
- stateRegion: e.g., SP (optional)
- canonicalUrl: absolute URL
- primaryKeyword: e.g., aluguel de ferramentas
- secondaryKeywords: array of semantically related terms
- entity: item/category/brand/person (if applicable)
- shortSummary: 1–2 lines describing the page purpose
- indexation: index | noindex
- follow: follow | nofollow
- ogImage: absolute URL to image (1200x630)
- twitterImage: absolute URL to image (1200x600)
- publishedTime / modifiedTime: ISO strings (if applicable)

### 4) Output Requirements (AI must produce)
- SEO title (≤ 60 chars ideal, ≤ 580px), localized, with city when provided
- Meta description (140–160 chars), benefit-led, localized, with geo nuance
- Canonical URL
- Robots: index/follow flags
- hreflang set for available locales with x-default
- Open Graph: og:title, og:description, og:type, og:url, og:site_name, og:image (+alts)
- Twitter Card: summary_large_image with title/description/url/image
- Structured Data (JSON-LD): choose ONE primary type per page
  - Item page: `Product` + `Offer`
  - Category/listing: `CollectionPage` + `BreadcrumbList`
  - Brand/home: `Organization` + `WebSite` + `BreadcrumbList`
  - Article/blog: `Article`/`BlogPosting`
  - Profile: `Person`
  - Contact/Location (if applicable): `LocalBusiness`
- Breadcrumbs when hierarchical
- Geo enhancements
  - City and region embedded where relevant (title/desc/LD)
  - If LocalBusiness used, include address, geo, sameAs

### 5) Title Patterns (Localized)
- Detail (pt-BR): "{itemName} para alugar em {city} | Get&Use"
- Listing (pt-BR): "Aluguel de {category} em {city} | Get&Use"
- Transactional (pt-BR): "Reservas e empréstimos em {city} | Get&Use"
- Detail (en-US): "Rent {itemName} in {city} | Get&Use"
- Listing (en-US): "{category} Rentals in {city} | Get&Use"

### 6) Description Patterns (Localized)
- pt-BR: "Alugue {what} em {city}. Seguro, rápido e com ótimos preços. Reserve pelo app."
- en-US: "Rent {what} in {city}. Safe, fast, and affordable. Book via the app."

### 7) Keyword Guidance
- Include 1 primary and 2–4 secondary terms naturally
- Use city and state abbreviation once when geo provided
- Avoid stuffing; prefer semantic variants and benefits

### 8) Hreflang Matrix
- For each page, output tags for: pt-BR, en-US, x-default

### 9) Robots/Indexing Rules
- Index public, evergreen pages (home, category, item detail)
- Noindex thin, auth-only, or duplicate variants
- Follow unless blocked for reason

### 10) Structured Data Templates (Placeholders)

Product (Item detail):
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{{itemName}}",
  "description": "{{shortSummary}}",
  "brand": "Get&Use",
  "category": "{{category}}",
  "url": "{{canonicalUrl}}",
  "image": ["{{ogImage}}"],
  "offers": {
    "@type": "Offer",
    "priceCurrency": "BRL",
    "price": "{{dailyRate}}",
    "availability": "https://schema.org/InStock",
    "url": "{{canonicalUrl}}"
  }
}
```

CollectionPage (Listing/category):
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "{{pageTitle}}",
  "description": "{{metaDescription}}",
  "url": "{{canonicalUrl}}"
}
```

BreadcrumbList:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type":"ListItem","position":1,"name":"Home","item":"{{siteUrl}}"},
    {"@type":"ListItem","position":2,"name":"{{category}}","item":"{{categoryUrl}}"}
  ]
}
```

LocalBusiness (if applicable):
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Get&Use",
  "url": "{{siteUrl}}",
  "image": ["{{ogImage}}"],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "{{city}}",
    "addressRegion": "{{stateRegion}}",
    "addressCountry": "BR"
  },
  "areaServed": "{{city}} {{stateRegion}}",
  "sameAs": ["https://www.instagram.com/useapp", "https://www.linkedin.com/company/useapp"]
}
```

### 11) Social Cards
- Open Graph: prefer single, on-brand image per page; include `og:image:alt`
- Twitter: `summary_large_image`
- Alt text: describe object + brand + city if relevant

### 12) Output Format (Single JSON Blob)
The AI should output a single JSON object with these keys:
```json
{
  "title": "...",
  "description": "...",
  "canonical": "...",
  "robots": { "index": true, "follow": true },
  "hreflang": [
    {"lang":"pt-BR","href":"..."},
    {"lang":"en-US","href":"..."},
    {"lang":"x-default","href":"..."}
  ],
  "openGraph": {
    "title": "...",
    "description": "...",
    "type": "website|product|article|profile|...",
    "url": "...",
    "siteName": "Get&Use",
    "images": [{"url":"...","alt":"...","width":1200,"height":630}]
  },
  "twitter": {
    "card": "summary_large_image",
    "title": "...",
    "description": "...",
    "image": "..."
  },
  "structuredData": [ { "@context": "https://schema.org", "@type": "..." } ]
}
```

### 13) Checklist (Per Page)
- [ ] Title respects pixel limit, includes city if provided
- [ ] Description localized, benefit-led, geo-aware
- [ ] Canonical absolute, self-referential unless canonicalized elsewhere
- [ ] Robots set (index/follow as per policy)
- [ ] Hreflang for pt-BR, en-US, x-default
- [ ] OG/Twitter present with correct dimensions and alt
- [ ] JSON-LD chosen appropriately (single primary type) and valid
- [ ] Breadcrumbs present when hierarchical
- [ ] Geo signals present (city/state) when relevant
- [ ] Keywords used naturally (no stuffing)

### 14) AI Composer Prompt (Copy/Paste)

Use this exact prompt and replace placeholders:

"""
Act as a senior SEO geo expert and produce COMPLETE, VALID metadata for a React Native/Expo route. Localize copy and add city/state geo signals when provided. Output a SINGLE JSON object exactly matching the specified schema.

Inputs:
- routePath: {{routePath}}
- pageType: {{pageType}}
- locale: {{locale}}
- city: {{city}}
- stateRegion: {{stateRegion}}
- canonicalUrl: {{canonicalUrl}}
- primaryKeyword: {{primaryKeyword}}
- secondaryKeywords: {{secondaryKeywords}}
- entity: {{entity}}
- shortSummary: {{shortSummary}}
- indexation: {{indexation}}
- follow: {{follow}}
- ogImage: {{ogImage}}
- twitterImage: {{twitterImage}}
- publishedTime: {{publishedTime}}
- modifiedTime: {{modifiedTime}}

Constraints:
- Title ≤ 60 chars ideal; description 140–160 chars.
- Use localized language per locale.
- If city given, include it naturally in title/description.
- Choose ONE primary JSON-LD type (add BreadcrumbList when useful).
- Return ONLY the JSON. No comments.

Return JSON keys: title, description, canonical, robots, hreflang, openGraph, twitter, structuredData.
"""

### 15) Example Invocation (pt-BR, Listing São Paulo)

Inputs excerpt:
```json
{
  "routePath":"/items",
  "pageType":"listing",
  "locale":"pt-BR",
  "city":"São Paulo",
  "stateRegion":"SP",
  "canonicalUrl":"https://geteuse.com.br/items",
  "primaryKeyword":"aluguel de ferramentas",
  "secondaryKeywords":["alugar ferramentas", "locação de ferramentas"],
  "shortSummary":"Lista de ferramentas disponíveis para aluguel",
  "indexation":"index",
  "follow":"follow",
  "ogImage":"https://geteuse.com.br/og/listing.png",
  "twitterImage":"https://geteuse.com.br/og/listing.png"
}
```

Expected title pattern (example): "Aluguel de ferramentas em São Paulo | Get&Use"

### 16) AI Web Search Enhancement (Discovery + SERP Optimization)

Add these inputs for AI web search orchestration:
- searchIntent: transactional | informational | navigational | local
- competitorSeeds: array of seed domains/URLs to consider
- serpFeaturesTarget: ["PAA", "FeaturedSnippet", "LocalPack", "Images", "Videos"]
- answerDepth: short | medium | in-depth

Discovery directives for the AI (do not output raw crawl data, only distilled results):
- Identify top 3–5 competitors ranking for primaryKeyword in the target city/locale
- Extract common headings, FAQs, and content gaps
- Map entities (brand, category, product types, locations) using schema.org terms
- Propose internal links to nearest relevant pages (category, item, how-it-works, pricing, trust/safety)

Additional Output Keys (extend section 12 JSON when search mode is used):
```json
{
  "keywords": {
    "primary": "...",
    "secondary": ["..."],
    "clusters": [
      { "cluster": "{theme}", "terms": ["...", "..."] }
    ]
  },
  "faqs": [
    { "q": "...", "a": "..." }
  ],
  "entities": [
    { "name": "Get&Use", "type": "Organization" },
    { "name": "São Paulo", "type": "City" }
  ],
  "internalLinks": [
    { "label": "Como funciona", "href": "/como-funciona" },
    { "label": "Categorias", "href": "/items" }
  ],
  "externalBenchmarks": [
    { "label": "Competitor A", "note": "ranks for {term}" }
  ],
  "serpTargets": ["PAA", "FeaturedSnippet"],
  "contentBrief": {
    "h1": "...",
    "outline": ["Intro", "Benefícios", "Como alugar", "Perguntas frequentes"],
    "wordCount": 600,
    "tone": "helpful, trustworthy, concise"
  }
}
```

Structured Data Add-ons (optional, when FAQs/how-to appear on page):
- FAQPage JSON-LD using `faqs` above
- HowTo JSON-LD for step-by-step flows (e.g., como alugar)

FAQPage template:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{{q}}",
      "acceptedAnswer": { "@type": "Answer", "text": "{{a}}" }
    }
  ]
}
```

HowTo template:
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "Como alugar com a Get&Use",
  "step": [
    { "@type": "HowToStep", "name": "Escolha o item", "text": "Navegue por categorias" },
    { "@type": "HowToStep", "name": "Faça a reserva", "text": "Selecione datas e envie o pedido" },
    { "@type": "HowToStep", "name": "Retire e devolva", "text": "Combine com o proprietário" }
  ]
}
```

E-E-A-T Checklist for AI content suggestions:
- Show trust signals: reviews, protection, verified profiles
- Cite policies/terms where relevant (link to `/termosdeuso`)
- Avoid unsubstantiated claims; prefer measurable benefits
- Use clear authorship when blog/article type


