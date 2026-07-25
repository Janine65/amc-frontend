import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { environment } from '@environments/environment';
import { User } from '@app/models';
import { AccountService, RetDataUser } from './account.service';
import { LayoutService } from './app.layout.service';

describe('AccountService', () => {
  let service: AccountService;
  let httpMock: HttpTestingController;
  let router: Router;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AccountService,
        LayoutService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    // AccountService.constructor startet einen 60s-Timer -> flush aller anhängigen Requests
    httpMock.match(() => true).forEach((req) => req.flush({ data: {}, message: '', type: 'ok', cookie: { accessToken: '', refreshToken: '' } }));
    httpMock.verify();
    sessionStorage.clear();
  });

  it('sollte erzeugbar sein', () => {
    expect(service).toBeTruthy();
  });

  describe('userValue / isLogged', () => {
    it('ist initial ein leerer User', () => {
      expect(service.userValue).toBeInstanceOf(User);
      expect(service.userValue.id).toBeFalsy();
    });

    it('isLogged() ist false ohne User', () => {
      expect(service.isLogged()).toBe(false);
    });

    it('stellt User aus sessionStorage wieder her', () => {
      const stored = { id: 99, email: 'x@y.z', token: 'tok' };
      sessionStorage.setItem('user', JSON.stringify(stored));
      const svc = TestBed.runInInjectionContext(() => new AccountService());
      expect(svc.userValue.id).toBe(99);
    });
  });

  describe('login()', () => {
    it('POSTet Credentials und speichert Token', () => {
      const retData: RetDataUser = {
        data: { id: 1, email: 'a@b.c' } as unknown as object,
        message: '',
        type: 'ok',
        cookie: { accessToken: 'ACCESS', refreshToken: 'REFRESH' },
      };

      let result: User | undefined;
      service.login('a@b.c', 'pw').subscribe((u) => (result = u));

      const req = httpMock.expectOne(apiUrl + '/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'a@b.c', password: 'pw' });
      req.flush(retData);

      expect(result?.id).toBe(1);
      expect(service.userValue.token).toBe('ACCESS');
      expect(sessionStorage.getItem('user')).toContain('a@b.c');
    });
  });

  describe('logout()', () => {
    it('entfernt User aus sessionStorage und navigiert nach /', async () => {
      sessionStorage.setItem('user', JSON.stringify({ id: 1, token: 't' }));
      const navSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

      await service.logout();

      expect(sessionStorage.getItem('user')).toBeNull();
      expect(service.userValue.id).toBeFalsy();
      expect(navSpy).toHaveBeenCalledWith(['/']);
    });
  });

  describe('register()', () => {
    it('POSTet neuen User an /user', () => {
      const user = new User();
      user.email = 'neu@x.y';
      service.register(user).subscribe();
      const req = httpMock.expectOne(apiUrl + '/user');
      expect(req.request.method).toBe('POST');
      req.flush({ data: {}, message: '', type: 'ok' });
    });
  });

  describe('getAll() / getById()', () => {
    it('GET /user', () => {
      service.getAll().subscribe();
      const req = httpMock.expectOne(apiUrl + '/user');
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], message: '', type: 'ok' });
    });

    it('GET /user/:id', () => {
      service.getById(42).subscribe();
      const req = httpMock.expectOne(apiUrl + '/user/42');
      expect(req.request.method).toBe('GET');
      req.flush({ data: {}, message: '', type: 'ok' });
    });
  });

  it('HttpClient ist injizierbar', () => {
    expect(TestBed.inject(HttpClient)).toBeTruthy();
  });
});
