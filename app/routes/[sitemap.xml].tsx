import type {Route} from './+types/[sitemap.xml]';

/**
 * A small, single-file sitemap. It lists the storefront's products, collections
 * and pages, which is enough for a catalogue this size.
 */
export async function loader({request, context}: Route.LoaderArgs) {
  const {storefront} = context;
  const baseUrl = new URL(request.url).origin;

  const data = await storefront.query(SITEMAP_QUERY);

  const urls = [
    {loc: baseUrl, priority: '1.0'},
    ...data.products.nodes.map((product) => ({
      loc: `${baseUrl}/products/${product.handle}`,
      lastmod: product.updatedAt,
      priority: '0.9',
    })),
    ...data.collections.nodes.map((collection) => ({
      loc: `${baseUrl}/collections/${collection.handle}`,
      lastmod: collection.updatedAt,
      priority: '0.7',
    })),
    ...data.pages.nodes.map((page) => ({
      loc: `${baseUrl}/pages/${page.handle}`,
      lastmod: page.updatedAt,
      priority: '0.5',
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>${
      'lastmod' in url && url.lastmod
        ? `
    <lastmod>${url.lastmod}</lastmod>`
        : ''
    }
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'content-type': 'application/xml',
      'cache-control': `max-age=${60 * 60 * 24}`,
    },
  });
}

const SITEMAP_QUERY = `#graphql
  query Sitemap($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 100, query: "published_status:'online_store:visible'") {
      nodes {
        handle
        updatedAt
      }
    }
    collections(first: 100, query: "published_status:'online_store:visible'") {
      nodes {
        handle
        updatedAt
      }
    }
    pages(first: 100, query: "published_status:'published'") {
      nodes {
        handle
        updatedAt
      }
    }
  }
` as const;
