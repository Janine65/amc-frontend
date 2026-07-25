/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Account, Fiscalyear, Journal, ParamData } from '@model/datatypes';
import { BackendService, RetData } from '@app/service';
import {
  TableOptions,
  TableToolbar,
} from '@shared/basetable/basetable.component';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable, map, zip } from 'rxjs';
import { AttachementListComponent } from '../attachement-list/attachement-list.component';
import { AttachmentAddComponent } from '../attachment-add/attachment-add.component';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Bind } from 'primeng/bind';
import { Splitter } from 'primeng/splitter';
import { BaseTableComponent } from '../../shared/basetable/basetable.component';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { AutoComplete } from 'primeng/autocomplete';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss'],
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    Bind,
    Splitter,
    BaseTableComponent,
    Select,
    FormsModule,
    DatePicker,
    AutoComplete,
    InputText,
    InputNumber,
    Button,
  ],
})
export class JournalComponent implements OnInit {
  private backendService = inject(BackendService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);

  dialogRef?: DynamicDialogRef;

  readonly selJahre = signal<{ label?: string; value?: number }[]>([]);
  selJahr = 0;

  readonly lstJournal = signal<Journal[]>([]);
  selJournal: Journal = {};
  readonly loading = signal(true);
  readonly cols = signal<TableOptions[]>([]);
  readonly toolbar = signal<TableToolbar[]>([]);
  toolbarRW: TableToolbar[] = [];
  toolbarRO: TableToolbar[] = [];
  readonly editMode = signal(false);
  readonly addMode = signal(false);

  readonly lstStates = signal<{ label: string; value: number }[]>([
    { label: 'Aktiv', value: 1 },
    { label: 'Inaktiv', value: 0 },
  ]);
  selState = 1;
  parameter: ParamData[];
  jahr: number;
  lstAccounts: Account[] = [];
  readonly lstFromAccounts = signal<Account[]>([]);
  readonly lstToAccounts = signal<Account[]>([]);
  selFromAccount: Account = {};
  selToAccount: Account = {};
  selFiscalyear: Fiscalyear = {};

  constructor() {
    const str = sessionStorage.getItem('parameter');
    this.parameter = str ? JSON.parse(str) : [];
    const paramJahr = this.parameter.find((param) => param.key === 'CLUBJAHR');
    this.jahr = Number(paramJahr?.value);
    this.selJahr = this.jahr;
    this.selJahre.set([
      { label: (this.jahr - 1).toString(), value: this.jahr - 1 },
      { label: this.jahr.toString(), value: this.jahr },
      { label: (this.jahr + 1).toString(), value: this.jahr + 1 },
    ]);
  }

  ngOnInit(): void {
    this.cols.set([
      {
        field: 'journalno',
        header: 'No.',
        format: false,
        sortable: true,
        filtering: false,
        filter: 'numeric',
        pipe: DecimalPipe,
        args: '1.0-0',
      },
      {
        field: 'date',
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
        header: 'Buchungstext',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'text',
      },
      {
        field: 'amount',
        header: 'Betrag',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'numeric',
        pipe: DecimalPipe,
        args: '1.2-2',
      },
    ]);

    this.toolbarRW = [
      {
        label: 'Edit',
        btnClass: 'p-button-primary p-button-outlined',
        icon: 'pi pi-file-edit',
        isDefault: true,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.editJournal,
        roleNeeded: 'admin',
        isEditFunc: true,
      },
      {
        label: 'Delete',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-minus',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.delJournal,
        roleNeeded: 'admin',
        isEditFunc: false,
      },
      {
        label: 'New',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-plus',
        isDefault: false,
        disabledWhenEmpty: false,
        disabledNoSelection: false,
        clickfnc: this.addJournal,
        roleNeeded: 'admin',
        isEditFunc: false,
      },
      {
        label: 'Copy',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-plus',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.copyJournal,
        roleNeeded: 'admin',
        isEditFunc: false,
      },
      {
        label: 'Anhänge',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-list',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.showAtt,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Anhänge',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-plus',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.addAtt,
        roleNeeded: 'admin',
        isEditFunc: false,
      },
      {
        label: 'Alle Anhänge',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-list',
        isDefault: false,
        disabledWhenEmpty: false,
        disabledNoSelection: false,
        clickfnc: this.showAllAtt,
        roleNeeded: 'admin',
        isEditFunc: false,
      },
      {
        label: 'Anhänge',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-upload',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.addNewAtt,
        roleNeeded: 'admin',
        isEditFunc: false,
      },
      {
        label: 'Export',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-download',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: false,
        clickfnc: this.exportJournal,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Export +',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-download',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: false,
        clickfnc: this.exportJournalAll,
        roleNeeded: '',
        isEditFunc: false,
      },
    ];
    this.toolbarRO = [
      {
        label: 'Anhänge',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-list',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.showAtt,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Alle Anhänge',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-list',
        isDefault: false,
        disabledWhenEmpty: false,
        disabledNoSelection: false,
        clickfnc: this.showAllAtt,
        roleNeeded: 'admin',
        isEditFunc: false,
      },
      {
        label: 'Export',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-download',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: false,
        clickfnc: this.exportJournal,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Export +',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-download',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: false,
        clickfnc: this.exportJournalAll,
        roleNeeded: '',
        isEditFunc: false,
      },
    ];
    this.readJournal();
  }

  isEditable() {
    if (this.selFiscalyear) return this.selFiscalyear.state < 3;
    else return false;
  }
  private readJournal() {
    zip(
      this.backendService.getJournal(this.selJahr),
      this.backendService.getAccount(),
      this.backendService.getOneFiscalyear(this.selJahr.toString()),
    )
      .pipe(
        map(([list1, list2, result]) => {
          this.lstJournal.set(list1.data as Journal[]);
          this.lstJournal().forEach((x) => {
            x.date_date = new Date(x.date);
            x.fromAcc =
              x.account_journal_from_accountToaccount?.order.toFixed(0) +
              ' ' +
              x.account_journal_from_accountToaccount.name;
            x.from_account = x.account_journal_from_accountToaccount?.id;
            x.toAcc =
              x.account_journal_to_accountToaccount?.order.toFixed(0) +
              ' ' +
              x.account_journal_to_accountToaccount.name;
            x.to_account = x.account_journal_to_accountToaccount?.id;
          });
          this.lstAccounts = list2.data as Account[];
          this.selFiscalyear = result.data as Fiscalyear;
          if (!this.selFiscalyear || this.selFiscalyear.state == 3)
            this.toolbar.set(this.toolbarRO);
          else this.toolbar.set(this.toolbarRW);
          this.loading.set(false);
        }),
      )
      .subscribe();
  }

  formatField(
    field: string,
    value: string | number | boolean | null,
  ): string | number | boolean | null {
    if (field == 'date') {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      };
      return new Intl.DateTimeFormat('de-CH', options).format(
        new Date(value as string),
      );
      //return new Date((value as string)).toLocaleDateString('de-CH', options)
    }
    return value;
  }

  chgJahr() {
    this.readJournal();
  }

  fromAccountSel(acc: Account) {
    // document why this method 'fromAccountSel' is empty
    this.selJournal.account_journal_from_accountToaccount = acc;
    this.selJournal.from_account = acc.id;
    // this.lstFromAccounts = [];
  }

  toAccountSel(acc: Account) {
    // document why this method 'fromAccountSel' is empty
    // this.lstToAccounts = [];
    this.selJournal.account_journal_to_accountToaccount = acc;
    this.selJournal.to_account = acc.id;
  }

  fromAccountSearch(event: AutoCompleteCompleteEvent) {
    // document why this method 'fromAccountSel' is empty
    const lstString = event.query.split(' ');
    if (!lstString || lstString.length == 0) {
      this.lstFromAccounts.set([]);
      return;
    }

    const list = this.lstAccounts.filter((acc) => {
      let match = false;
      lstString.forEach((text) => {
        const regex = new RegExp(text, 'i');
        const matchL = RegExp(regex).exec(acc.name);
        const matchV = RegExp(regex).exec(String(acc.order));
        if (matchL || matchV) match = true;
      });
      return match;
    });
    this.lstFromAccounts.set(list);
    if (list.length == 1) {
      this.fromAccountSel(list[0]);
    }
  }

  toAccountSearch(event: AutoCompleteCompleteEvent) {
    // document why this method 'toAccountSel' is empty
    const lstString = event.query.split(' ');
    if (!lstString || lstString.length == 0) {
      this.lstToAccounts.set([]);
      return;
    }

    const list = this.lstAccounts.filter((acc) => {
      let match = false;
      lstString.forEach((text) => {
        const regex = new RegExp(text, 'i');
        const matchL = RegExp(regex).exec(acc.name);
        const matchV = RegExp(regex).exec(String(acc.order));
        if (matchL || matchV) match = true;
      });
      return match;
    });
    this.lstToAccounts.set(list);
    if (list.length == 1) {
      this.toAccountSel(list[0]);
    }
  }

  exportJournal = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    thisRef.messageService.add({
      severity: 'info',
      detail: 'Der Download startet gleich. Bitte warten.',
      sticky: true,
      closable: false,
    });
    thisRef.backendService.exportJournal(thisRef.selJahr, 0).subscribe({
      next: (result) => {
        if (result.type == 'info') {
          const filename = result.data.filename;
          thisRef.backendService.downloadFile(filename).subscribe({
            next(data) {
              if (data.body) {
                const blob = new Blob([data.body]);
                const downloadURL = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadURL;
                link.download = filename;
                link.click();
                thisRef.messageService.clear();
              }
            },
          });
        }
      },
    });
  };

  exportJournalAll = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    thisRef.messageService.add({
      severity: 'info',
      detail: 'Der Download startet gleich. Bitte warten.',
      sticky: true,
      closable: false,
    });

    thisRef.backendService.exportJournal(thisRef.selJahr, 1).subscribe({
      next: (result) => {
        if (result.type == 'info') {
          const filename = result.data.filename;
          thisRef.backendService.downloadFile(filename).subscribe({
            next(data) {
              if (data.body) {
                const blob = new Blob([data.body]);
                const downloadURL = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadURL;
                link.download = filename;
                link.click();
                thisRef.messageService.clear();
              }
            },
          });
        }
      },
    });
  };

  addNewAtt = (selRec?: Journal) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    thisRef.messageService.clear();
    if (selRec)
      thisRef.dialogRef = thisRef.dialogService.open(AttachmentAddComponent, {
        data: {
          jahr: thisRef.selJahr.toFixed(0),
          journalid: selRec.id,
        },
        header: 'Neuen Anhang zu Journaleintrag ' + selRec.memo + ' hinzufügen',
        width: '90%',
        height: '90%',
        resizable: true,
        modal: true,
        maximizable: true,
        draggable: true,
      });
  };

  addAtt = (selRec?: Journal) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    thisRef.messageService.clear();
    if (selRec)
      thisRef.dialogRef = thisRef.dialogService.open(AttachementListComponent, {
        data: {
          journalid: selRec.id,
          jahr: thisRef.selJahr,
          type: 'add',
          editable: this.isEditable(),
        },
        header: 'Anhänge zu Journaleintrag ' + selRec.memo + ' hinzufügen',
        width: '90%',
        height: '90%',
        resizable: true,
        modal: true,
        maximizable: true,
        draggable: true,
      });
  };

  showAtt = (selRec?: Journal) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    thisRef.messageService.clear();

    if (selRec) {
      thisRef.dialogRef = thisRef.dialogService.open(AttachementListComponent, {
        data: {
          journalid: selRec.id,
          jahr: this.selJahr,
          type: 'one',
          editable: this.isEditable(),
        },
        header: 'Anhänge anzeigen für den Journaleintrag ' + selRec.memo,
        width: '90%',
        height: '90%',
        resizable: true,
        modal: true,
        maximizable: true,
        draggable: true,
      });
    }
  };

  showAllAtt = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    thisRef.messageService.clear();
    thisRef.dialogRef = thisRef.dialogService.open(AttachementListComponent, {
      data: {
        journalid: undefined,
        jahr: this.selJahr,
        type: 'all',
        editable: this.isEditable(),
      },
      header: 'Alle Anhänge anzeigen für das Jahr ' + this.selJahr,
      width: '90%',
      height: '90%',
      resizable: true,
      modal: true,
      maximizable: true,
      draggable: true,
    });
  };

  editJournal = (selRec?: Journal) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    thisRef.messageService.clear();
    thisRef.clearFields();
    thisRef.editMode.set(true);
    if (selRec) {
      Object.assign(thisRef.selJournal, selRec);
    }
  };

  delJournal = (selRec?: Journal) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    thisRef.messageService.clear();
    this.clearFields();

    if (selRec)
      this.backendService.delJournal(selRec).subscribe({
        complete: () => {
          const list = thisRef.lstJournal();
          thisRef.lstJournal.set(list.filter((x) => x !== selRec));
        },
      });
  };

  addJournal = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    this.clearFields();
    thisRef.messageService.clear();
    this.addMode.set(true);
  };

  copyJournal = (selRec?: Journal) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: JournalComponent = this;
    this.clearFields();
    thisRef.messageService.clear();
    this.addMode.set(true);

    if (selRec) {
      thisRef.selJournal = structuredClone(selRec);
      thisRef.selJournal.id = undefined;
    }
  };

  private clearFields() {
    this.addMode.set(false);
    this.editMode.set(false);
    this.selJournal = {};
  }
  save() {
    let sub: Observable<RetData>;

    this.selJournal.from_account =
      this.selJournal.account_journal_from_accountToaccount?.id;
    this.selJournal.to_account =
      this.selJournal.account_journal_to_accountToaccount?.id;
    this.selJournal.date = `${this.selJournal.date_date.getFullYear()}-${this.selJournal.date_date.toLocaleString(
      'default',
      { month: '2-digit' },
    )}-${this.selJournal.date_date.toLocaleString('default', {
      day: '2-digit',
    })}`;

    if (this.addMode()) {
      sub = this.backendService.addJournal(this.selJournal);
    } else {
      sub = this.backendService.updJournal(this.selJournal);
    }
    sub.subscribe({
      next: (record) => {
        const jour = record.data as Journal;
        this.backendService.getOneJournal(jour.id).subscribe({
          next: (result) => {
            const jour = result.data as Journal;
            jour.date_date = new Date(jour.date);
            jour.fromAcc = jour.account_journal_from_accountToaccount?.longname;
            jour.from_account = jour.account_journal_from_accountToaccount?.id;
            jour.toAcc = jour.account_journal_to_accountToaccount?.longname;
            jour.to_account = jour.account_journal_to_accountToaccount?.id;

            if (this.addMode()) {
              const list = [...this.lstJournal(), jour];
              list.sort((a: Journal, b: Journal) =>
                a.journalno && b.journalno
                  ? a.journalno - b.journalno
                  : a.date_date < b.date_date
                    ? -1
                    : 1,
              );
              this.lstJournal.set(list);
            } else
              this.lstJournal.set(
                this.lstJournal().map(
                  (obj) => [jour].find((o) => o.id === obj.id) ?? obj,
                ),
              );

            this.clearFields();
          },
        });
      },
    });
  }
  reset() {
    this.clearFields();
  }
}
