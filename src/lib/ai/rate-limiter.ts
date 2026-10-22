/**
 * Rate Limiter for NVIDIA Nemotron API (Free Tier Limit: 40 RPM)
 * Maintains a 60-second sliding window with a safety threshold (max 35 requests/min).
 */
class RateLimiter {
  private timestamps: number[] = [];
  private readonly maxRequestsPerMinute: number = 35; // safe threshold below 40 RPM
  private readonly windowMs: number = 60 * 1000;

  async throttle(): Promise<void> {
    const now = Date.now();
    // Drop timestamps older than the sliding window
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

    if (this.timestamps.length >= this.maxRequestsPerMinute) {
      const oldest = this.timestamps[0];
      const waitTime = this.windowMs - (now - oldest) + 500; // +500ms safety margin
      console.warn(`⏳ Preemptive rate limiter triggered. Waiting ${Math.ceil(waitTime / 1000)}s...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return this.throttle();
    }

    this.timestamps.push(Date.now());
  }

  getCurrentUsage(): { count: number; max: number; percent: number } {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    return {
      count: this.timestamps.length,
      max: 40,
      percent: Math.round((this.timestamps.length / 40) * 100),
    };
  }
}

export const rateLimiter = new RateLimiter();
