import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {Route} from './+types/_index';

const FEATURED_HANDLE = 'vynilia';

const features = [
  '🎵 Tu canción personalizada',
  '📸 Con tus fotos y recuerdos',
  '🎨 Diseño premium y moderno',
  '🚚 Envío rápido a todo el país',
];

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Vynilia | El regalo que deja sin palabras'},
    {
      name: 'description',
      content:
        'Personaliza tu canción con tus fotos y conviértela en un recuerdo que suena.',
    },
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  const {product} = await context.storefront.query(FEATURED_PRODUCT_QUERY, {
    variables: {handle: FEATURED_HANDLE},
  });

  return {product};
}

export default function HomePage({loaderData}: Route.ComponentProps) {
  const {product} = loaderData;
  const productUrl = product ? `/products/${product.handle}` : '/collections/all';

  return (
    <div className="vynilia-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Vynilia</span>
          <h1>El regalo que deja sin palabras.</h1>
          <p>
            Personaliza tu canción con tus fotos, tus recuerdos y un diseño que
            convierte cada detalle en un momento inolvidable.
          </p>
          <div className="hero-actions">
            <Link to={productUrl} className="primary-btn">
              Personaliza el tuyo
            </Link>
            <Link to={productUrl} className="secondary-btn">
              Ver producto
            </Link>
          </div>
          <ul className="feature-list">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>

        <div className="hero-visual">
          <Link to={productUrl} className="product-card" prefetch="intent">
            <div className="product-card-badge">Oferta limitada</div>
            {product?.featuredImage ? (
              <Image
                data={product.featuredImage}
                alt={product.featuredImage.altText || product.title}
                sizes="(min-width: 900px) 45vw, 100vw"
              />
            ) : (
              <img
                src="/images/vynilia-1.webp"
                alt="Reproductor Vynilia con sus nueve vinilos personalizados"
              />
            )}
            <div className="product-card-footer">
              <div>
                <span className="tiny-label">Desde</span>
                <strong>
                  {product ? (
                    <Money
                      data={product.priceRange.minVariantPrice}
                      as="span"
                    />
                  ) : (
                    '€44,99'
                  )}
                </strong>
              </div>
              {product?.compareAtPriceRange?.minVariantPrice?.amount &&
              Number(product.compareAtPriceRange.minVariantPrice.amount) >
                Number(product.priceRange.minVariantPrice.amount) ? (
                <span className="old-price">
                  <Money
                    data={product.compareAtPriceRange.minVariantPrice}
                    as="span"
                  />
                </span>
              ) : null}
            </div>
          </Link>
        </div>
      </section>

      <section className="benefits-strip">
        <div>
          <strong>4.8/5</strong>
          <span>Valoración media</span>
        </div>
        <div>
          <strong>+5.000</strong>
          <span>Regalos personalizados</span>
        </div>
        <div>
          <strong>4-8 días</strong>
          <span>Entrega estimada</span>
        </div>
      </section>

      <section className="experience-section">
        <div className="section-header">
          <span className="eyebrow accent">Cómo funciona</span>
          <h2>Perfecto para ese detalle que no se olvida</h2>
        </div>

        <div className="steps-grid">
          <article>
            <span>01</span>
            <h3>Elige tu estilo</h3>
            <p>Selecciona versión, artista y estilo según tu idea.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Sube tus fotos</h3>
            <p>Hazlo desde tu móvil o tu ordenador en pocos segundos.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Disfruta del regalo</h3>
            <p>Recibe un recuerdo único pensado para sorprender.</p>
          </article>
        </div>
      </section>
    </div>
  );
}

const FEATURED_PRODUCT_QUERY = `#graphql
  query FeaturedProduct(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      handle
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
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
` as const;
