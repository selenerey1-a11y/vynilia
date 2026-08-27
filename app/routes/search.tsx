import {Link, useLoaderData} from 'react-router';
import {Image, Money, getPaginationVariables} from '@shopify/hydrogen';
import type {Route} from './+types/search';
import {
  getEmptyPredictiveSearchResult,
  type RegularSearchReturn,
  type PredictiveSearchReturn,
} from '~/lib/search';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Vynilia | Buscar'}];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const isPredictive = new URL(request.url).searchParams.has('predictive');

  try {
    return isPredictive
      ? await predictiveSearch({request, context})
      : await regularSearch({request, context});
  } catch (error) {
    console.error(error);
    return {
      type: isPredictive ? ('predictive' as const) : ('regular' as const),
      term: '',
      result: null,
      error: (error as Error).message,
    };
  }
}

export default function SearchPage() {
  // Predictive results are consumed by a fetcher in the header drawer, so this
  // component only ever renders the regular (full page) shape.
  const data = useLoaderData<typeof loader>() as unknown as {
    term: string;
    result: RegularSearchReturn['result'] | null;
    error?: string;
  };
  const {term, result, error} = data;

  const products = result?.items?.products?.nodes ?? [];

  return (
    <div className="vynilia-page search-page">
      <h1 className="section-title">Buscar</h1>
      <form method="get" className="search-form">
        <input
          type="search"
          name="q"
          defaultValue={term}
          placeholder="¿Qué estás buscando?"
          aria-label="Buscar en la tienda"
        />
        <button type="submit" className="primary-btn">
          Buscar
        </button>
      </form>

      {error && <p className="search-error">{error}</p>}

      {term && !products.length && !error && (
        <p>
          No hemos encontrado nada para <q>{term}</q>.
        </p>
      )}

      <div className="search-results-grid">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.handle}`}
            className="search-result-card"
          >
            {product.featuredImage && (
              <Image
                data={product.featuredImage}
                alt={product.featuredImage.altText || product.title}
                sizes="240px"
              />
            )}
            <strong>{product.title}</strong>
            <Money data={product.priceRange.minVariantPrice} />
          </Link>
        ))}
      </div>
    </div>
  );
}

const SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment SearchProduct on Product {
    __typename
    handle
    id
    title
    trackingParameters
    vendor
    featuredImage {
      id
      url
      altText
      width
      height
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
` as const;

const SEARCH_QUERY = `#graphql
  query RegularSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $term: String!
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    products: search(
      after: $endCursor,
      before: $startCursor,
      first: $first,
      last: $last,
      query: $term,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: HIDE,
    ) {
      nodes {
        ...on Product {
          ...SearchProduct
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${SEARCH_PRODUCT_FRAGMENT}
` as const;

/** Full-page search used by the /search route. */
async function regularSearch({
  request,
  context,
}: Pick<Route.LoaderArgs, 'request' | 'context'>): Promise<
  RegularSearchReturn
> {
  const {storefront} = context;
  const url = new URL(request.url);
  const variables = getPaginationVariables(request, {pageBy: 24});
  const term = String(url.searchParams.get('q') || '');

  const {errors, ...items} = await storefront.query(SEARCH_QUERY, {
    variables: {...variables, term},
  });

  if (!items) {
    throw new Error('No search data returned from Shopify API');
  }

  const total = items.products?.nodes?.length ?? 0;
  const error = errors
    ? errors.map(({message}: {message: string}) => message).join(', ')
    : undefined;

  return {type: 'regular', term, error, result: {total, items}};
}

const PREDICTIVE_SEARCH_QUERY = `#graphql
  fragment PredictiveArticle on Article {
    __typename
    id
    title
    handle
    blog {
      handle
    }
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
  fragment PredictiveCollection on Collection {
    __typename
    id
    title
    handle
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
  fragment PredictivePage on Page {
    __typename
    id
    title
    handle
    trackingParameters
  }
  fragment PredictiveProduct on Product {
    __typename
    id
    title
    handle
    trackingParameters
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
    }
  }
  fragment PredictiveQuery on SearchQuerySuggestion {
    __typename
    text
    styledText
    trackingParameters
  }
  query PredictiveSearch(
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $term: String!
    $types: [PredictiveSearchType!]
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: $limit,
      limitScope: $limitScope,
      query: $term,
      types: $types,
    ) {
      articles {
        ...PredictiveArticle
      }
      collections {
        ...PredictiveCollection
      }
      pages {
        ...PredictivePage
      }
      products {
        ...PredictiveProduct
      }
      queries {
        ...PredictiveQuery
      }
    }
  }
` as const;

/** Type-ahead search used by the header search drawer. */
async function predictiveSearch({
  request,
  context,
}: Pick<Route.ActionArgs, 'request' | 'context'>): Promise<
  PredictiveSearchReturn
> {
  const {storefront} = context;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || 10);
  const type = 'predictive';

  if (!term) return {type, term, result: getEmptyPredictiveSearchResult()};

  const {predictiveSearch: items, errors} = await storefront.query(
    PREDICTIVE_SEARCH_QUERY,
    {
      variables: {
        limit,
        limitScope: 'EACH',
        term,
        types: ['PRODUCT', 'QUERY'],
      },
    },
  );

  if (errors) {
    throw new Error(
      `Shopify API errors: ${errors.map(({message}) => message).join(', ')}`,
    );
  }

  if (!items) {
    throw new Error('No predictive search data returned from Shopify API');
  }

  const total = Object.values(items).reduce(
    (acc, item) => acc + item.length,
    0,
  );

  return {type, term, result: {items, total}};
}
