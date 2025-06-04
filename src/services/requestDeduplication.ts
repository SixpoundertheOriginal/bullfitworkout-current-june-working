
interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class RequestDeduplicationService {
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly maxCacheSize = 100;
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  async deduplicate<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: { ttl?: number; force?: boolean } = {}
  ): Promise<T> {
    const { ttl = this.defaultTTL, force = false } = options;

    // Check cache first
    if (!force) {
      const cached = this.getFromCache<T>(key);
      if (cached) {
        return cached;
      }
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending && !force) {
      return pending.promise;
    }

    // Create new request
    const promise = requestFn()
      .then((result) => {
        this.setCache(key, result, ttl);
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });

    return promise;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any, ttl: number): void {
    // Simple LRU: remove oldest if at capacity
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearPendingRequests(): void {
    this.pendingRequests.clear();
  }

  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      maxCacheSize: this.maxCacheSize
    };
  }
}

export const requestDeduplication = new RequestDeduplicationService();
