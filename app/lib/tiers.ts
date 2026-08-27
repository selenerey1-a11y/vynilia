/**
 * Shared vocabulary for the two-tier offer (Vynilia / Vynilia Pro). The product
 * page and the cart both need to recognise the Pro tier and hide the retired
 * options, so the rules live here instead of being duplicated.
 */

/**
 * Options we never render. "Artista" is being retired from the Shopify product;
 * hiding it keeps the UI correct while the variants still exist, and the list
 * becomes a no-op once the option is deleted in the admin.
 */
export const HIDDEN_OPTIONS = ['artista'];

/**
 * How each tier is named in the storefront. The Shopify option values are still
 * "Standard" and "Pro"; branding them here means the customer sees one name on
 * the bundle card, in the comparison and in the cart, and renaming the values in
 * the admin later changes nothing.
 */
export const TIER_NAMES = {
  base: 'Vynilia™',
  pro: 'Vynilia™ Pro',
} as const;

/** The displayed name for a tier option value. */
export function tierLabel(value?: string | null) {
  return isProValue(value) ? TIER_NAMES.pro : TIER_NAMES.base;
}

/**
 * The option that carries the two tiers. The cart only has name/value pairs, so
 * it needs this to know which value to brand.
 */
export function isTierOptionName(name: string) {
  return /versi[óo]n/i.test(name);
}

/** The premium tier is whatever option value reads as "Pro", before or after the rename. */
export function isProValue(value?: string | null) {
  return /\bpro\b/i.test(value ?? '');
}

/**
 * Shopify invents a `Title: Default Title` option for products without real
 * options. It is noise everywhere it shows up.
 */
export function isDisplayableOption(option: {name: string; value: string}) {
  if (HIDDEN_OPTIONS.includes(option.name.toLowerCase())) return false;
  return !(option.name === 'Title' && option.value === 'Default Title');
}
