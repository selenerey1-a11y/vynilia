import {useEffect, useRef, useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import {Link, useNavigate} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  Analytics,
  Image,
  Money,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  getSelectedProductOptions,
  useOptimisticVariant,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import type {MappedProductOptions} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {HIDDEN_OPTIONS, isProValue} from '~/lib/tiers';
import {CustomerVideos} from '~/components/CustomerVideos';
import {ProductReviews} from '~/components/ProductReviews';
import {reviews as seedReviews} from '~/data/reviews';
import {loadStoreReviews} from '~/lib/reviews.server';

type TierKey = 'base' | 'pro';

type Tier = {
  discs: number;
  blurb: string;
  subtitle: string;
  /** Upsell rows shown inside the bundle card. Empty on the entry tier. */
  extras: Array<{icon: string; label: string}>;
  includes: string[];
  music: string;
  shipping: string;
  /** Length of the money-back window, which the Pro tier doubles. */
  guaranteeDays: number;
  /** How that window is named wherever it is shown as a heading. */
  guaranteeLabel: string;
};

const TIERS: Record<TierKey, Tier> = {
  base: {
    discs: 4,
    blurb: '4 vinilos · tu música y tus fotos',
    subtitle: '¡Aprovecha la oferta solo hoy!',
    extras: [],
    music: 'Sube cualquier canción que quieras',
    shipping: 'Envío estándar',
    guaranteeDays: 30,
    guaranteeLabel: 'Garantía de 30 días',
    includes: [
      'x1 Reproductor Vynilia™',
      'x4 Vinilos con vuestras fotos',
      'x1 Cable USB para importar tu música',
      'x1 Caja regalo',
    ],
  },
  pro: {
    discs: 9,
    blurb: '9 vinilos · garantía de 60 días',
    subtitle: '¡Disfruta de tu Vynilia al máximo!',
    extras: [
      {icon: '💿', label: '+ 5 VINILOS EXTRA (9 EN TOTAL)'},
      {icon: '🚚', label: '+ ENVÍO EXPRESS GRATIS'},
      {icon: '🛡️', label: '+ GARANTÍA PREMIUM DE 60 DÍAS'},
      {icon: '🔄', label: '+ EFECTO GIRATORIO AL SONAR LA MÚSICA'},
    ],
    music: 'Sube cualquier canción que quieras',
    shipping: 'Envío express GRATIS',
    guaranteeDays: 60,
    guaranteeLabel: 'Garantía premium de 60 días',
    includes: [
      'x1 Reproductor Vynilia™',
      'x9 Vinilos con vuestras fotos',
      'x1 Cable USB para importar tu música',
      'x1 Caja regalo lista para sorprender',
    ],
  },
};

/**
 * Thin line icons for the info accordion, drawn inline so they inherit the
 * current colour and stay crisp at any size (no icon font, no extra request).
 */
const panelIcons = {
  tag: (
    <path d="M3 3h7l11 11-7 7L3 10V3Zm4.2 4.2a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8Z" />
  ),
  truck: (
    <>
      <path d="M2 6h11v10H2z" />
      <path d="M13 9h4l4 4v3h-8z" />
      <circle cx="7" cy="18.5" r="1.8" />
      <circle cx="17.5" cy="18.5" r="1.8" />
    </>
  ),
  refund: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v4.5h4.5" />
    </>
  ),
};

type PanelIcon = keyof typeof panelIcons;

type InfoPanel = {
  id: string;
  icon: PanelIcon;
  title: string;
  body: ReactNode;
};

/**
 * The collapsible blocks under the buy button. Built from the selected tier so
 * the contents and the shipping promise follow whichever version is chosen.
 */
function buildInfoPanels(tier: Tier): InfoPanel[] {
  return [
    {
      id: 'includes',
      icon: 'tag',
      title: 'Qué incluye el paquete',
      body: (
        <ul className="panel-list">
          {tier.includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ),
    },
    {
      id: 'shipping',
      icon: 'truck',
      title: 'Información de envío',
      body: (
        <>
          <p>
            <strong>📦 Preparación:</strong> cada Vynilia se imprime a mano con
            vuestras fotos, así que tardamos <strong>1 a 3 días hábiles</strong>{' '}
            en dejar tu pedido listo.
          </p>
          <p>
            <strong>🚚 Entrega:</strong> de <strong>3 a 5 días hábiles</strong>{' '}
            desde que sale de nuestro taller. Enviamos a toda España peninsular
            con número de seguimiento.
          </p>
          <p>
            <strong>✨ Tu versión:</strong> {tier.shipping}.
          </p>
        </>
      ),
    },
    {
      id: 'guarantee',
      icon: 'refund',
      title: tier.guaranteeLabel,
      body: (
        <>
          <p>
            Si tu Vynilia no te enamora, te devolvemos el{' '}
            <strong>100% de tu dinero</strong> durante los{' '}
            <strong>{tier.guaranteeDays} días</strong> siguientes a la entrega.
            Sin preguntas raras.
          </p>
          <p>
            Responde al correo de confirmación de tu pedido y nos encargamos del
            resto.
          </p>
        </>
      ),
    },
  ];
}

/**
 * Live-looking social proof above the buy box.
 *
 * WARNING: these are marketing placeholders, not measured data. Nothing in the
 * storefront counts real orders or real concurrent visitors — change the
 * numbers here, and treat them as claims you are choosing to make.
 */
const ORDERS_LAST_24H = 47;
const VIEWERS_BASE = 19;
const REVIEW_COUNT = 89;

/**
 * Recent-buyer avatars. Drop square photos (roughly 120x120, .webp or .jpg) at
 * these paths and they appear automatically; until a file exists the avatar
 * falls back to the initial, so the row never renders broken images.
 */
const BUYERS = [
  {initial: 'M', photo: '/images/buyers/1.png'},
  {initial: 'J', photo: '/images/buyers/2.png'},
  {initial: 'L', photo: '/images/buyers/3.png'},
  {initial: 'A', photo: '/images/buyers/4.png'},
  {initial: 'C', photo: '/images/buyers/5.png'},
];

/**
 * The classic 12-lobe "verified" seal, built as an alternating-radius polygon
 * so it needs no icon font or image file.
 */
const SEAL_POINTS = Array.from({length: 24}, (_, index) => {
  const angle = (Math.PI / 12) * index - Math.PI / 2;
  const radius = index % 2 === 0 ? 12 : 9.7;
  return `${(12 + radius * Math.cos(angle)).toFixed(2)},${(
    12 +
    radius * Math.sin(angle)
  ).toFixed(2)}`;
}).join(' ');

/** One avatar: photo if we have it, initial if we do not, seal either way. */
function BuyerAvatar({
  buyer,
  index,
}: {
  buyer: (typeof BUYERS)[number];
  index: number;
}) {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <span className="orders-avatar" style={{zIndex: BUYERS.length - index}}>
      {photoFailed ? (
        <span className="orders-avatar-initial">{buyer.initial}</span>
      ) : (
        <img
          src={buyer.photo}
          alt=""
          loading="lazy"
          onError={() => setPhotoFailed(true)}
        />
      )}
      <svg className="verified-seal" viewBox="0 0 24 24" aria-hidden="true">
        <polygon points={SEAL_POINTS} />
        <path
          d="M7.4 12.2l3.1 3.1 6.1-6.5"
          fill="none"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** Stacked avatars + "+N PEDIDOS en las últimas 24h". */
function OrdersBadge() {
  return (
    <div className="orders-badge">
      <span className="orders-avatars" aria-hidden="true">
        {BUYERS.map((buyer, index) => (
          <BuyerAvatar buyer={buyer} index={index} key={buyer.photo} />
        ))}
      </span>
      <span className="orders-pill">
        <strong>+{ORDERS_LAST_24H} PEDIDOS</strong>
        <span>en las últimas 24h</span>
      </span>
    </div>
  );
}

/**
 * "N personas están viendo este producto ahora mismo". The number wanders a
 * little so it does not look frozen; it is not counting anything. Server-render
 * uses the base value so hydration matches.
 */
function LiveViewers() {
  const [viewers, setViewers] = useState(VIEWERS_BASE);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setViewers((current) => {
        const next = current + (Math.random() < 0.5 ? -1 : 1);
        return Math.min(VIEWERS_BASE + 6, Math.max(VIEWERS_BASE - 5, next));
      });
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <p className="live-viewers">
      <span className="live-dot" aria-hidden="true" />
      <span>
        <strong>{viewers} personas</strong> están viendo este producto ahora
        mismo
      </span>
    </p>
  );
}

/**
 * Testimonials shown next to the buy button.
 *
 * WARNING: this copy is written, not collected — these are not real customers.
 * The "Compra verificada" label below claims something specific about them.
 * Under the EU Omnibus directive (in Spain, the Ley de Consumidores) both
 * publishing invented reviews and calling reviews verified without checking
 * are sanctionable practices. Set SHOW_VERIFIED_LABEL to false to drop the
 * claim, or replace this array with reviews from a real review app.
 */
const SHOW_VERIFIED_LABEL = true;

const BUYER_REVIEWS = [
  {
    photo: '/images/buyers/2.png',
    name: 'Marta R.',
    place: 'Valencia',
    text: 'Se lo regalé a mi madre por su cumpleaños y acabamos las dos llorando. Puso el vinilo con la foto de mis abuelos y ya no lo soltó en toda la tarde.',
  },
  {
    photo: '/images/buyers/3.png',
    name: 'Javier M.',
    place: 'Sevilla',
    text: 'Tenía miedo de que el sonido fuera flojo para lo que cuesta y me sorprendió. Se oye limpio y llena el salón sin distorsionar.',
  },
  {
    photo: '/images/buyers/5.png',
    name: 'Lucía T.',
    place: 'Bilbao',
    text: 'Pedí uno para mi piso y he acabado encargando dos más. Cada vinilo es un viaje nuestro y es lo primero que enseño a quien viene a casa.',
  },
];

/**
 * Compact proof slider under the add-to-cart button. Native scroll-snap does
 * the sliding, so a swipe on a phone and a drag on a trackpad both work with
 * no gesture handling of our own; the dots only read and set scroll position.
 */
function BuyerReviews() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  /**
   * Which card is on screen, watched with an observer rather than a scroll
   * handler: momentum scrolling on touch can settle without a final scroll
   * event, which leaves the dots pointing at the wrong card.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const slides = Array.from(track.children);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(slides.indexOf(entry.target));
          }
        });
      },
      {root: track, threshold: 0.6},
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, []);

  const goTo = (index: number) => {
    const track = trackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;
    if (!track || !slide) return;
    // Assigning scrollLeft rather than calling scrollTo({behavior: 'smooth'}):
    // the easing comes from `scroll-behavior` in the stylesheet, so where that
    // animation is unavailable the position still changes instead of the
    // control doing nothing at all.
    track.scrollLeft = slide.offsetLeft;
  };

  return (
    <div className="buyer-slider">
      <div
        className="buyer-track"
        ref={trackRef}
        tabIndex={0}
        role="group"
        aria-label="Reseñas de clientes"
      >
      {BUYER_REVIEWS.map((review) => (
        <article className="buyer-review" key={review.name}>
          <div className="buyer-review-head">
            <span className="buyer-photo">
              <img src={review.photo} alt="" loading="lazy" />
              <svg className="buyer-seal" viewBox="0 0 24 24" aria-hidden="true">
                <polygon points={SEAL_POINTS} />
                <path
                  d="M7.4 12.2l3.1 3.1 6.1-6.5"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="buyer-meta">
              <strong>{review.name}</strong>
              <span className="buyer-place">{review.place}, España</span>
            </div>
            <span className="buyer-stars" aria-label="5 de 5 estrellas">
              ★★★★★
            </span>
          </div>
          <p className="buyer-text">{review.text}</p>
          {SHOW_VERIFIED_LABEL && (
            <span className="buyer-verified">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <polygon points={SEAL_POINTS} />
                <path
                  d="M7.4 12.2l3.1 3.1 6.1-6.5"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Compra verificada
            </span>
          )}
        </article>
      ))}
      </div>

      <div className="buyer-dots">
        {BUYER_REVIEWS.map((review, index) => (
          <button
            type="button"
            key={review.name}
            className={index === active ? 'buyer-dot active' : 'buyer-dot'}
            aria-label={`Ver la reseña de ${review.name}`}
            aria-current={index === active}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The three lines shown under the price. These used to come from the Shopify
 * product description, which still holds five; keeping them here is what makes
 * the page show exactly three. Edit them here, not in the admin — the admin
 * copy now only feeds the SEO description.
 */
const SELLING_POINTS = [
  {icon: '🎁', text: 'El detalle perfecto para esa persona especial'},
  {icon: '🎵', text: 'Tu canción, sus fotos, su sonrisa'},
  {icon: '🎨', text: 'Personaliza tu Música desde tu Casa'},
];

const steps = [
  {
    number: '01',
    title: 'Envía tus fotos',
    text: 'Tras tu compra recibirás un correo. Envíanos tus fotos favoritas y las convertimos en vinilos.',
  },
  {
    number: '02',
    title: 'Elige tus canciones',
    text: 'Conecta el reproductor por USB y arrastra tus MP3 a las carpetas numeradas.',
  },
  {
    number: '03',
    title: 'Apoya el vinilo y suena',
    text: 'Cada vinilo lleva un chip NFC: al colocarlo sobre el reproductor empieza a sonar su canción.',
  },
];


const faqs = [
  {
    q: '¿Qué diferencia hay entre Vynilia y Vynilia Pro?',
    a: 'Las dos te dejan poner tus propias canciones. Vynilia incluye 4 vinilos, envío estándar y 30 días de garantía. Vynilia Pro incluye 9 vinilos, envío express gratis y garantía premium de 60 días. Son 5 € de diferencia.',
  },
  {
    q: '¿Cómo subo mis canciones?',
    a: 'Conecta el reproductor a tu ordenador con el cable USB incluido: verás carpetas numeradas y arrastras un MP3 a cada una. Funciona igual en Vynilia y en Vynilia Pro.',
  },
  {
    q: '¿Cómo sabe qué canción poner?',
    a: 'Cada vinilo lleva un chip NFC asociado a una carpeta. Al apoyarlo sobre el reproductor, suena la canción de esa carpeta.',
  },
  {
    q: '¿Cuánto puede durar cada canción?',
    a: 'Hasta 60 minutos por pista, así que también puedes usarlo para audios, dedicatorias o listas largas.',
  },
  {
    q: '¿Puedo añadir más vinilos después?',
    a: 'Sí. Escríbenos y te preparamos vinilos adicionales con las fotos que nos envíes.',
  },
  {
    q: '¿Cuánto tarda en llegar?',
    a: 'Preparamos tu pedido personalizado en 1 a 3 días hábiles y la entrega tarda entre 3 y 5 días hábiles.',
  },
];

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `Vynilia | ${data?.product?.title ?? 'Producto'}`},
    {
      name: 'description',
      content:
        data?.product?.seo?.description ?? data?.product?.description ?? '',
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return {...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}, storeReviews] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
    // Reviews customers wrote through the form, once published in the admin.
    // The seeded ones stay until there are enough real ones to stand alone.
    loadStoreReviews(storefront, handle),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {product, reviews: [...storeReviews, ...seedReviews]};
}

export default function ProductPage({loaderData}: Route.ComponentProps) {
  const {product, reviews} = loaderData;
  const {open} = useAside();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  }).filter((option) => !HIDDEN_OPTIONS.includes(option.name.toLowerCase()));

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openPanel, setOpenPanel] = useState<string | null>('includes');
  const [confetti, setConfetti] = useState<CSSProperties[]>([]);

  const isPro = selectedVariant?.selectedOptions?.some((option) =>
    isProValue(option.value),
  );
  const tierKey: TierKey = isPro ? 'pro' : 'base';
  const tier = TIERS[tierKey];
  const infoPanels = buildInfoPanels(tier);

  const images = product.images.nodes;
  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const discount =
    price && compareAtPrice
      ? Math.round(
          (1 - Number(price.amount) / Number(compareAtPrice.amount)) * 100,
        )
      : 0;

  const triggerConfetti = () => {
    const pieces = Array.from({length: 18}, (_, index) => ({
      left: `${Math.random() * 90 + 5}%`,
      top: '8%',
      background: ['#7a4a32', '#c98b5e', '#e8d9c5', '#1a1a1a', '#a9714c'][
        index % 5
      ],
      animationDelay: `${(index % 6) * 0.08}s`,
      animationDuration: `${0.8 + Math.random() * 0.8}s`,
      width: '10px',
      height: '10px',
      position: 'fixed' as const,
      borderRadius: '2px',
      opacity: 0.9,
      pointerEvents: 'none' as const,
    }));

    setConfetti(pieces);
    window.setTimeout(() => setConfetti([]), 1200);
  };

  const onAddToCart = () => {
    triggerConfetti();
    open('cart');
  };

  const cartLines = selectedVariant
    ? [{merchandiseId: selectedVariant.id, quantity, selectedVariant}]
    : [];

  const soldOut = !selectedVariant?.availableForSale;

  return (
    <>
      <div className="vynilia-page product-view">
        <div className="product-main">
          <div className="gallery">
            <div className="gallery-main">
              {images[selectedImage] ? (
                <Image
                  data={images[selectedImage]}
                  alt={images[selectedImage].altText || product.title}
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              ) : null}
            </div>
            {images.length > 1 && (
              <div className="gallery-thumbnails">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    aria-label={`Ver imagen ${index + 1}`}
                    className={
                      selectedImage === index ? 'thumbnail active' : 'thumbnail'
                    }
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image
                      data={image}
                      alt={image.altText || `${product.title} ${index + 1}`}
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <OrdersBadge />

            <h1 className="product-title">
              {product.title}
              {/* Guarded so the mark is not doubled if the Shopify title
                  itself ever gains one. */}
              {!/[™®]/.test(product.title) && (
                <span className="trademark">™</span>
              )}
            </h1>

            <a className="product-rating" href="#resenas">
              <div className="stars">★★★★★</div>
              <span className="rating-text">
                (+{REVIEW_COUNT} Reseñas Verificadas
                <svg
                  className="rating-verified"
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="11" fill="currentColor" />
                  <path
                    d="M7 12.5l3.2 3.2L17 9"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                )
              </span>
            </a>

            <div className="price-row">
              {price ? (
                <span className="price-now">
                  <Money data={price} as="span" />
                </span>
              ) : null}
              {compareAtPrice ? (
                <s className="price-was">
                  <Money data={compareAtPrice} as="span" />
                </s>
              ) : null}
              {discount > 0 && (
                <span className="save-badge">AHORRAS UN {discount}%</span>
              )}
            </div>

            <LiveViewers />

            <ul className="selling-points">
              {SELLING_POINTS.map((point) => (
                <li key={point.text}>
                  <span aria-hidden="true">{point.icon}</span>
                  {point.text}
                </li>
              ))}
            </ul>

            <div className="product-options">
              {productOptions.map((option) =>
                isTierOption(option) ? (
                  <BundleSelector key={option.name} option={option} />
                ) : (
                  <ProductOption key={option.name} option={option} />
                ),
              )}
            </div>

            <div className="buy-row">
              <div className="quantity-selector">
                <button
                  type="button"
                  aria-label="Restar unidad"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  aria-label="Sumar unidad"
                  onClick={() => setQuantity((value) => Math.min(10, value + 1))}
                >
                  +
                </button>
              </div>
              <AddToCartButton
                disabled={soldOut}
                onClick={onAddToCart}
                lines={cartLines}
              >
                {soldOut ? 'Agotado' : 'Agregar al carrito'}
              </AddToCartButton>
            </div>

            <BuyerReviews />

            <div className="info-panels">
              {infoPanels.map((panel) => {
                const isOpen = openPanel === panel.id;
                return (
                  <div
                    className={isOpen ? 'info-panel open' : 'info-panel'}
                    key={panel.id}
                  >
                    <button
                      type="button"
                      className="info-panel-header"
                      aria-expanded={isOpen}
                      aria-controls={`panel-${panel.id}`}
                      onClick={() => setOpenPanel(isOpen ? null : panel.id)}
                    >
                      <svg
                        className="info-panel-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        {panelIcons[panel.icon]}
                      </svg>
                      <span className="info-panel-title">{panel.title}</span>
                      <svg
                        className="info-panel-chevron"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="info-panel-body" id={`panel-${panel.id}`}>
                        {panel.body}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <CustomerVideos />

        <section className="compare-section">
          <h2 className="section-title">⚖️ Compara las dos versiones</h2>
          <div className="compare-grid">
            <div className={tierKey === 'base' ? 'compare-card active' : 'compare-card'}>
              <h3>Vynilia</h3>
              <ul>
                <li>
                  <strong>{TIERS.base.discs} vinilos</strong> con vuestras fotos
                </li>
                <li>{TIERS.base.music}</li>
                <li>{TIERS.base.shipping}</li>
                <li>{TIERS.base.guaranteeLabel}</li>
              </ul>
            </div>
            <div className={tierKey === 'pro' ? 'compare-card active' : 'compare-card'}>
              <span className="compare-flag">Más elegida</span>
              <h3>Vynilia Pro</h3>
              <ul>
                <li>
                  <strong>{TIERS.pro.discs} vinilos</strong> con vuestras fotos
                </li>
                <li>{TIERS.pro.music}</li>
                <li>
                  <strong>{TIERS.pro.shipping}</strong>
                </li>
                <li>
                  <strong>{TIERS.pro.guaranteeLabel}</strong>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="tagline-banner">
          <p>No es un altavoz.</p>
          <h2>Es un recuerdo.</h2>
        </section>

        <section className="steps-section">
          <h2 className="section-title">🎧 Cómo funciona</h2>
          <div className="steps-grid">
            {steps.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <ProductReviews reviews={reviews} productHandle={product.handle} />

      </div>

      <FaqPanel
        items={faqs}
        openIndex={openFaq}
        onToggle={(index) => setOpenFaq(openFaq === index ? null : index)}
      />

      <div className="vynilia-page">
        <section className="trust-band">
          <div>
            <strong>Hasta 60 días</strong>
            <span>de garantía</span>
          </div>
          <div>
            <strong>+539</strong>
            <span>clientes satisfechos</span>
          </div>
          <div>
            <strong>4.8/5</strong>
            <span>valoración media</span>
          </div>
          <div>
            <strong>Gratis</strong>
            <span>envío con la Pro</span>
          </div>
        </section>

        <div className="confetti-layer" aria-hidden="true">
          {confetti.map((piece, index) => (
            <span
              key={`${piece.left}-${index}`}
              className="confetti-piece"
              style={piece}
            />
          ))}
        </div>
      </div>

      <div className="sticky-buy-bar">
        <div className="sticky-info">
          <strong>{product.title}</strong>
          <span>
            {price && <Money data={price} as="span" />}{' '}
            {compareAtPrice && (
              <s>
                <Money data={compareAtPrice} as="span" />
              </s>
            )}
          </span>
        </div>
        <AddToCartButton
          disabled={soldOut}
          onClick={onAddToCart}
          lines={cartLines}
        >
          {soldOut ? 'Agotado' : 'Agregar al carrito'}
        </AddToCartButton>
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </>
  );
}

/** Wave that carves the page background into the dark FAQ panel. */
function FaqWave({side}: {side: 'top' | 'bottom'}) {
  return (
    <svg
      className={`faq-wave faq-wave-${side}`}
      viewBox="0 0 1440 72"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className="faq-wave-ghost"
        d="M0,0 H1440 V30 C1180,72 940,10 620,34 C420,49 200,62 0,54 Z"
      />
      <path
        className="faq-wave-front"
        d="M0,0 H1440 V16 C1180,58 940,-4 620,20 C420,35 200,48 0,40 Z"
      />
    </svg>
  );
}

function FaqPanel({
  items,
  openIndex,
  onToggle,
}: {
  items: Array<{q: string; a: string}>;
  openIndex: number | null;
  onToggle: (index: number) => void;
}) {
  return (
    <section className="faq-panel">
      <FaqWave side="top" />

      <div className="faq-inner">
        <h2 className="faq-heading">Preguntas Frecuentes</h2>
        <div className="faq-list">
          {items.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div className={open ? 'faq-item open' : 'faq-item'} key={faq.q}>
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={open}
                  onClick={() => onToggle(index)}
                >
                  <span className="faq-mark" aria-hidden="true">
                    ?
                  </span>
                  <span className="faq-text">{faq.q}</span>
                  <svg
                    className="faq-chevron"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {open && <p className="faq-answer">{faq.a}</p>}
              </div>
            );
          })}
        </div>
      </div>

      <FaqWave side="bottom" />
    </section>
  );
}

/**
 * The tier option is the one that offers a "Pro" value. Detecting it this way
 * means the bundle UI follows the offer even if the option gets renamed, and any
 * future option (a colour, say) still falls back to the plain button renderer.
 */
function isTierOption(option: MappedProductOptions) {
  return option.optionValues.some((value) => isProValue(value.name));
}

/** Stacked bundle cards: radio, name, price, and the Pro tier's extras. */
function BundleSelector({option}: {option: MappedProductOptions}) {
  const navigate = useNavigate();

  return (
    <fieldset className="bundle-list">
      <legend className="sr-only">{option.name}</legend>
      {option.optionValues.map((optionValue) => {
        const {name, variantUriQuery, selected, exists, variant} = optionValue;
        const tier = TIERS[isProValue(name) ? 'pro' : 'base'];
        const compareAt = variant?.compareAtPrice;

        return (
          <label
            key={option.name + name}
            className={selected ? 'bundle-card selected' : 'bundle-card'}
          >
            <input
              className="sr-only"
              type="radio"
              name={option.name}
              value={name}
              checked={selected}
              disabled={!exists}
              onChange={() => {
                void navigate(`?${variantUriQuery}`, {
                  replace: true,
                  preventScrollReset: true,
                });
              }}
            />
            <span className="bundle-radio" aria-hidden="true" />

            <span className="bundle-body">
              <span className="bundle-title">{name}</span>
              <span className="bundle-subtitle">{tier.subtitle}</span>
            </span>

            <span className="bundle-price">
              {variant?.price && <Money data={variant.price} as="span" />}
              {compareAt && (
                <s>
                  <Money data={compareAt} as="span" />
                </s>
              )}
            </span>

            {tier.extras.length > 0 && (
              <span className="bundle-extras">
                {tier.extras.map((extra) => (
                  <span className="bundle-extra" key={extra.label}>
                    <span className="bundle-extra-icon" aria-hidden="true">
                      {extra.icon}
                    </span>
                    <span className="bundle-extra-label">{extra.label}</span>
                  </span>
                ))}
              </span>
            )}
          </label>
        );
      })}
    </fieldset>
  );
}

function ProductOption({option}: {option: MappedProductOptions}) {
  const navigate = useNavigate();
  const selectedValue = option.optionValues.find((value) => value.selected);

  return (
    <div className="option-group" key={option.name}>
      <span className="option-label">
        {option.name}: <span>{selectedValue?.name}</span>
      </span>
      <div className="option-buttons versions">
        {option.optionValues.map((optionValue) => {
          const {
            name,
            handle,
            variantUriQuery,
            selected,
            available,
            exists,
            isDifferentProduct,
            variant,
          } = optionValue;

          const tier = TIERS[isProValue(name) ? 'pro' : 'base'];
          const className = [
            'option-btn',
            selected ? 'active' : '',
            available ? '' : 'unavailable',
          ]
            .filter(Boolean)
            .join(' ');

          const content = (
            <>
              <strong>{name}</strong>
              <small>{tier.blurb}</small>
              {variant?.price && (
                <span className="option-price">
                  <Money data={variant.price} as="span" />
                </span>
              )}
            </>
          );

          // A value that maps to another product needs a real navigation.
          if (isDifferentProduct) {
            return (
              <Link
                key={option.name + name}
                className={className}
                prefetch="intent"
                preventScrollReset
                replace
                to={`/products/${handle}?${variantUriQuery}`}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={option.name + name}
              type="button"
              className={className}
              disabled={!exists}
              onClick={() => {
                if (!selected) {
                  void navigate(`?${variantUriQuery}`, {
                    replace: true,
                    preventScrollReset: true,
                  });
                }
              }}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 20) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(
      selectedOptions: $selectedOptions
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
