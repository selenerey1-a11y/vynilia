import type {Route} from './+types/collections.$handle';
import {ProductGrid, PRODUCT_CARD_FRAGMENT} from '~/components/ProductGrid';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Vynilia | ${data?.collection?.title ?? 'Colección'}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Error('Missing collection handle');
  }

  const {collection} = await context.storefront.query(COLLECTION_QUERY, {
    variables: {handle: params.handle},
  });

  if (!collection) {
    throw new Response('Not Found', {status: 404});
  }

  return {collection};
}

export default function Collection({loaderData}: Route.ComponentProps) {
  const {collection} = loaderData;

  return (
    <div className="vynilia-page">
      <h1 className="section-title">{collection.title}</h1>
      {collection.description && <p>{collection.description}</p>}
      <ProductGrid products={collection.products.nodes} />
    </div>
  );
}

const COLLECTION_QUERY = `#graphql
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: 24) {
        nodes {
          ...ProductCard
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
