import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AnlassAnmeldung } from '@model/datatypes';
import { BackendService } from '@app/service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ButtonDirective } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePipe } from '@angular/common';

interface FkEntry {
  id: number;
  value: string;
}

@Component({
  selector: 'app-homepage-anmeldungen',
  templateUrl: './anmeldungen.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Toast, ButtonDirective, Ripple, TableModule, FormsModule, Select, DatePipe],
})
export class HomepageAnmeldungenComponent implements OnInit {
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);

  readonly anmeldungen = signal<AnlassAnmeldung[]>([]);
  readonly anlaesse = signal<FkEntry[]>([]);
  readonly loading = signal(true);

  selectedAnlass: FkEntry | null = null;

  readonly statusOptions = [
    { label: 'Neu', value: 1 },
    { label: 'Bestätigt', value: 2 },
    { label: 'war anwesend', value: 3 },
    { label: 'war abwesend', value: 4 },
    { label: 'Abgelehnt', value: 0 },
  ];

  ngOnInit(): void {
    const jahr = new Date().getFullYear();
    this.backendService.getAnlaesseFKData(String(jahr)).subscribe({
      next: (result) => {
        this.anlaesse.set(result.data as FkEntry[]);
      },
    });
    this.loadAnmeldungen();
  }

  loadAnmeldungen() {
    this.loading.set(true);
    this.backendService.getAnmeldungen(this.selectedAnlass?.id).subscribe({
      next: (result) => {
        this.anmeldungen.set(result.data as AnlassAnmeldung[]);
        this.loading.set(false);
      },
    });
  }

  anlassName(anlassid: number): string {
    return this.anlaesse().find((a) => a.id === anlassid)?.value ?? String(anlassid);
  }

  onStatusChange(item: AnlassAnmeldung) {
    this.backendService.updAnmeldung(item).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Status gespeichert',
        });
      },
    });
  }

  onDelete(item: AnlassAnmeldung) {
    this.backendService.delAnmeldung(item).subscribe({
      next: () => {
        this.anmeldungen.set(this.anmeldungen().filter((a) => a !== item));
      },
    });
  }
}
