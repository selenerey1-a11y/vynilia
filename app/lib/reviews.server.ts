import type {Storefront} from '@shopify/hydrogen';
import type {Review} from '~/data/reviews';

/**
 * Customer reviews are stored in the shop itself, as metaobjects of this type,
 * so they survive deploys and belong to Vynilia rather than to this codebase.
 *
 * Every submission is created as a DRAFT: the Storefront API only returns
 * published entries, so nothing a stranger types reaches the page until it is
 * published in the Shopify admin (Contenido → Metaobjetos → Reseña de producto).
 *
 * Run `npm run setup:reviews` once to create the definition in the shop.
 */
export const REVIEW_TYPE = 'product_review';

const ADMIN_API_VERSION = '2026-04';

type MetaobjectNode = {
  id: string;
  fields: Array<{key: string; value?: string | null}>;
};

const STORE_REVIEWS_QUERY = `#graphql
  query StoreReviews($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first) {
      nodes {
        id
        fields {
          key
          value
        }
      }
    }
  }
` as const;

function toReview(node: MetaobjectNode): Review | null {
  const values = new Map(node.fields.map((field) => [field.key, field.value ?? '']));
  const author = values.get('author')?.trim();
  const text = values.get('body')?.trim();
  const rating = Math.round(Number(values.get('rating')));

  // A half-filled metaobject (someone editing it by hand in the admin) is
  // skipped rather than rendered as an empty card.
  if (!author || !text || !(rating >= 1 && rating <= 5)) return null;

  return {
    id: node.id,
    author,
    text,
    rating: rating as Review['rating'],
    date: values.get('date') || new Date().toISOString().slice(0, 10),
    // Only reviews you mark yourself in the admin carry the badge: a form
    // submission proves nothing about a purchase.
    verified: values.get('verified') === 'true',
    variant: values.get('variant') || undefined,
  };
}

/**
 * Published reviews for one product. Never throws: before the metaobject
 * definition exists the product page must still render its seeded reviews.
 */
export async function loadStoreReviews(
  storefront: Storefront,
  productHandle: string,
): Promise<Review[]> {
  try {
    const data = await storefront.query<{
      metaobjects: {nodes: MetaobjectNode[]};
    }>(STORE_REVIEWS_QUERY, {
      variables: {type: REVIEW_TYPE, first: 100},
      cache: storefront.CacheShort(),
    });

    return (data?.metaobjects?.nodes ?? [])
      .filter((node) => {
        const product = node.fields.find((field) => field.key === 'product');
        // No product field = a review that applies to the whole shop.
        return !product?.value || product.value === productHandle;
      })
      .map(toReview)
      .filter((review): review is Review => review !== null)
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error('No se pudieron cargar las reseñas de Shopify:', error);
    return [];
  }
}

export type ReviewSubmission = {
  productHandle: string;
  author: string;
  rating: number;
  text: string;
  variant?: string;
};

export type SubmitResult =
  | {ok: true}
  | {ok: false; error: 'not-configured' | 'rejected'};

const CREATE_REVIEW_MUTATION = `
  mutation CreateReview($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject {
        id
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

/**
 * Writes one review into the shop. Uses the Admin API directly because the
 * Storefront API is read-only for metaobjects — hence the private token, which
 * must never be exposed to the browser (this module is server-only).
 */
export async function submitReview(
  env: Env,
  submission: ReviewSubmission,
): Promise<SubmitResult> {
  const token = env.PRIVATE_ADMIN_API_TOKEN;
  const shop = env.PUBLIC_STORE_DOMAIN;

  if (!token || !shop) {
    console.error(
      'PRIVATE_ADMIN_API_TOKEN no está configurado: la reseña no se guardó.',
    );
    return {ok: false, error: 'not-configured'};
  }

  const fields = [
    {key: 'product', value: submission.productHandle},
    {key: 'author', value: submission.author},
    {key: 'rating', value: String(submission.rating)},
    {key: 'body', value: submission.text},
    {key: 'date', value: new Date().toISOString().slice(0, 10)},
    {key: 'verified', value: 'false'},
  ];
  if (submission.variant) {
    fields.push({key: 'variant', value: submission.variant});
  }

  try {
    const response = await fetch(
      `https://${shop}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({
          query: CREATE_REVIEW_MUTATION,
          variables: {
            metaobject: {
              type: REVIEW_TYPE,
              capabilities: {publishable: {status: 'DRAFT'}},
              fields,
            },
          },
        }),
      },
    );

    const body = (await response.json()) as {
      data?: {metaobjectCreate?: {userErrors?: Array<{message: string}>}};
      errors?: Array<{message: string}>;
    };
    const userErrors = body.data?.metaobjectCreate?.userErrors ?? [];

    if (!response.ok || body.errors?.length || userErrors.length) {
      console.error('Shopify rechazó la reseña:', {
        status: response.status,
        errors: body.errors,
        userErrors,
      });
      return {ok: false, error: 'rejected'};
    }

    return {ok: true};
  } catch (error) {
    console.error('Error al guardar la reseña en Shopify:', error);
    return {ok: false, error: 'rejected'};
  }
}
