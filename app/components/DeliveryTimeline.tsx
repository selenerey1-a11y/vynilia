import {useEffect, useState} from 'react';

/**
 * Business days the workshop takes to print and pack an order. Every Vynilia is
 * made to order, so this part is the same whichever tier was bought — only the
 * transit window below changes.
 *
 * Quoted as the far end of the "1 a 3 días hábiles" the shipping panel promises,
 * so the dates on this timeline are ones the store can always beat.
 */
const PREP_DAYS = 3;

/** Business days in transit, as `{min, max}` — see the `transit` field on Tier. */
export type TransitWindow = {min: number; max: number};

/**
 * What Shopify reports the checkout accepts, straight from
 * `shop.paymentSettings`. Passing it through means the row can never advertise a
 * method the customer would not actually find at checkout.
 */
export type AcceptedPayments = {
  cards: readonly string[];
  wallets: readonly string[];
};

/**
 * Marks we know how to draw. Anything the API returns that is not listed here is
 * skipped rather than guessed at — a wrong logo is worse than a missing one.
 */
const PAYMENT_MARKS: Record<string, {label: string; brand: string}> = {
  VISA: {label: 'VISA', brand: 'visa'},
  MASTERCARD: {label: 'Mastercard', brand: 'mastercard'},
  AMERICAN_EXPRESS: {label: 'AMEX', brand: 'amex'},
  SHOPIFY_PAY: {label: 'Shop Pay', brand: 'shop'},
  APPLE_PAY: {label: 'Apple Pay', brand: 'apple'},
  GOOGLE_PAY: {label: 'Google Pay', brand: 'google'},
};

/** Adds business days (Mon–Fri), which is the unit both windows are quoted in. */
function addBusinessDays(from: Date, days: number) {
  const date = new Date(from);
  let left = days;
  while (left > 0) {
    date.setDate(date.getDate() + 1);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6) left -= 1;
  }
  return date;
}

const dayFormat = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

/** "Jue, 27 ago" — es-ES abbreviations carry stops we do not want here. */
function formatDay(date: Date) {
  const text = dayFormat.format(date).replaceAll('.', '');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function buildDates(transit: TransitWindow) {
  const ordered = new Date();
  const shipped = addBusinessDays(ordered, PREP_DAYS);
  return {
    ordered: formatDay(ordered),
    shipped: formatDay(shipped),
    delivered: formatDay(addBusinessDays(shipped, transit.max)),
  };
}

const stepIcons = {
  cart: (
    <>
      <circle cx="9" cy="20" r="1.6" />
      <circle cx="18" cy="20" r="1.6" />
      <path d="M2 3h3l2.6 12h11.2l2.2-8H6.2" />
      <path d="M14 5.5h5M16.5 3v5" />
    </>
  ),
  truck: (
    <>
      <path d="M2 6h11v10H2z" />
      <path d="M13 9h4l4 4v3h-8z" />
      <circle cx="7" cy="18.5" r="1.8" />
      <circle cx="17.5" cy="18.5" r="1.8" />
    </>
  ),
  gift: (
    <>
      <path d="M3 11h18v9H3z" />
      <path d="M2 7h20v4H2zM12 7v13" />
      <path d="M12 7S9.5 3 7.5 4.2 9 7 12 7Zm0 0s2.5-4 4.5-2.8S15 7 12 7Z" />
    </>
  ),
};

function StepIcon({name}: {name: keyof typeof stepIcons}) {
  return (
    <span className="dt-icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {stepIcons[name]}
      </svg>
    </span>
  );
}

/** One payment mark. Mastercard is a symbol; the rest are wordmarks. */
function PaymentMark({code}: {code: string}) {
  const mark = PAYMENT_MARKS[code];
  if (!mark) return null;

  return (
    <li className={`dt-pay dt-pay-${mark.brand}`}>
      {mark.brand === 'mastercard' ? (
        <>
          <svg viewBox="0 0 40 24" aria-hidden="true" className="dt-pay-mc">
            <circle cx="15" cy="12" r="9" fill="#eb001b" />
            <circle cx="25" cy="12" r="9" fill="#f79e1b" />
            <path
              d="M20 5.2a9 9 0 0 0 0 13.6 9 9 0 0 0 0-13.6Z"
              fill="#ff5f00"
            />
          </svg>
          <span className="sr-only">{mark.label}</span>
        </>
      ) : (
        mark.label
      )}
    </li>
  );
}

/**
 * The "when does it arrive, and how can I pay" block under the buy button.
 *
 * The dates are rendered on the server so there is no layout shift, then
 * recomputed on mount: Oxygen can serve a cached page for hours, and a timeline
 * that still starts yesterday would be worse than useless. They are marked
 * `suppressHydrationWarning` for exactly that reason.
 */
export function DeliveryTimeline({
  transit,
  payments,
}: {
  transit: TransitWindow;
  payments: AcceptedPayments;
}) {
  const [dates, setDates] = useState(() => buildDates(transit));

  useEffect(() => {
    setDates(buildDates(transit));
  }, [transit]);

  const methods = [...payments.cards, ...payments.wallets].filter(
    (code) => code in PAYMENT_MARKS,
  );

  return (
    <section className="delivery-timeline" aria-label="Plazos y formas de pago">
      <ol className="dt-steps">
        <li className="dt-step">
          <StepIcon name="cart" />
          <strong suppressHydrationWarning>{dates.ordered}</strong>
          <span className="dt-label">Pedido realizado</span>
        </li>
        <li className="dt-step">
          <StepIcon name="truck" />
          <strong suppressHydrationWarning>{dates.shipped}</strong>
          <span className="dt-label">Pedido enviado</span>
        </li>
        <li className="dt-step">
          <StepIcon name="gift" />
          <strong suppressHydrationWarning>{dates.delivered}</strong>
          <span className="dt-label">Entrega estimada</span>
        </li>
      </ol>

      {methods.length > 0 && (
        <div className="dt-payments">
          <span className="dt-payments-label">Pago 100% seguro con</span>
          <ul className="dt-pay-list">
            {methods.map((code) => (
              <PaymentMark key={code} code={code} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
