import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

/**
 * Scarcity strip between the comparison and the guarantee banner.
 *
 * WARNING: these two numbers are marketing placeholders, exactly like
 * `ORDERS_LAST_24H` and `VIEWERS_BASE` on the product route. Nothing here counts
 * real stock — the Storefront API only returns `quantityAvailable` with the
 * `unauthenticated_read_product_inventory` scope, which this storefront token
 * does not have. Treat them as claims you are choosing to make, and edit them
 * here. The price it names, on the other hand, is the real compare-at price.
 */
const UNITS_LEFT = 23;
const RESERVED_PERCENT = 82;

export function UrgencyTicket({compareAtPrice}: {compareAtPrice?: MoneyV2 | null}) {
  // Deliberately not an <aside>: the skeleton styles bare `aside` as the
  // off-canvas drawer (fixed, right: -440px), and the ticket flew off-screen.
  return (
    <section className="urgency-ticket" aria-label="Disponibilidad">
      <span className="ut-notch ut-notch-left" aria-hidden="true" />

      <span className="ut-icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
        </svg>
      </span>

      <div className="ut-body">
        <strong className="ut-eyebrow">Últimas unidades de esta serie</strong>
        <p className="ut-line">
          Quedan <b>{UNITS_LEFT} unidades</b> al precio de oferta
          {compareAtPrice ? (
            <>
              {' '}
              — después vuelve a <Money data={compareAtPrice} as="b" />
            </>
          ) : null}
          .
        </p>
      </div>

      <div className="ut-meter">
        <span className="ut-meter-track">
          <span
            className="ut-meter-fill"
            style={{width: `${RESERVED_PERCENT}%`}}
          />
        </span>
        <span className="ut-meter-label">
          {RESERVED_PERCENT}% de la serie ya reservado
        </span>
      </div>

      <span className="ut-notch ut-notch-right" aria-hidden="true" />
    </section>
  );
}
