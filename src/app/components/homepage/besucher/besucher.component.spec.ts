import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { BackendService } from '@app/service';
import { MessageService } from 'primeng/api';
import { Subject, throwError } from 'rxjs';
import { BesucherStatistik } from '@model/datatypes';
import { HomepageBesucherComponent } from './besucher.component';

describe('HomepageBesucherComponent', () => {
  let fixture: ComponentFixture<HomepageBesucherComponent>;
  let component: HomepageBesucherComponent;
  const backend = { getBesucherStatistik: jest.fn() };
  const messages = { add: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [HomepageBesucherComponent],
      providers: [
        { provide: BackendService, useValue: backend },
        { provide: MessageService, useValue: messages },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HomepageBesucherComponent);
    component = fixture.componentInstance;
  });

  it('rejects reversed and overlong date ranges without requesting data', () => {
    component.von = '2026-11-14';
    component.bis = '2026-11-13';
    component.load();
    expect(backend.getBesucherStatistik).not.toHaveBeenCalled();
    expect(component.error()).toContain('1 bis 365');
    component.von = '2025-01-01';
    component.load();
    expect(backend.getBesucherStatistik).not.toHaveBeenCalled();
  });

  it('shows errors explicitly and leaves no loading state after a failed request', () => {
    backend.getBesucherStatistik.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 503, error: { detail: 'Statistik nicht verfügbar' },
    })));
    component.load();
    expect(component.error()).toBe('Statistik nicht verfügbar');
    expect(component.loading()).toBe(false);
    expect(component.data()).toBeNull();
    expect(messages.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  it('shows returned statistics and excludes duplicate requests while loading', () => {
    const result = new Subject<{ data: BesucherStatistik }>();
    backend.getBesucherStatistik.mockReturnValue(result);
    fixture.detectChanges();
    component.load();
    expect(backend.getBesucherStatistik).toHaveBeenCalledTimes(1);
    const data: BesucherStatistik = {
      von: '2026-11-01', bis: '2026-11-14', timezone: 'Europe/Zurich', retention_days: 365,
      visits: 3, pageviews: 5, measured_visits: 2, average_duration_seconds: 90,
      countries: [{ label: 'CH', count: 2 }, { label: 'Unbekannt', count: 1 }],
      sources: [], referrers: [], weekdays: [], hours: [], days: [], durations: [],
      pages: [], entry_pages: [], devices: [], browsers: [],
    };
    result.next({ data });
    result.complete();
    expect(component.data()).toEqual(data);
    expect(component.sections().find((section) => section.title === 'Länder')?.total).toBe(3);
    expect(component.loading()).toBe(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('CH');
    expect(fixture.nativeElement.textContent).toContain('90 s');
  });
});
