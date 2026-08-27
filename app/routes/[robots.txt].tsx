import type {Route} from './+types/[robots.txt]';

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const shopId = context.env.SHOP_ID;

  return new Response(robotsTxtData({url: url.origin, shopId}), {
    status: 200,
    headers: {
      'content-type': 'text/plain',
      'cache-control': `max-age=${60 * 60 * 24}`,
    },
  });
}

function robotsTxtData({url, shopId}: {url: string; shopId?: string}) {
  const sitemapUrl = url ? `${url}/sitemap.xml` : undefined;

  return `
User-agent: *
Disallow: /admin
Disallow: /cart
Disallow: /orders
Disallow: /checkouts/
Disallow: /checkout
${shopId ? `Disallow: /${shopId}/checkouts` : ''}
${shopId ? `Disallow: /${shopId}/orders` : ''}
Disallow: /carts
Disallow: /account
Disallow: /collections/*sort_by*
Disallow: /*/collections/*sort_by*
Disallow: /collections/*+*
Disallow: /collections/*%2B*
Disallow: /collections/*%2b*
Disallow: /*/collections/*+*
Disallow: /*/collections/*%2B*
Disallow: /*/collections/*%2b*
Disallow: /blogs/*+*
Disallow: /blogs/*%2B*
Disallow: /blogs/*%2b*
Disallow: /*/blogs/*+*
Disallow: /*/blogs/*%2B*
Disallow: /*/blogs/*%2b*
Disallow: /*?*oseid=*
Disallow: /*preview_theme_id*
Disallow: /*preview_script_id*
Disallow: /policies/
Disallow: /*/*?*ls=*&ls=*
Disallow: /*/*?*ls%3D*%3Fls%3D*
Disallow: /search
Allow: /search/
Disallow: /search/?*
Disallow: /apple-app-site-association
Disallow: /.well-known/shopify/monorail
${sitemapUrl ? `Sitemap: ${sitemapUrl}` : ''}

# Google adsbot ignores robots.txt unless specifically named!
User-agent: adsbot-google
Disallow: /checkouts/
Disallow: /checkout
Disallow: /carts
Disallow: /orders
${shopId ? `Disallow: /${shopId}/checkouts` : ''}
${shopId ? `Disallow: /${shopId}/orders` : ''}
Disallow: /*?*oseid=*
Disallow: /*preview_theme_id*
Disallow: /*preview_script_id*

User-agent: Nutch
Disallow: /

User-agent: AhrefsBot
Crawl-delay: 10
Disallow: /policies/
${sitemapUrl ? `Sitemap: ${sitemapUrl}` : ''}

User-agent: AhrefsSiteAudit
Crawl-delay: 10
Disallow: /policies/
${sitemapUrl ? `Sitemap: ${sitemapUrl}` : ''}

User-agent: MJ12bot
Crawl-delay: 10

User-agent: Pinterest
Crawl-delay: 1
`.trim();
}
