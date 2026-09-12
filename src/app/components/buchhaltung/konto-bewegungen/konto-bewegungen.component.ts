 
 
import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Journal, ParamData } from '@model/datatypes';
import { BackendService } from '@app/service';
import {
  TableOptions,
  TableToolbar,
} from '@shared/basetable/basetable.component';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { from } from 'rxjs';
import { Bind } from 'primeng/bind';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { BaseTableComponent } from '../../shared/basetable/basetable.component';

@Component({
  selector: 'app-konto-bewegungen',
  templateUrl: './konto-bewegungen.component.html',
  styleUrls: ['./konto-bewegungen.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Bind, Select, FormsModule, BaseTableComponent],
})
export class KontoBewegungenComponent implements OnInit {
  private backendService = inject(BackendService);
  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  private messageService = inject(MessageService);

  accountId: number;
  readonly loading = signal(true);
  readonly cols = signal<TableOptions[]>([]);
  readonly toolbar = signal<TableToolbar[]>([]);
  readonly selJahre = signal<{ label?: string; value?: number }[]>([]);
  selJahr = 0;

  readonly lstJournal = signal<Journal[]>([]);

  constructor() {
    const config = this.config;

    this.accountId = config.data.accountid;

    const str = sessionStorage.getItem('parameter');
    const parameter: ParamData[] = str ? JSON.parse(str) : [];
    const paramJahr = parameter.find((param) => param.key === 'CLUBJAHR');
    this.selJahr = Number(paramJahr?.value);
    this.selJahre.set([
      { label: (this.selJahr - 2).toString(), value: this.selJahr - 2 },
      { label: (this.selJahr - 1).toString(), value: this.selJahr - 1 },
      { label: this.selJahr.toString(), value: this.selJahr },
      { label: (this.selJahr + 1).toString(), value: this.selJahr + 1 },
    ]);
  }

  ngOnInit(): void {
    this.cols.set([
      {
        field: 'journalno',
        header: 'Nr.',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
        pipe: DecimalPipe,
        args: '1.0-0',
      },
      {
        field: 'date_date',
        header: 'Datum',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'date',
        pipe: DatePipe,
        args: 'dd.MM.yyyy',
      },
      {
        field: 'fromAcc',
        header: 'Konto Soll',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'text',
      },
      {
        field: 'toAcc',
        header: 'Konto Haben',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'text',
      },
      {
        field: 'memo',
        header: 'Text',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'text',
      },
      {
        field: 'soll',
        header: 'Soll',
        format: false,
        sortable: true,
        filtering: false,
        filter: 'numeric',
        pipe: DecimalPipe,
        args: '1.2-2',
      },
      {
        field: 'haben',
        header: 'Haben',
        format: false,
        sortable: true,
        filtering: false,
        filter: 'numeric',
        pipe: DecimalPipe,
        args: '1.2-2',
      },
    ]);

    this.toolbar.set([
      {
        label: 'Schliessen',
        btnClass: 'p-button-secondary p-button-outlined',
        clickfnc: this.back,
        disabledNoSelection: false,
        disabledWhenEmpty: false,
        icon: '',
        isDefault: false,
        roleNeeded: '',
        isEditFunc: false,
      },
    ]);

    this.readJournal();
  }

  private readJournal() {
    from(
      this.backendService.getOneAccount(this.selJahr, this.accountId),
    ).subscribe((list) => {
      const data = list.data as Journal[];
      data.forEach((x) => {
        x.date_date = new Date(x.date);
      });
      this.lstJournal.set(data);
      this.loading.set(false);
    });
  }

  chgJahr() {
    this.readJournal();
  }

  back = () => {
    this.ref.close();
  };
}
