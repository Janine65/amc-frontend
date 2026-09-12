 
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Account, ParamData } from '@model/datatypes';
import { BackendService, RetData } from '@app/service';
import {
  TableOptions,
  TableToolbar,
} from '@shared/basetable/basetable.component';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Observable, from } from 'rxjs';
import { KontoBewegungenComponent } from '../konto-bewegungen/konto-bewegungen.component';
import { Bind } from 'primeng/bind';
import { Splitter } from 'primeng/splitter';
import { BaseTableComponent } from '../../shared/basetable/basetable.component';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-konten',
  templateUrl: './konten.component.html',
  styleUrls: ['./konten.component.scss'],
  providers: [DialogService],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    Bind,
    Splitter,
    BaseTableComponent,
    FormsModule,
    InputText,
    Select,
    ButtonDirective,
  ],
})
export class KontenComponent implements OnInit {
  private backendService = inject(BackendService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);

  readonly lstAccount = signal<Account[]>([]);
  selAccount: Account = {};
  readonly loading = signal(true);
  readonly cols = signal<TableOptions[]>([]);
  readonly toolbar = signal<TableToolbar[]>([]);
  readonly editMode = signal(false);
  readonly addMode = signal(false);

  readonly lstStates = signal<{ label: string; value: number }[]>([
    { label: 'Aktiv', value: 1 },
    { label: 'Inaktiv', value: 0 },
  ]);
  selState = 1;

  ngOnInit(): void {
    this.cols.set([
      {
        field: 'name',
        header: 'Name',
        format: false,
        sortable: false,
        filtering: false,
        filter: undefined,
      },
      {
        field: 'level',
        header: 'Level',
        format: false,
        sortable: false,
        filtering: false,
        filter: undefined,
      },
      {
        field: 'order',
        header: 'Order',
        format: false,
        sortable: false,
        filtering: false,
        filter: undefined,
      },
      {
        field: 'status',
        header: 'Status',
        format: true,
        sortable: false,
        filtering: false,
        filter: undefined,
      },
    ]);

    this.toolbar.set([
      {
        label: 'Bearbeiten',
        btnClass: 'p-button-primary p-button-outlined',
        icon: 'pi pi-file-edit',
        isDefault: true,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.editAccount,
        roleNeeded: '',
        isEditFunc: true,
      },
      {
        label: 'Löschen',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-minus',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.delAccount,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Neu',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-plus',
        isDefault: false,
        disabledWhenEmpty: false,
        disabledNoSelection: false,
        clickfnc: this.addAccount,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Bewegungen',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-plus',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.showProcess,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Export Bewegungen',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-excel',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: false,
        clickfnc: this.exportKonto,
        roleNeeded: '',
        isEditFunc: false,
      },
    ]);

    from(this.backendService.getAccount()).subscribe((list) => {
      const data = list.data as Account[];
      data.forEach((rec) => {
        if (rec.status === 0) rec.classRow = 'inactive';
      });
      this.lstAccount.set(data);
      this.loading.set(false);
    });
  }

  formatField(
    field: string,
    value: string | number | boolean | null,
  ): string | number | boolean | null {
    if (field == 'status') {
      switch (value as number) {
        case 1:
          return 'Aktiv';

        case 0:
          return 'Inaktiv';
      }
    }
    return value;
  }

  editAccount = (selRec?: Account) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: KontenComponent = this;
    thisRef.messageService.clear();
    this.clearFields();
    this.editMode.set(true);
    if (selRec) Object.assign(this.selAccount, selRec);
  };

  delAccount = (selRec?: Account) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: KontenComponent = this;
    thisRef.messageService.clear();
    this.clearFields();

    if (selRec)
      this.backendService.delAccount(selRec).subscribe({
        complete: () => {
          thisRef.lstAccount.set(
            thisRef.lstAccount().filter((x) => x !== selRec),
          );
          thisRef.messageService.add({
            detail: 'Das Geschäftsjahr',
            closable: true,
            severity: 'info',
            sticky: false,
            summary: 'Anlass beenden',
          });
        },
      });
  };

  addAccount = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: KontenComponent = this;
    thisRef.clearFields();
    thisRef.messageService.clear();
    this.addMode.set(true);
  };

  private clearFields() {
    this.addMode.set(false);
    this.editMode.set(false);
    this.selAccount = {};
  }

  exportKonto = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: KontenComponent = this;
    thisRef.clearFields();

    const str = sessionStorage.getItem('parameter');
    const parameter: ParamData[] = str ? JSON.parse(str) : [];
    const paramJahr = parameter.find((param) => param.key === 'CLUBJAHR');

    thisRef.backendService
      .exportAccountData(Number(paramJahr.value))
      .subscribe({
        next: (result) => {
          const filename = result.data.filename;
          thisRef.backendService.downloadFile(filename).subscribe({
            next: (data) => {
              if (data.body) {
                const blob = new Blob([data.body]);
                const downloadURL = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadURL;
                link.download = filename;
                link.click();
              }
            },
            complete: () => {},
          });
        },
      });
  };

  showProcess = (selRec?: Account) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: KontenComponent = this;
    thisRef.clearFields();

    if (selRec) {
      thisRef.dialogService.open(KontoBewegungenComponent, {
        data: {
          accountid: selRec.id,
        },
        header: 'Kontoauszug ' + selRec.longname,
        width: '90%',
        height: '90%',
        resizable: true,
        modal: true,
        maximizable: true,
        draggable: true,
      });
    }
  };

  save() {
    let sub: Observable<RetData>;

    if (this.addMode()) {
      sub = this.backendService.addAccount(this.selAccount);
    } else {
      sub = this.backendService.updAccount(this.selAccount);
    }
    sub.subscribe({
      complete: () => {
         
        this.backendService
          .getOneDataByOrder(this.selAccount.order!)
          .subscribe({
            next: (result) => {
              const entry = result.data as Account;
              if (this.addMode()) {
                const list = [...this.lstAccount(), this.selAccount];
                list.sort(
                  (a: Account, b: Account) =>
                    (a.order ? a.order : 0) - (b.order ? b.order : 0),
                );
                this.lstAccount.set(list);
              } else
                this.lstAccount.set(
                  this.lstAccount().map(
                    (obj) => [entry].find((o) => o.id === obj.id) || obj,
                  ),
                );

              this.clearFields();
            },
          });
      },
    });
  }
}
