import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {ProductCardFragment} from 'storefrontapi.generated';

/** Shared product grid used by the collection and catalog routes. */
export function ProductGrid({products}: {products: ProductCardFragment[]}) {
  if (!products.length) {
    return <p>Todavía no hay productos publicados en esta sección.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <Link
          key={product.id}
          to={`/products/${product.handle}`}
          className="product-grid-card"
          prefetch="intent"
        >
          {product.featuredImage && (
            <Image
              data={product.featuredImage}
              alt={product.featuredImage.altText || product.title}
              sizes="(min-width: 900px) 300px, 45vw"
            />
          )}
          <strong>{product.title}</strong>
          <span className="product-grid-price">
            <Money data={product.priceRange.minVariantPrice} as="span" />
            {product.compareAtPriceRange?.minVariantPrice?.amount &&
            Number(product.compareAtPriceRange.minVariantPrice.amount) >
              Number(product.priceRange.minVariantPrice.amount) ? (
              <s>
                <Money
                  data={product.compareAtPriceRange.minVariantPrice}
                  as="span"
                />
              </s>
            ) : null}
          </span>
        </Link>
      ))}
    </div>
  );
}

export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
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
` as const;
