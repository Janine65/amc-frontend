import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountService } from '@app/service';
import { AlertService } from './alert.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private accountService = inject(AccountService);
  private alertService = inject(AlertService);

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if ([401, 403].includes(err.status) && this.accountService.userValue) {
          // auto logout if 401 or 403 response returned from api
          // keepAfterRouteChange: Meldung übersteht die Navigation des Logouts
          this.alertService.error('Sitzung abgelaufen – bitte neu anmelden.', {
            keepAfterRouteChange: true,
            autoClose: true,
          });
          this.accountService.logout();
        }

        const error = err.error?.message || err.statusText;
        console.error(err);
        return throwError(() => new Error(error));
      }),
    );
  }
}
