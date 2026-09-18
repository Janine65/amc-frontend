import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { JahrFreigabe } from '@model/datatypes';
import { BackendService } from '@app/service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ButtonDirective } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'app-homepage-freigabe',
  templateUrl: './freigabe.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Toast, ButtonDirective, Ripple, TableModule, FormsModule, InputText, ToggleSwitch],
})
export class HomepageFreigabeComponent implements OnInit {
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);

  readonly freigaben = signal<JahrFreigabe[]>([]);
  readonly loading = signal(true);

  neuesJahr = '';

  ngOnInit(): void {
    this.backendService.getJahrFreigaben().subscribe({
      next: (result) => {
        this.freigaben.set(result.data as JahrFreigabe[]);
        this.loading.set(false);
      },
    });
  }

  onSave(item: JahrFreigabe) {
    this.backendService.upsertJahrFreigabe(item).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Freigabe für ${item.jahr} gespeichert`,
        });
      },
    });
  }

  onAdd() {
    const jahr = this.neuesJahr.trim();
    if (!/^\d{4}$/.test(jahr)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Bitte ein gültiges Jahr (JJJJ) eingeben',
      });
      return;
    }
    if (this.freigaben().some((f) => f.jahr === jahr)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Hinweis',
        detail: `Jahr ${jahr} existiert bereits`,
      });
      return;
    }
    const neu = new JahrFreigabe();
    neu.jahr = jahr;
    this.backendService.upsertJahrFreigabe(neu).subscribe({
      next: (ret) => {
        this.freigaben.set(
          [ret.data as JahrFreigabe, ...this.freigaben()].sort((a, b) => b.jahr.localeCompare(a.jahr)),
        );
        this.neuesJahr = '';
      },
    });
  }
}
