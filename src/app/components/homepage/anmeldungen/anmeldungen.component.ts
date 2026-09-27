import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AnlassAnmeldung } from '@model/datatypes';
import { BackendService } from '@app/service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ButtonDirective } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { DatePipe } from '@angular/common';
import { AdresseVerknuepfenComponent } from './adresse-verknuepfen.component';

interface FkEntry {
  id: number;
  value: string;
}

@Component({
  selector: 'app-homepage-anmeldungen',
  templateUrl: './anmeldungen.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Toast, ConfirmDialog, ButtonDirective, Ripple, TableModule, FormsModule, Select, DatePipe],
  providers: [ConfirmationService, DialogService],
  styles: [
    `
      tr.row-inactive td {
        color: var(--p-text-muted-color, #9ca3af);
        text-decoration: line-through;
        opacity: 0.6;
      }
    `,
  ],
})
export class HomepageAnmeldungenComponent implements OnInit {
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private dialogService = inject(DialogService);

  dialogRef?: DynamicDialogRef;

  readonly anmeldungen = signal<AnlassAnmeldung[]>([]);
  readonly anlaesse = signal<FkEntry[]>([]);
  readonly loading = signal(true);

  selectedAnlass: FkEntry | null = null;
  selectedStatus: number | null = null;

  readonly statusOptions = [
    { label: 'Neu', value: 1 },
    { label: 'Bestätigt', value: 2 },
    { label: 'war anwesend', value: 3 },
    { label: 'war abwesend', value: 4 },
    { label: 'Abgelehnt', value: 0 },
  ];

  ngOnInit(): void {
    this.backendService.getAnlaesseAnmeldbar().subscribe({
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

  filteredAnmeldungen(): AnlassAnmeldung[] {
    if (this.selectedStatus === null) return this.anmeldungen();
    return this.anmeldungen().filter((a) => a.status === this.selectedStatus);
  }

  isInactive(item: AnlassAnmeldung): boolean {
    return item.status === 0 || item.status === 4;
  }

  isReadonly(item: AnlassAnmeldung): boolean {
    return item.status === 0 || item.status === 3 || item.status === 4;
  }

  verknuepfen(item: AnlassAnmeldung) {
    this.dialogRef = this.dialogService.open(AdresseVerknuepfenComponent, {
      header: `Adresse verknüpfen: ${item.vorname} ${item.name}`,
      width: '30rem',
      modal: true,
    });
    this.dialogRef.onClose.subscribe((adresseid?: number) => {
      if (!adresseid) return;
      this.backendService.linkAnmeldung(item.id, adresseid).subscribe({
        next: () => {
          item.adresseid = adresseid;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Adresse verknüpft' });
        },
        error: (err: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Fehler',
            detail: err.error?.detail ?? 'Verknüpfung fehlgeschlagen',
          });
        },
      });
    });
  }

  anlassName(item: AnlassAnmeldung): string {
    return item.anlass_longname ?? this.anlaesse().find((a) => a.id === item.anlassid)?.value ?? String(item.anlassid);
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
      error: (err: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: err.error?.detail ?? 'Status konnte nicht gespeichert werden',
        });
        this.loadAnmeldungen();
      },
    });
  }

  confirmAll() {
    if (!this.selectedAnlass) return;
    this.confirmationService.confirm({
      message: `Alle neuen Anmeldungen für «${this.selectedAnlass.value}» bestätigen? Jede Person erhält eine Bestätigungsmail.`,
      header: 'Alle bestätigen',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Ja',
      rejectLabel: 'Nein',
      accept: () => {
        this.backendService.confirmAlleAnmeldungen(this.selectedAnlass!.id).subscribe({
          next: (result) => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: result.message });
            this.loadAnmeldungen();
          },
        });
      },
    });
  }

  attendAll() {
    if (!this.selectedAnlass) return;
    this.confirmationService.confirm({
      message: `Alle Anmeldungen für «${this.selectedAnlass.value}» auf «war anwesend» setzen und auf dem Anlass buchen?`,
      header: 'Alle anwesend',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Ja',
      rejectLabel: 'Nein',
      accept: () => {
        this.backendService.attendAlleAnmeldungen(this.selectedAnlass!.id).subscribe({
          next: (result) => {
            this.messageService.add({ severity: 'info', summary: 'Ergebnis', detail: result.message, life: 10000 });
            this.loadAnmeldungen();
          },
        });
      },
    });
  }

  exportExcel() {
    if (!this.selectedAnlass) return;
    this.backendService.exportAnmeldungen(this.selectedAnlass.id).subscribe({
      next: (response) => {
        const filename = response.data?.filename;
        if (!filename) return;
        this.backendService.downloadFile(filename).subscribe({
          next(data) {
            if (data.body) {
              const blob = new Blob([data.body]);
              const downloadURL = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = downloadURL;
              link.download = filename;
              link.click();
            }
          },
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
