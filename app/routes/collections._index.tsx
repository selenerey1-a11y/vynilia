import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {Route} from './+types/collections._index';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Vynilia | Colecciones'}];
};

export async function loader({context}: Route.LoaderArgs) {
  const {collections} = await context.storefront.query(COLLECTIONS_QUERY);
  return {collections: collections.nodes};
}

export default function Collections({loaderData}: Route.ComponentProps) {
  const {collections} = loaderData;

  return (
    <div className="vynilia-page">
      <h1 className="section-title">Colecciones</h1>
      {collections.length ? (
        <div className="product-grid">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.handle}`}
              className="product-grid-card"
              prefetch="intent"
            >
              {collection.image && (
                <Image
                  data={collection.image}
                  alt={collection.image.altText || collection.title}
                  sizes="(min-width: 900px) 300px, 45vw"
                />
              )}
              <strong>{collection.title}</strong>
            </Link>
          ))}
        </div>
      ) : (
        <p>Todavía no hay colecciones publicadas.</p>
      )}
    </div>
  );
}

const COLLECTIONS_QUERY = `#graphql
  query Collections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: 24) {
      nodes {
        id
        title
        handle
        image {
          id
          url
          altText
          width
          height
        }
      }
    }
  }
` as const;
