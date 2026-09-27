import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackendService } from '@app/service';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';
import { ButtonDirective } from 'primeng/button';

interface FkEntry {
  id: number;
  value: string;
}

/** Dialog: Anlass auswählen, um eine Adresse manuell anzumelden. */
@Component({
  selector: 'app-anlass-anmelden',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, Select, ButtonDirective],
  template: `
    <div class="flex flex-col gap-3">
      <p-select
        [options]="anlaesse()"
        optionLabel="value"
        [(ngModel)]="selected"
        placeholder="Anlass wählen"
        [style]="{ width: '100%' }"
        appendTo="body"
      />
      <div class="flex justify-end gap-2">
        <button pButton type="button" class="p-button-secondary p-button-outlined" (click)="cancel()">Abbrechen</button>
        <button pButton type="button" [disabled]="!selected" (click)="save()">Anmelden</button>
      </div>
    </div>
  `,
})
export class AnlassAnmeldenComponent implements OnInit {
  private backendService = inject(BackendService);
  private ref = inject(DynamicDialogRef);

  readonly anlaesse = signal<FkEntry[]>([]);
  selected: FkEntry | null = null;

  ngOnInit(): void {
    this.backendService.getAnlaesseAnmeldbar().subscribe({
      next: (result) => this.anlaesse.set(result.data as FkEntry[]),
    });
  }

  save() {
    this.ref.close(this.selected?.id);
  }

  cancel() {
    this.ref.close();
  }
}
