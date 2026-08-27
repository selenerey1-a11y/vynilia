import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {OptimisticCart} from '@shopify/hydrogen';
import {isProValue} from '~/lib/tiers';

/**
 * Free express shipping is what the Pro tier buys, so the drawer's progress bar
 * tracks that rather than a euro threshold: full and green-lit once a Pro line
 * is in the cart, otherwise a nudge towards the +5 € upgrade.
 *
 * NOTE: the free-shipping promise is copy only until a matching rate exists in
 * the Shopify admin — same caveat as the product page.
 */
export function CartShippingBar({
  cart,
}: {
  cart: OptimisticCart<CartApiQueryFragment | null>;
}) {
  const unlocked = (cart?.lines?.nodes ?? []).some((line) => {
    const merchandise = 'merchandise' in line ? line.merchandise : null;
    if (!merchandise) return false;
    return (
      isProValue(merchandise.title) ||
      merchandise.selectedOptions.some((option) => isProValue(option.value))
    );
  });

  return (
    <div className={unlocked ? 'ship-bar unlocked' : 'ship-bar'}>
      <p className="ship-bar-text">
        {unlocked ? (
          <>
            🎉 <strong>¡Tu envío express es completamente gratis!</strong>
          </>
        ) : (
          <>
            Cambia a <strong>Vynilia Pro</strong> y tu envío express es gratis
          </>
        )}
      </p>
      <div
        className="ship-bar-track"
        role="progressbar"
        aria-valuenow={unlocked ? 100 : 55}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso hacia el envío express gratis"
      >
        <span className="ship-bar-fill" />
        <span className="ship-bar-truck" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 6h11v10H2z" />
            <path d="M13 9h4l4 4v3h-8z" />
            <circle cx="7" cy="18.5" r="1.8" />
            <circle cx="17.5" cy="18.5" r="1.8" />
          </svg>
        </span>
      </div>
    </div>
  );
}
