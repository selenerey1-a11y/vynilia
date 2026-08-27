import {Link} from 'react-router';
import type {Route} from './+types/policies.$handle';

type PolicyKey =
  | 'privacyPolicy'
  | 'shippingPolicy'
  | 'termsOfService'
  | 'refundPolicy';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Vynilia | ${data?.policy?.title ?? 'Política'}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const policyName = params.handle.replace(
    /-([a-z])/g,
    (_: unknown, m1: string) => m1.toUpperCase(),
  ) as PolicyKey;

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
    },
  });

  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  return {policy};
}

export default function Policy({loaderData}: Route.ComponentProps) {
  const {policy} = loaderData;

  return (
    <div className="vynilia-page">
      <Link to="/policies" className="back-link">
        ← Todas las políticas
      </Link>
      <h1 className="section-title">{policy.title}</h1>
      <div
        className="cms-content"
        dangerouslySetInnerHTML={{__html: policy.body}}
      />
    </div>
  );
}

const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
` as const;
