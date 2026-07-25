import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MeisterAdresse, Meisterschaft } from '@model/datatypes';
import { BackendService } from '@app/service';
import {
  TableOptions,
  TableToolbar,
} from '@shared/basetable/basetable.component';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { map, zip } from 'rxjs';
import { Bind } from 'primeng/bind';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { Ripple } from 'primeng/ripple';
import { BaseTableComponent } from '../../shared/basetable/basetable.component';

@Component({
  selector: 'app-adresse-show',
  templateUrl: './adresse-show.component.html',
  styleUrls: ['./adresse-show.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    Bind,
    Tabs,
    TabList,
    Ripple,
    Tab,
    TabPanels,
    TabPanel,
    BaseTableComponent,
  ],
})
export class AdresseShowComponent {
  private backendService = inject(BackendService);
  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  private messageService = inject(MessageService);

  dialogRef?: DynamicDialogRef;
  readonly cols = signal<TableOptions[]>([]);
  readonly toolbar = signal<TableToolbar[]>([]);
  readonly lstEvents = signal<Meisterschaft[]>([]);
  readonly colsM = signal<TableOptions[]>([]);
  readonly toolbarM = signal<TableToolbar[]>([]);
  readonly lstMeister = signal<MeisterAdresse[]>([]);
  adresseid = 0;

  constructor() {
    const config = this.config;

    this.adresseid = config.data.adresseid;

    this.cols.set([
      {
        field: 'jahr',
        header: 'Jahr',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
      },
      {
        field: 'event_datum_date',
        header: 'Datum',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'date',
        pipe: DatePipe,
        args: 'dd.MM.yyyy',
      },
      {
        field: 'name',
        header: 'Name',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'text',
      },
      {
        field: 'punkte',
        header: 'Punkte',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
        pipe: DecimalPipe,
        args: '1.0-0',
      },
      {
        field: 'total_kegel',
        header: 'Total Kegel',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
        pipe: DecimalPipe,
        args: '1.0-0',
      },
      {
        field: 'streichresultat',
        header: 'Streichresultat',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'boolean',
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

    this.colsM.set([
      {
        field: 'jahr',
        header: 'Jahr',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'text',
      },
      {
        field: 'rangC',
        header: 'Club Rang',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
      },
      {
        field: 'punkteC',
        header: 'Club Punkte',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
      },
      {
        field: 'diffErsterC',
        header: 'Club Differenz',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
      },
      {
        field: 'anlaesseC',
        header: 'Club Anlässe',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
      },
      {
        field: 'werbungenC',
        header: 'Club Werbungen',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
      },
      {
        field: 'mitglieddauerC',
        header: 'Club Mitglieddauer',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
      },
      {
        field: 'statusC',
        header: 'Club Status',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'boolean',
      },
      {
        field: 'rangK',
        header: 'Kegel Rang',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
      },
      {
        field: 'punkteK',
        header: 'Kegel Punkte',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
      },
      {
        field: 'diffErsterK',
        header: 'Kegel Differenz',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
      },
      {
        field: 'anlaesseK',
        header: 'Kegel Anlässe',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
      },
      {
        field: 'babeliK',
        header: 'Kegel Babeli',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
      },
      {
        field: 'statusC',
        header: 'Kegel Status',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'boolean',
      },
    ]);

    this.toolbarM.set([
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

    zip(
      this.backendService.getAdresseMeisterschaft(this.adresseid),
      this.backendService.getAdresseMeister(this.adresseid),
    )
      .pipe(
        map((result) => {
          const events = result[0].data as Meisterschaft[];
          events.forEach((rec) => {
            rec.event_datum_date = new Date(rec.anlaesse.datum!);
            rec.jahr = rec.event_datum_date.getFullYear();
            rec.name = rec.anlaesse.name;
          });
          this.lstEvents.set(events);
          this.lstMeister.set(result[1].data as MeisterAdresse[]);
        }),
      )
      .subscribe();
  }

  back = () => {
    this.ref.close();
  };
}
