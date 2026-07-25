import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Anlass } from '@model/datatypes';
import { BackendService } from '@app/service';
import { MessageService } from 'primeng/api';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Subscription, from } from 'rxjs';
import { Bind } from 'primeng/bind';
import { ScrollArea, ScrollAreaViewport, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaHandle } from 'primeng/scrollarea';
import { DatePicker } from 'primeng/datepicker';
import { SelectButton } from 'primeng/selectbutton';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { Toolbar } from 'primeng/toolbar';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-anlaesse-edit',
  templateUrl: './anlaesse-edit.component.html',
  styleUrls: ['./anlaesse-edit.component.scss'],
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    Bind,
    ScrollArea,
    ScrollAreaViewport,
    ScrollAreaContent,
    ScrollAreaScrollbar,
    ScrollAreaHandle,
    FormsModule,
    DatePicker,
    SelectButton,
    InputText,
    InputNumber,
    Select,
    Toolbar,
    ButtonDirective,
  ],
})
export class AnlaesseEditComponent implements OnInit {
  private backendService = inject(BackendService);
  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);

  anlass: Anlass = {};
  lstFKAnlaesse: Anlass[] = [];
  readonly dlstFKAnlaesse = signal<{ value: string; id: number }[]>([]);
  selFKAnlaesse: { value?: string; id?: number } = {};
  subs!: Subscription;
  readonly lstStatus = signal([
    { name: 'Aktiv', code: 1 },
    { name: 'Inaktiv', code: 0 },
  ]);
  dialogRef!: DynamicDialogRef;

  constructor() {
    const config = this.config;

    this.anlass = config.data.anlass;
  }

  ngOnInit(): void {
    this.getAnlaesse();
  }
  back() {
    this.ref.close();
  }

  getAnlaesse() {
    this.subs = from(
      this.backendService.getAnlaesseFKData(
        (this.anlass.datum_date.getFullYear() - 1).toFixed(0),
      ),
    ).subscribe({
      next: (list) => {
        const dlst = list.data as {
          value: string;
          id: number;
        }[];
        this.dlstFKAnlaesse.set(dlst);

        if (this.anlass.anlaesseid) {
          const fFK = dlst.find((entry) => entry.id == this.anlass.anlaesseid);
          if (fFK) this.selFKAnlaesse = fFK;
        }
      },
    });
  }

  save(f: NgForm) {
    if (f.invalid) {
      this.messageService.add({
        detail:
          'Die Daten sind noch nicht korrekt und können nicht gespeichert werden',
        closable: true,
        severity: 'error',
        summary: 'Adresse speichern',
      });
      return;
    }

    if (
      this.anlass.datum !=
      this.anlass.datum_date?.toLocaleDateString('fr-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    )
      this.anlass.datum = this.anlass.datum_date?.toLocaleDateString('fr-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

    if (this.anlass.vorjahr == null && this.anlass.anlaesse) {
      this.anlass.anlaesse = null;
      this.anlass.anlaesseid = null;
    }
    const prom =
      this.anlass.id == undefined || this.anlass.id == 0
        ? this.backendService.addAnlaesseData(this.anlass)
        : this.backendService.updAnlaesseData(this.anlass);
    prom.subscribe({
      next: (anl) => {
        this.ref.close(anl.data as Anlass);
      },
    });
  }
}
