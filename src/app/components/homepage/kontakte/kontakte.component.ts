import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Kontakt } from '@model/datatypes';
import { BackendService } from '@app/service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ButtonDirective } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-homepage-kontakte',
  templateUrl: './kontakte.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Toast, ConfirmDialog, ButtonDirective, Ripple, TableModule, DatePipe],
  providers: [ConfirmationService],
})
export class HomepageKontakteComponent implements OnInit {
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  readonly kontakte = signal<Kontakt[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loadKontakte();
  }

  loadKontakte() {
    this.loading.set(true);
    this.backendService.getKontakte().subscribe({
      next: (result) => {
        this.kontakte.set(result.data as Kontakt[]);
        this.loading.set(false);
      },
    });
  }

  onDelete(item: Kontakt) {
    this.confirmationService.confirm({
      message: `Kontaktanfrage von ${item.vorname} ${item.name} wirklich löschen?`,
      header: 'Löschen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ja',
      rejectLabel: 'Nein',
      accept: () => {
        this.backendService.delKontakt(item).subscribe({
          next: () => {
            this.kontakte.set(this.kontakte().filter((k) => k !== item));
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Kontaktanfrage gelöscht',
            });
          },
        });
      },
    });
  }
}
