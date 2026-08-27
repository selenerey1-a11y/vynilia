import {Link} from 'react-router';
import type {Route} from './+types/policies._index';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Vynilia | Políticas de la tienda'}];
};

export async function loader({context}: Route.LoaderArgs) {
  const {shop} = await context.storefront.query(POLICIES_QUERY);

  const policies = Object.values(shop ?? {}).filter(
    (policy): policy is {id: string; title: string; handle: string} =>
      Boolean(policy && typeof policy === 'object' && 'handle' in policy),
  );

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies({loaderData}: Route.ComponentProps) {
  return (
    <div className="vynilia-page">
      <h1 className="section-title">Políticas de la tienda</h1>
      <ul className="policy-list">
        {loaderData.policies.map((policy) => (
          <li key={policy.id}>
            <Link to={`/policies/${policy.handle}`}>{policy.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
` as const;
