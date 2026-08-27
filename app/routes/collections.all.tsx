import type {Route} from './+types/collections.all';
import {ProductGrid, PRODUCT_CARD_FRAGMENT} from '~/components/ProductGrid';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Vynilia | Catálogo'}];
};

export async function loader({context}: Route.LoaderArgs) {
  const {products} = await context.storefront.query(CATALOG_QUERY);
  return {products: products.nodes};
}

export default function Catalog({loaderData}: Route.ComponentProps) {
  return (
    <div className="vynilia-page">
      <h1 className="section-title">Catálogo</h1>
      <ProductGrid products={loaderData.products} />
    </div>
  );
}

const CATALOG_QUERY = `#graphql
  query Catalog($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 24, sortKey: BEST_SELLING) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
