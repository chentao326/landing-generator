const store = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  ip: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetTime) {
    store.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, reset: entry.resetTime };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, reset: entry.resetTime };
}
