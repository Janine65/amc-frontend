import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackendService } from '@app/service';
import { Adresse } from '@model/datatypes';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Select } from 'primeng/select';
import { ButtonDirective } from 'primeng/button';

interface FkEntry {
  id: number;
  value: string;
}

/** Dialog: Adresse auswählen, um eine Anmeldung manuell zu verknüpfen. */
@Component({
  selector: 'app-adresse-verknuepfen',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, Select, ButtonDirective],
  template: `
    <div class="flex flex-col gap-3">
      <p-select
        [options]="adressen()"
        optionLabel="value"
        [(ngModel)]="selected"
        [filter]="true"
        filterBy="value"
        placeholder="Adresse wählen"
        [style]="{ width: '100%' }"
        appendTo="body"
      />
      <div class="flex justify-end gap-2">
        <button pButton type="button" class="p-button-secondary p-button-outlined" (click)="cancel()">Abbrechen</button>
        <button pButton type="button" [disabled]="!selected" (click)="save()">Verknüpfen</button>
      </div>
    </div>
  `,
})
export class AdresseVerknuepfenComponent implements OnInit {
  private backendService = inject(BackendService);
  private ref = inject(DynamicDialogRef);

  readonly adressen = signal<FkEntry[]>([]);
  selected: FkEntry | null = null;

  ngOnInit(): void {
    this.backendService.getAdressenData().subscribe({
      next: (list) => {
        const data = list.data as Adresse[];
        this.adressen.set(data.map((a) => ({ id: a.id, value: `${a.name} ${a.vorname}, ${a.ort}` })));
      },
    });
  }

  save() {
    this.ref.close(this.selected?.id);
  }

  cancel() {
    this.ref.close();
  }
}
