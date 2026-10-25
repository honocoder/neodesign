export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

export type RateLimiter = {
  attempt(key: string, now: number): RateLimitResult;
};

/**
 * Fenêtre glissante en mémoire.
 * Sur Vercel, chaque instance de la fonction a son propre compteur.
 */
export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    attempt(key, now) {
      if (hits.size > 2000) {
        for (const [storedKey, stamps] of hits) {
          if (stamps.every((stamp) => now - stamp >= windowMs)) hits.delete(storedKey);
        }
      }

      const fresh = (hits.get(key) ?? []).filter((stamp) => now - stamp < windowMs);
      if (fresh.length >= limit) {
        hits.set(key, fresh);
        const retryAfterSeconds = Math.max(1, Math.ceil((fresh[0] + windowMs - now) / 1000));
        return { ok: false, retryAfterSeconds };
      }

      fresh.push(now);
      hits.set(key, fresh);
      return { ok: true };
    },
  };
}
