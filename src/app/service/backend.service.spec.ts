import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { environment } from '@environments/environment';
import { BackendService, RetData } from './backend.service';
import { Adresse, ParamData } from '@model/index';

describe('BackendService', () => {
  let service: BackendService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BackendService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(BackendService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAbout()', () => {
    it('sendet GET auf /about', () => {
      const dummy = { name: 'amc-interna', version: '4.5.0' };
      service.getAbout().subscribe((data) => {
        expect(data).toEqual(dummy);
      });
      const req = httpMock.expectOne(apiUrl + '/about');
      expect(req.request.method).toBe('GET');
      req.flush(dummy);
    });
  });

  describe('getParameterData()', () => {
    it('sendet GET auf /parameter', () => {
      const ret: RetData = { data: [], message: '', type: 'ok' };
      service.getParameterData().subscribe((r) => expect(r).toEqual(ret));
      const req = httpMock.expectOne(apiUrl + '/parameter');
      expect(req.request.method).toBe('GET');
      req.flush(ret);
    });
  });

  describe('updParameterData()', () => {
    it('sendet PATCH auf /parameter/:id mit Body', () => {
      const param = { id: 42, key: 'foo', value: 'bar' } as unknown as ParamData;
      service.updParameterData(param).subscribe();
      const req = httpMock.expectOne(apiUrl + '/parameter/42');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toBe(JSON.stringify(param));
      req.flush({ data: {}, message: '', type: 'ok' });
    });
  });

  describe('addParameterData()', () => {
    it('sendet POST auf /parameter mit Body', () => {
      const param = { id: 0, key: 'x', value: 'y' } as unknown as ParamData;
      service.addParameterData(param).subscribe();
      const req = httpMock.expectOne(apiUrl + '/parameter');
      expect(req.request.method).toBe('POST');
      req.flush({ data: {}, message: '', type: 'ok' });
    });
  });

  describe('delParameterData()', () => {
    it('sendet DELETE auf /parameter/:id', () => {
      const param = { id: 5 } as unknown as ParamData;
      service.delParameterData(param).subscribe();
      const req = httpMock.expectOne(apiUrl + '/parameter/5');
      expect(req.request.method).toBe('DELETE');
      req.flush({ data: {}, message: '', type: 'ok' });
    });
  });

  describe('updateAdresse()', () => {
    it('POSTet neue Adresse (id == 0)', () => {
      const adr = { id: 0, name: 'Neu' } as unknown as Adresse;
      service.updateAdresse(adr).subscribe();
      const req = httpMock.expectOne(apiUrl + '/adressen');
      expect(req.request.method).toBe('POST');
      req.flush({ data: {}, message: '', type: 'ok' });
    });

    it('PATCHt bestehende Adresse (id > 0)', () => {
      const adr = { id: 7, name: 'Bekannt' } as unknown as Adresse;
      service.updateAdresse(adr).subscribe();
      const req = httpMock.expectOne(apiUrl + '/adressen/7');
      expect(req.request.method).toBe('PATCH');
      req.flush({ data: {}, message: '', type: 'ok' });
    });
  });

  describe('removeAdresse()', () => {
    it('sendet DELETE mit Body', () => {
      const adr = { id: 3, name: 'Weg' } as unknown as Adresse;
      service.removeAdresse(adr).subscribe();
      const req = httpMock.expectOne(apiUrl + '/adressen/3');
      expect(req.request.method).toBe('DELETE');
      req.flush({ data: {}, message: '', type: 'ok' });
    });
  });

  describe('downloadFile()', () => {
    it('sendet GET auf /files/download mit filename-Query', () => {
      service.downloadFile('test.pdf').subscribe();
      const req = httpMock.expectOne(apiUrl + '/files/download?filename=test.pdf');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(new Blob(['x']));
    });
  });

  describe('uploadFiles()', () => {
    it('sendet POST mit FormData', () => {
      const file = new File(['content'], 'a.pdf', { type: 'application/pdf' });
      service.uploadFiles(file).subscribe();
      const req = httpMock.expectOne(apiUrl + '/files/upload');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);
      req.flush({ data: {}, message: '', type: 'ok' });
    });
  });

  describe('Fehlerpfad', () => {
    it('leitet HTTP-Fehler an Subscriber weiter', (done) => {
      service.getParameterData().subscribe({
        next: () => done.fail('should have errored'),
        error: (err: HttpErrorResponse) => {
          expect(err.status).toBe(500);
          done();
        },
      });
      const req = httpMock.expectOne(apiUrl + '/parameter');
      req.flush('boom', { status: 500, statusText: 'Server Error' });
    });
  });

  it('nutzt HttpClient (Injection stimmt)', () => {
    expect(TestBed.inject(HttpClient)).toBeTruthy();
  });
});
