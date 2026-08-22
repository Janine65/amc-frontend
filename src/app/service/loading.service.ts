import { Injectable, computed, signal } from '@angular/core';

/**
 * Global loading state service.
 *
 * Zählt aktive HTTP-Requests. Sobald mindestens ein Request läuft,
 * ist `isLoading()` true und der globale Spinner wird angezeigt.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly activeRequests = signal(0);

  readonly count = this.activeRequests.asReadonly();
  readonly isLoading = computed(() => this.activeRequests() > 0);

  start(): void {
    this.activeRequests.update((n) => n + 1);
  }

  stop(): void {
    this.activeRequests.update((n) => (n > 0 ? n - 1 : 0));
  }

  reset(): void {
    this.activeRequests.set(0);
  }
}
