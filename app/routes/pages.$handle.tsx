import type {Route} from './+types/pages.$handle';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `Vynilia | ${data?.page?.title ?? 'Página'}`}];
};

export async function loader({params, context}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {handle: params.handle},
    }),
  ]);

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  return {page};
}

export default function Page({loaderData}: Route.ComponentProps) {
  const {page} = loaderData;

  return (
    <div className="vynilia-page cms-page">
      <h1 className="section-title">{page.title}</h1>
      <div
        className="cms-content"
        dangerouslySetInnerHTML={{__html: page.body}}
      />
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page($language: LanguageCode, $country: CountryCode, $handle: String!)
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
` as const;
