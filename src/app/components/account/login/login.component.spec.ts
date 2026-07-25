import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { commonTestProviders } from '@app/testing/test-providers';
import { LoginComponent } from './login.component';
import { AccountService, AlertService } from '@app/service';
import { AlertType, User } from '@app/models';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let accountService: AccountService;
  let alertService: AlertService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        ...commonTestProviders,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: { returnUrl: '/dashboard' } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    accountService = TestBed.inject(AccountService);
    alertService = TestBed.inject(AlertService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.loading()).toBe(false);
    expect(component.submitted()).toBe(false);
    expect(component.fg.get('email')?.value).toBe('');
    expect(component.fg.get('password')?.value).toBe('');
  });

  describe('onSubmit()', () => {
    it('navigiert nach erfolgreichem Login auf returnUrl', async () => {
      const loginSpy = jest.spyOn(accountService, 'login').mockReturnValue(of(new User()));
      const navSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

      component.fg.patchValue({ email: 'a@b.c', password: 'pw' });
      // Directives im Template setzen ggf. Errors – für den Logik-Test überschreiben wir das
      component.fg.setErrors(null);
      Object.defineProperty(component.fg, 'invalid', { get: () => false, configurable: true });
      component.onSubmit();

      expect(loginSpy).toHaveBeenCalledWith('a@b.c', 'pw');
      expect(component.submitted()).toBe(true);
      expect(component.loading()).toBe(true);
      await Promise.resolve();
      expect(navSpy).toHaveBeenCalledWith('/dashboard');
    });

    it('zeigt Fehler und setzt loading zurück, wenn Login fehlschlägt', () => {
      const err = new Error('nope');
      jest.spyOn(accountService, 'login').mockReturnValue(throwError(() => err));
      const errorSpy = jest.spyOn(alertService, 'error').mockImplementation(() => undefined);

      component.fg.patchValue({ email: 'x@y.z', password: 'bad' });
      Object.defineProperty(component.fg, 'invalid', { get: () => false, configurable: true });
      component.onSubmit();

      expect(errorSpy).toHaveBeenCalledWith(err);
      expect(component.loading()).toBe(false);
    });

    it('ruft alertService.clear() beim Submit', () => {
      const clearSpy = jest.spyOn(alertService, 'clear').mockImplementation(() => undefined);
      jest.spyOn(accountService, 'login').mockReturnValue(of(new User()));
      jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
      Object.defineProperty(component.fg, 'invalid', { get: () => false, configurable: true });
      component.onSubmit();
      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('onReset()', () => {
    it('warnt bei leerem Email-Feld und ruft accountService.newPasswort NICHT auf', async () => {
      const alertSpy = jest.spyOn(alertService, 'alert').mockImplementation(() => undefined);
      const newPwSpy = jest.spyOn(accountService, 'newPasswort');

      await component.onReset();

      expect(alertSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: AlertType.Error, message: 'Email nicht ausgefüllt' }),
      );
      expect(newPwSpy).not.toHaveBeenCalled();
    });

    it('ruft newPasswort mit Email und navigiert bei Erfolg', async () => {
      const newPwSpy = jest
        .spyOn(accountService, 'newPasswort')
        .mockReturnValue(of({ data: {}, message: 'ok', type: 'ok' }));
      const navSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
      const alertSpy = jest.spyOn(alertService, 'alert').mockImplementation(() => undefined);

      component.fg.patchValue({ email: 'x@y.z' });
      await component.onReset();

      expect(newPwSpy).toHaveBeenCalledWith('x@y.z');
      await Promise.resolve();
      expect(alertSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: AlertType.Success }),
      );
      expect(navSpy).toHaveBeenCalledWith('/');
    });
  });
});
