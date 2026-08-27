import {useState} from 'react';
import {useFetcher} from 'react-router';
import {REVIEW_LIMITS} from '~/data/reviews';

const STARS = [1, 2, 3, 4, 5] as const;

/**
 * Storefront-side "Escribir una reseña" form. It posts to `/api/reviews`, which
 * stores the review in Shopify as a draft metaobject — so nothing appears on
 * the page until it is published in the admin.
 */
export function ReviewForm({
  productHandle,
  onClose,
}: {
  productHandle: string;
  onClose: () => void;
}) {
  const fetcher = useFetcher<{ok: boolean; error?: string}>();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  const sending = fetcher.state !== 'idle';

  if (fetcher.data?.ok) {
    return (
      <div className="rv-form rv-form-done">
        <p className="rv-form-thanks">¡Gracias por tu reseña! 🎉</p>
        <p className="rv-form-note">
          La revisamos y la publicamos en esta página en cuanto la aprobemos.
        </p>
        <button type="button" className="rv-form-cancel" onClick={onClose}>
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <fetcher.Form method="post" action="/api/reviews" className="rv-form">
      <input type="hidden" name="productHandle" value={productHandle} />
      <input type="hidden" name="rating" value={rating} />

      <div className="rv-form-row">
        <span className="rv-form-label" id="rv-rating-label">
          Tu valoración
        </span>
        <div
          className="rv-form-stars"
          role="group"
          aria-labelledby="rv-rating-label"
        >
          {STARS.map((star) => (
            <button
              type="button"
              key={star}
              className={star <= rating ? 'rv-form-star on' : 'rv-form-star'}
              aria-label={`${star} de 5 estrellas`}
              aria-pressed={star === rating}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="rv-form-row">
        <label className="rv-form-label" htmlFor="rv-author">
          Tu nombre
        </label>
        <input
          id="rv-author"
          name="author"
          type="text"
          required
          maxLength={REVIEW_LIMITS.author}
          placeholder="María G."
          autoComplete="name"
        />
      </div>

      <div className="rv-form-row">
        <label className="rv-form-label" htmlFor="rv-variant">
          Versión que compraste <span className="rv-form-optional">(opcional)</span>
        </label>
        <select id="rv-variant" name="variant" defaultValue="">
          <option value="">Prefiero no decirlo</option>
          <option value="Vynilia">Vynilia</option>
          <option value="Vynilia Pro">Vynilia Pro</option>
        </select>
      </div>

      <div className="rv-form-row">
        <label className="rv-form-label" htmlFor="rv-text">
          Tu reseña
        </label>
        <textarea
          id="rv-text"
          name="text"
          required
          rows={5}
          minLength={REVIEW_LIMITS.minText}
          maxLength={REVIEW_LIMITS.text}
          placeholder="¿Qué tal la experiencia? ¿A quién se lo regalaste?"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <span className="rv-form-count">
          {text.length}/{REVIEW_LIMITS.text}
        </span>
      </div>

      {/* Honeypot: hidden from people, filled in by bots. */}
      <input
        className="rv-form-hp"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {fetcher.data?.error && (
        <p className="rv-form-error" role="alert">
          {fetcher.data.error}
        </p>
      )}

      <div className="rv-form-actions">
        <button type="submit" className="rv-form-send" disabled={sending}>
          {sending ? 'Enviando…' : 'Enviar reseña'}
        </button>
        <button type="button" className="rv-form-cancel" onClick={onClose}>
          Cancelar
        </button>
      </div>

      <p className="rv-form-note">
        Las reseñas se publican tras una revisión. No pedimos tu correo ni se
        guarda ningún dato de contacto.
      </p>
    </fetcher.Form>
  );
}
