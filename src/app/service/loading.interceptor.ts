import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { LoadingService } from './loading.service';

/**
 * HTTP-Interceptor, der bei jedem ausgehenden Request den globalen
 * Loading-Zähler erhöht und beim Abschluss (Erfolg/Fehler/Abbruch)
 * wieder verringert. Steuert damit den globalen Spinner.
 */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private loadingService = inject(LoadingService);

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    this.loadingService.start();
    return next.handle(request).pipe(finalize(() => this.loadingService.stop()));
  }
}
