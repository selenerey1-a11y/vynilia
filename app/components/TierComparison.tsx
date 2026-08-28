import {TIER_NAMES} from '~/lib/tiers';

/**
 * The two tiers compared side by side, as a real table.
 *
 * It started as a flat graphic, then as two stacked cards; both meant that on a
 * phone you read one tier and then the other, which is not comparing. Here the
 * icon lives in a narrow gutter and the two versions share every row, so the
 * columns stay next to each other from 320px up — which is why the wording is
 * kept short. The product photos are cropped out of Vynilia's own artwork, and
 * the disc counts and guarantee windows come from TIERS.
 */

type Cell = {label: string; note: string};

type Feature = {icon: FeatureIcon; name: string; base: Cell; pro: Cell};

const featureIcons = {
  disc: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
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
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.4-2.9 8.2-7 10-4.1-1.8-7-5.6-7-10V6z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </>
  ),
} as const;

type FeatureIcon = keyof typeof featureIcons;

function Icon({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span className={className} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </span>
  );
}

export function TierComparison({
  base,
  pro,
}: {
  base: {discs: number; guaranteeDays: number};
  pro: {discs: number; guaranteeDays: number};
}) {
  const features: Feature[] = [
    {
      icon: 'disc',
      name: 'Vinilos',
      base: {label: `${base.discs} vinilos`, note: 'Con vuestras fotos'},
      pro: {label: `${pro.discs} vinilos`, note: 'Con vuestras fotos'},
    },
    {
      icon: 'music',
      name: 'Música',
      base: {label: 'Cualquier canción', note: 'La que significa algo'},
      pro: {label: 'Cualquier canción', note: 'La que significa algo'},
    },
    {
      icon: 'truck',
      name: 'Envío',
      base: {label: 'Envío estándar', note: '3 a 5 días hábiles'},
      pro: {label: 'Express GRATIS', note: '1 a 2 días hábiles'},
    },
    {
      icon: 'shield',
      name: 'Garantía',
      base: {label: `${base.guaranteeDays} días`, note: 'Tu compra protegida'},
      pro: {
        label: `${pro.guaranteeDays} días premium`,
        note: 'Más tiempo, más tranquilidad',
      },
    },
  ];

  return (
    <section className="tier-comparison" aria-labelledby="comparativa">
      <h2 id="comparativa" className="tc-headline">
        ¿Qué {TIER_NAMES.base} es mejor?
      </h2>
      <p className="tc-subtitle">
        Elige la experiencia que mejor encaje con vosotros.
      </p>

      <table className="tc-table">
        <thead>
          <tr>
            <th scope="col" className="tc-gutter">
              <span className="sr-only">Característica</span>
            </th>
            <th scope="col" className="tc-head">
              {/* Matches the height of the Pro column's badge so both photos
                  and both names stay on exactly the same line. */}
              <span className="tc-flag-spacer" aria-hidden="true" />
              <img
                className="tc-photo"
                src="/images/tier-vynilia.webp"
                alt={`Reproductor ${TIER_NAMES.base} con sus ${base.discs} vinilos personalizados`}
                width={700}
                height={252}
                loading="lazy"
                decoding="async"
              />
              <span className="tc-name">{TIER_NAMES.base}</span>
              <span className="tc-tagline">Todo lo esencial</span>
            </th>
            <th scope="col" className="tc-head is-pro">
              <span className="tc-flag">★ MÁS ELEGIDA</span>
              <img
                className="tc-photo"
                src="/images/tier-vynilia-pro.webp"
                alt={`Reproductor ${TIER_NAMES.pro} con sus ${pro.discs} vinilos personalizados`}
                width={700}
                height={252}
                loading="lazy"
                decoding="async"
              />
              <span className="tc-name">{TIER_NAMES.pro}</span>
              <span className="tc-tagline">Sin límites</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {features.map((feature) => (
            <tr key={feature.name}>
              <th scope="row" className="tc-gutter">
                <Icon className="tc-row-icon">{featureIcons[feature.icon]}</Icon>
                <span className="sr-only">{feature.name}</span>
              </th>
              <td className="tc-cell">
                <strong>{feature.base.label}</strong>
                <span className="tc-note">{feature.base.note}</span>
              </td>
              <td className="tc-cell is-pro">
                <strong>{feature.pro.label}</strong>
                <span className="tc-note">{feature.pro.note}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
