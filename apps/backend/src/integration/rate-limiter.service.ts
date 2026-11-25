import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const WINDOW_MS = 60_000;
const SWEEP_EVERY = 500;

/**
 * Counts requests per API key in a fixed one-minute window. State lives in this
 * process only, so with multiple replicas the effective limit is the configured
 * value times the replica count.
 */
@Injectable()
export class RateLimiterService {
  private readonly counters = new Map<string, { count: number; resetAt: number }>();
  private sinceLastSweep = 0;

  constructor(private readonly config: ConfigService) {}

  consume(key: string) {
    const limit = this.limit;
    if (limit <= 0) {
      return { allowed: true, remaining: Number.POSITIVE_INFINITY, retryAfter: 0 };
    }

    const now = Date.now();
    this.sweep(now);

    const current = this.counters.get(key);
    if (!current || current.resetAt <= now) {
      this.counters.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return { allowed: true, remaining: limit - 1, retryAfter: 0 };
    }

    current.count += 1;
    const retryAfter = Math.ceil((current.resetAt - now) / 1000);

    return {
      allowed: current.count <= limit,
      remaining: Math.max(0, limit - current.count),
      retryAfter,
    };
  }

  private get limit() {
    return Number(this.config.get<string>('INTEGRATION_RATE_LIMIT_PER_MINUTE') ?? 60);
  }

  private sweep(now: number) {
    if (++this.sinceLastSweep < SWEEP_EVERY) {
      return;
    }

    this.sinceLastSweep = 0;
    for (const [key, value] of this.counters) {
      if (value.resetAt <= now) {
        this.counters.delete(key);
      }
    }
  }
}
