import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BackendService } from '@app/service';
import { BesucherStatistik } from '@model/datatypes';
import { ButtonDirective } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-homepage-besucher',
  templateUrl: './besucher.component.html',
  styleUrl: './besucher.component.scss',
  imports: [FormsModule, DatePipe, DecimalPipe, ButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomepageBesucherComponent implements OnInit {
  private readonly backend = inject(BackendService);
  private readonly messages = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  readonly data = signal<BesucherStatistik | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  bis = this.dateInZurich(new Date());
  von = this.dateInZurich(new Date(Date.now() - 29 * 86400000));

  readonly sections = computed(() => {
    const data = this.data();
    if (!data) return [];
    return [
      { title: 'Länder', rows: data.countries },
      { title: 'Zugriffsquellen', rows: data.sources },
      { title: 'Verweisende Websites', rows: data.referrers },
      { title: 'Besuchsdauer (näherungsweise)', rows: data.durations },
      { title: 'Wochentage', rows: data.weekdays },
      { title: 'Uhrzeiten', rows: data.hours },
      { title: 'Besuche pro Tag', rows: data.days },
      { title: 'Besuchte Seiten', rows: data.pages },
      { title: 'Einstiegsseiten', rows: data.entry_pages },
      { title: 'Gerätetypen', rows: data.devices },
      { title: 'Browser', rows: data.browsers },
    ].map((section) => ({
      ...section,
      total: section.rows.reduce((sum, row) => sum + row.count, 0),
    }));
  });

  private dateInZurich(date: Date): string {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(date);
    return ['year', 'month', 'day']
      .map((type) => parts.find((part) => part.type === type)?.value)
      .join('-');
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    if (this.loading()) return;
    const days = (Date.parse(this.bis) - Date.parse(this.von)) / 86400000 + 1;
    if (!this.von || !this.bis || !Number.isFinite(days) || days < 1 || days > 365) {
      this.error.set('Bitte einen gültigen Zeitraum von 1 bis 365 Tagen wählen.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.data.set(null);
    this.backend.getBesucherStatistik(this.von, this.bis)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.loading.set(false)))
      .subscribe({
        next: (result) => this.data.set(result.data),
        error: (err: HttpErrorResponse) => {
          const detail = typeof err.error?.detail === 'string'
            ? err.error.detail : 'Besucherstatistik konnte nicht geladen werden.';
          this.error.set(detail);
          this.messages.add({ severity: 'error', summary: 'Besucherstatistik', detail });
        },
      });
  }
}
