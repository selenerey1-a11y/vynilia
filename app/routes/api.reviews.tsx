import type {Route} from './+types/api.reviews';
import {REVIEW_LIMITS} from '~/data/reviews';
import {submitReview} from '~/lib/reviews.server';

type ActionResponse = {ok: boolean; error?: string};

function json(body: ActionResponse, status = 200) {
  return Response.json(body, {status});
}

/** Nothing to GET here: the route only accepts the form POST. */
export async function loader() {
  return json({ok: false, error: 'Método no permitido.'}, 405);
}

/**
 * Receives the storefront review form. The reply is deliberately vague about
 * *why* Shopify refused a review — the browser only needs to know whether to
 * thank the customer or ask them to try again.
 */
export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return json({ok: false, error: 'Método no permitido.'}, 405);
  }

  const form = await request.formData();

  // Honeypot: hidden from real people, irresistible to bots. Answering "ok"
  // keeps the bot from retrying with a different shape.
  if (String(form.get('website') ?? '').trim()) {
    return json({ok: true});
  }

  const author = String(form.get('author') ?? '').trim();
  const text = String(form.get('text') ?? '').trim();
  const variant = String(form.get('variant') ?? '').trim();
  const rating = Number(form.get('rating'));
  const productHandle = String(form.get('productHandle') ?? '').trim();

  if (!author || author.length > REVIEW_LIMITS.author) {
    return json({ok: false, error: 'Escribe tu nombre.'}, 400);
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return json({ok: false, error: 'Elige de 1 a 5 estrellas.'}, 400);
  }
  if (text.length < REVIEW_LIMITS.minText) {
    return json({ok: false, error: 'Cuéntanos un poco más (mínimo 10 caracteres).'}, 400);
  }
  if (text.length > REVIEW_LIMITS.text) {
    return json({ok: false, error: 'La reseña es demasiado larga.'}, 400);
  }
  if (!productHandle) {
    return json({ok: false, error: 'Falta el producto.'}, 400);
  }

  const result = await submitReview(context.env, {
    productHandle,
    author,
    rating,
    text,
    variant: variant.slice(0, REVIEW_LIMITS.variant) || undefined,
  });

  if (!result.ok) {
    return json(
      {
        ok: false,
        error:
          'No hemos podido guardar tu reseña ahora mismo. Inténtalo de nuevo en unos minutos.',
      },
      502,
    );
  }

  return json({ok: true});
}
