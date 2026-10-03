/**
 * Pluralisation helpers.
 *
 * Counts are rendered all over the product ("1 results" reads as a bug), so the
 * rule lives in one place. `plural` handles the regular English -s case; use
 * `pluralWith` when the singular and plural words differ.
 */

/** "1 result" / "2 results" */
export function plural(
  count: number,
  singular: string,
  pluralForm = `${singular}s`
): string {
  return count === 1 ? singular : pluralForm;
}

/** "1 result" / "2 results" — count included, for inline copy. */
export function countOf(
  count: number,
  singular: string,
  pluralForm = `${singular}s`
): string {
  return `${count} ${plural(count, singular, pluralForm)}`;
}

/** True when the count is exactly one — for `aria-label` and test assertions. */
export function isSingular(count: number): boolean {
  return count === 1;
}