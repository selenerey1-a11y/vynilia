import {useMemo, useState} from 'react';
import type {Review} from '~/data/reviews';
import {ReviewForm} from '~/components/ReviewForm';

const RATINGS = [5, 4, 3, 2, 1] as const;

/** Cards rendered before the customer asks for more. */
const PAGE_SIZE = 8;

function Stars({value, size = 16}: {value: number; size?: number}) {
  return (
    <span
      className="rv-stars"
      style={{fontSize: `${size}px`}}
      aria-label={`${value} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((step) => (
        <span key={step} className={step <= value ? 'rv-star on' : 'rv-star'}>
          ★
        </span>
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export function ProductReviews({
  reviews,
  productHandle,
}: {
  reviews: Review[];
  productHandle: string;
}) {
  const [open, setOpen] = useState(true);
  const [filter, setFilter] = useState<number | null>(null);
  const [writing, setWriting] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);

  // Changing the star filter starts the list over, so "ver más" never carries
  // a page count from the previous filter.
  function applyFilter(value: number | null) {
    setFilter(value);
    setShown(PAGE_SIZE);
  }

  // Average and distribution are derived, never hardcoded, so the headline
  // figure always matches the reviews actually listed below it.
  const {total, average, distribution} = useMemo(() => {
    const counts = new Map<number, number>(RATINGS.map((r) => [r, 0]));
    for (const review of reviews) {
      counts.set(review.rating, (counts.get(review.rating) ?? 0) + 1);
    }
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return {
      total: reviews.length,
      average: reviews.length ? sum / reviews.length : 0,
      distribution: counts,
    };
  }, [reviews]);

  const visible = filter
    ? reviews.filter((review) => review.rating === filter)
    : reviews;

  if (!total) {
    return (
      <section className="rv-section" id="resenas">
        <div className="rv-empty">
          <Stars value={0} size={22} />
          <h2>Todavía no hay reseñas</h2>
          <p>Sé la primera persona en contar su experiencia con Vynilia.</p>
          <button
            type="button"
            className="rv-write"
            onClick={() => setWriting(true)}
          >
            Escribir una reseña
          </button>
        </div>

        {writing && (
          <ReviewForm
            productHandle={productHandle}
            onClose={() => setWriting(false)}
          />
        )}
      </section>
    );
  }

  return (
    <section className="rv-section" id="resenas">
      <div className="rv-head">
        <button
          type="button"
          className="rv-head-toggle"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <Stars value={Math.round(average)} size={22} />
          <span className="rv-head-count">
            {total} {total === 1 ? 'Reseña' : 'Reseñas'}
          </span>
          <svg
            className={open ? 'rv-chevron open' : 'rv-chevron'}
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {filter && (
          <button
            type="button"
            className="rv-filter-clear"
            onClick={() => applyFilter(null)}
          >
            Quitar filtro ✕
          </button>
        )}

        <button
          type="button"
          className="rv-write"
          onClick={() => setWriting((value) => !value)}
        >
          Escribir una reseña
        </button>
      </div>

      {writing && (
        <ReviewForm
          productHandle={productHandle}
          onClose={() => setWriting(false)}
        />
      )}

      {open && (
        <div className="rv-summary">
          <div className="rv-average">
            <span className="rv-average-star" aria-hidden="true">
              ★
            </span>
            <span className="rv-average-value">
              {average.toFixed(1).replace('.', ',')}
            </span>
          </div>

          <div className="rv-bars">
            {RATINGS.map((rating) => {
              const count = distribution.get(rating) ?? 0;
              const pct = total ? (count / total) * 100 : 0;
              return (
                <button
                  type="button"
                  className={
                    filter === rating ? 'rv-bar-row active' : 'rv-bar-row'
                  }
                  key={rating}
                  disabled={!count}
                  aria-label={`Ver solo reseñas de ${rating} estrellas (${count})`}
                  onClick={() => applyFilter(filter === rating ? null : rating)}
                >
                  <Stars value={rating} />
                  <span className="rv-bar">
                    <span className="rv-bar-fill" style={{width: `${pct}%`}} />
                  </span>
                  <span className="rv-bar-count">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="rv-grid">
        {visible.slice(0, shown).map((review) => (
          <article className="rv-card" key={review.id}>
            <header className="rv-card-head">
              <span className="rv-author">{review.author}</span>
              {review.verified && (
                <span className="rv-verified">
                  <svg
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
                  Verificada
                </span>
              )}
            </header>

            <time className="rv-date" dateTime={review.date}>
              {formatDate(review.date)}
            </time>

            <Stars value={review.rating} />

            <p className="rv-text">{review.text}</p>

            {review.variant && (
              <p className="rv-variant">
                <span>Tipo de artículo:</span>
                {review.variant}
              </p>
            )}

            {review.image && (
              <img className="rv-photo" src={review.image} alt="" loading="lazy" />
            )}
          </article>
        ))}
      </div>

      {visible.length > shown && (
        <button
          type="button"
          className="rv-more"
          onClick={() => setShown((value) => value + PAGE_SIZE)}
        >
          Ver más reseñas ({visible.length - shown})
        </button>
      )}
    </section>
  );
}
