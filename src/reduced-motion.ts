/** `prefers-reduced-motion`, safe in SSR/JSDOM when `matchMedia` is unavailable. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    return mq?.matches === true;
  } catch {
    return false;
  }
}
