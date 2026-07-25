 
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { BackendService } from '@app/service';
import { MessageService } from 'primeng/api';
import { from } from 'rxjs';
import { Anlass } from '@model/datatypes';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  TableOptions,
  TableToolbar,
} from '@shared/basetable/basetable.component';
import { AnlaesseEditComponent } from '../anlaesse-edit/anlaesse-edit.component';
import { AnlassBookComponent } from '../anlass-book/anlass-book.component';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Bind } from 'primeng/bind';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { BaseTableComponent } from '../../shared/basetable/basetable.component';

@Component({
  selector: 'app-anlaesse',
  templateUrl: './anlaesse.component.html',
  styles: [],
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Bind, Select, FormsModule, BaseTableComponent],
})
export class AnlaesseComponent implements OnInit {
  private backendService = inject(BackendService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);

  readonly anlaesseList = signal<Anlass[]>([]);
  private anlaesseListAll: Anlass[] = [];
  readonly loading = signal(true);

  dialogRef?: DynamicDialogRef;
  readonly cols = signal<TableOptions[]>([]);
  readonly toolbar = signal<TableToolbar[]>([]);

  readonly selJahre = signal<{ label?: string; value?: number }[]>([]);
  selJahr = 0;
  ngOnInit(): void {
    this.cols.set([
      {
        field: 'datum_date',
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
        field: 'status',
        header: 'Status',
        format: true,
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
        field: 'gaeste',
        header: 'Gäste',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
        pipe: DecimalPipe,
        args: '1.0-0',
      },
      {
        field: 'istkegeln',
        header: 'Kegeln?',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'boolean',
      },
      {
        field: 'nachkegeln',
        header: 'Nachkegeln?',
        format: false,
        sortable: false,
        filtering: true,
        filter: 'boolean',
      },
      {
        field: 'istsamanlass',
        header: 'SAM-Anlass?',
        format: false,
        sortable: false,
        filtering: true,
        filter: 'boolean',
      },
      {
        field: 'vorjahr',
        header: 'Vorjahres Termin',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'text',
      },
    ]);

    this.toolbar.set([
      {
        label: 'Punkte vergeben',
        btnClass: 'p-button-primary p-button-outlined',
        icon: 'pi pi-file-excel',
        isDefault: true,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.doAnlass,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Datenblatt',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-file-excel',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: false,
        clickfnc: this.exportOne,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'leer',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-file-excel',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: false,
        clickfnc: this.exportAllEmpty,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'voll',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-file-excel',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: false,
        clickfnc: this.exportAllFull,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Edit',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-file-edit',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.editAnlass,
        roleNeeded: '',
        isEditFunc: true,
      },
      {
        label: 'Copy',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-copy',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.copyAnlass,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Delete',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-minus',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.delAnlass,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'New',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-plus',
        isDefault: false,
        disabledWhenEmpty: false,
        disabledNoSelection: false,
        clickfnc: this.addAnlass,
        roleNeeded: '',
        isEditFunc: false,
      },
    ]);

    const str = sessionStorage.getItem('parameter');
    const parameter = str ? JSON.parse(str) : [];
    const paramJahr = parameter.find((param) => param.key === 'CLUBJAHR');
    const jahr = paramJahr?.value
      ? Number(paramJahr.value)
      : new Date().getFullYear();

    this.selJahr = jahr;
    this.selJahre.set([
      { label: (this.selJahr - 1).toString(), value: this.selJahr - 1 },
      { label: this.selJahr.toString(), value: this.selJahr },
      { label: (this.selJahr + 1).toString(), value: this.selJahr + 1 },
    ]);

    // read Anlaesse
    from(
      this.backendService.getAnlaesseData(
        (this.selJahr - 1).toFixed(0),
        (this.selJahr + 1).toFixed(0),
        undefined,
      ),
    ).subscribe((list) => {
      this.anlaesseListAll = list.data as Anlass[];
      this.anlaesseListAll.forEach((anl) => {
        anl.datum_date = new Date(anl.datum ? anl.datum : '');
        anl.vorjahr = anl.anlaesse ? anl.anlaesse.longname : '';
        if (anl.status == 0) anl.classRow = 'inactive';
      });
      this.chgJahr();
      this.loading.set(false);
    });
  }

  formatField(
    field: string,
    value: string | number | boolean | null,
  ): string | number | boolean | null {
    if (field == 'status')
      return value && (value as number) == 1 ? 'Aktiv' : 'Inaktiv';

    return value;
  }

  chgJahr() {
    this.anlaesseList.set(
      this.anlaesseListAll.filter(
        (anl) => anl.datum_date?.getFullYear() === this.selJahr,
      ),
    );
  }

  addAnlass = (_selRec?: Anlass, _lstData?: Anlass[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: AnlaesseComponent = this;
    thisRef.messageService.clear();
    const newAnl = new Anlass();
    newAnl.datum_date = new Date();
    newAnl.status = 1;
    newAnl.punkte = 50;

    thisRef.dialogRef = thisRef.dialogService.open(AnlaesseEditComponent, {
      data: {
        anlass: newAnl,
      },
      header: 'Neuer Anlass erfassen',
      width: '70%',
      height: '70%',
      resizable: true,
      modal: true,
      maximizable: true,
      draggable: true,
    });
    thisRef.dialogRef.onClose.subscribe((anlass: Anlass) => {
      if (anlass) {
        anlass.datum_date = new Date(anlass.datum);
        anlass.vorjahr = anlass.anlaesse ? anlass.anlaesse.longname : '';

        thisRef.anlaesseListAll.push(anlass);
        thisRef.chgJahr();
      }
    });
  };

  editAnlass = (selRec?: Anlass, _lstData?: Anlass[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: AnlaesseComponent = this;
    thisRef.messageService.clear();

    thisRef.dialogRef = thisRef.dialogService.open(AnlaesseEditComponent, {
      data: {
        anlass: selRec,
      },
      header: 'Anlass ändern',
      width: '70%',
      height: '70%',
      resizable: true,
      modal: true,
      maximizable: true,
      draggable: true,
    });
    thisRef.dialogRef.onClose.subscribe((anlass: Anlass) => {
      if (anlass) {
        anlass.datum_date = new Date(anlass.datum);
        anlass.vorjahr = anlass.anlaesse ? anlass.anlaesse.longname : '';

        thisRef.anlaesseListAll = thisRef.anlaesseListAll.map(
          (obj) => [anlass].find((o) => o.id === obj.id) || obj,
        );
        thisRef.chgJahr();
      }
    });
  };

  copyAnlass = (selRec?: Anlass, _lstData?: Anlass[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: AnlaesseComponent = this;
    thisRef.messageService.clear();
    const newAnl = structuredClone(selRec);
    newAnl.id = undefined;
    newAnl.anlaesseid = selRec?.id;
    let newYear = selRec?.datum_date?.getFullYear();
    if (newYear) {
      newYear++;
      newAnl.datum_date?.setFullYear(newYear);
    }
    newAnl.status = 1;

    thisRef.dialogRef = thisRef.dialogService.open(AnlaesseEditComponent, {
      data: {
        anlass: newAnl,
      },
      header: 'Neuer Anlass erfassen (Kopie)',
      width: '70%',
      height: '70%',
      resizable: true,
      modal: true,
      maximizable: true,
      draggable: true,
    });
    thisRef.dialogRef.onClose.subscribe((anlass: Anlass) => {
      if (anlass) {
        anlass.datum_date = new Date(anlass.datum);
        anlass.vorjahr = anlass.anlaesse ? anlass.anlaesse.longname : '';

        thisRef.anlaesseListAll.push(anlass);
        thisRef.chgJahr();
      }
    });
  };

  delAnlass = (selRec?: Anlass, _lstData?: Anlass[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: AnlaesseComponent = this;
    thisRef.messageService.clear();

    thisRef.backendService.delAnlaesseData(selRec).subscribe({
      complete: () => {
        thisRef.anlaesseListAll = thisRef.anlaesseListAll.filter(
          (a) => a !== selRec,
        );
        thisRef.chgJahr();

        thisRef.messageService.add({
          detail: 'Der Anlass wurde gelöscht',
          closable: true,
          severity: 'info',
          summary: 'Anlass beenden',
        });
      },
    });
  };

  doAnlass = (selRec?: Anlass, _lstData?: Anlass[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: AnlaesseComponent = this;
    thisRef.messageService.clear();

    const longname =
      selRec?.datum_date?.toLocaleDateString() + ' ' + selRec?.name;
    thisRef.dialogRef = thisRef.dialogService.open(AnlassBookComponent, {
      data: {
        anlass: selRec,
      },
      header: 'Anlass ' + longname + ' buchen',
      width: '70%',
      height: '70%',
      resizable: true,
      modal: true,
      maximizable: true,
      draggable: true,
      focusOnShow: false,
    });
    thisRef.dialogRef.onClose.subscribe();
  };

  exportOne = (_selRec?: Anlass, _lstData?: Anlass[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: AnlaesseComponent = this;
    from(
      this.backendService.getSheet({ jahr: this.selJahr, type: 0, id: null }),
    ).subscribe((response) => {
      if (response.type == 'info') {
        const filename = response.data.filename;
        thisRef.backendService.downloadFile(filename).subscribe({
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
      }
    });
  };

  exportAllEmpty = (_selRec?: Anlass, _lstData?: Anlass[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: AnlaesseComponent = this;
    from(
      this.backendService.getSheet({ jahr: this.selJahr, type: 1, id: 0 }),
    ).subscribe((response) => {
      if (response.type == 'info') {
        const filename = response.data.filename;
        thisRef.backendService.downloadFile(filename).subscribe({
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
      }
    });
  };
  exportAllFull = (_selRec?: Anlass, _lstData?: Anlass[]) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: AnlaesseComponent = this;
    from(
      this.backendService.getSheet({ jahr: this.selJahr, type: 2, id: 0 }),
    ).subscribe((response) => {
      if (response.type == 'info') {
        const filename = response.data.filename;
        thisRef.backendService.downloadFile(filename).subscribe({
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
      }
    });
  };
}
