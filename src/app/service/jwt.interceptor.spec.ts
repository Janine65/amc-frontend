import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '@environments/environment';
import { User } from '@app/models';
import { AccountService } from './account.service';
import { JwtInterceptor } from './jwt.interceptor';
import { LayoutService } from './app.layout.service';

describe('JwtInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let accountService: AccountService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideRouter([]),
        AccountService,
        LayoutService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    accountService = TestBed.inject(AccountService);
  });

  afterEach(() => {
    httpMock.match(() => true).forEach((req) => {
      if (!req.cancelled) {
        req.flush({});
      }
    });
    sessionStorage.clear();
  });

  const setUser = (token: string | undefined): void => {
    const u = new User();
    u.id = 1;
    if (token) u.token = token;
    accountService.userSubject.next(u);
  };

  it('setzt Authorization-Header, wenn User eingeloggt und URL === apiUrl', () => {
    setUser('MY_TOKEN');
    http.get(environment.apiUrl + '/foo').subscribe();
    const req = httpMock.expectOne(environment.apiUrl + '/foo');
    expect(req.request.headers.get('Authorization')).toBe('Bearer MY_TOKEN');
    req.flush({});
  });

  it('setzt keinen Header, wenn kein User eingeloggt (kein Token)', () => {
    // default: leerer User ohne Token
    http.get(environment.apiUrl + '/foo').subscribe();
    const req = httpMock.expectOne(environment.apiUrl + '/foo');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('setzt keinen Header bei Nicht-API-URL', () => {
    setUser('X');
    http.get('https://andere-domain.example/foo').subscribe();
    const req = httpMock.expectOne('https://andere-domain.example/foo');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
