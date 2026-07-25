 
 
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Fiscalyear } from '@model/datatypes';
import { BackendService, RetData } from '@app/service';
import {
  TableOptions,
  TableToolbar,
} from '@shared/basetable/basetable.component';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Observable, from, map, timer, zip } from 'rxjs';
import { Bind } from 'primeng/bind';
import { Splitter } from 'primeng/splitter';
import { BaseTableComponent } from '../../shared/basetable/basetable.component';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ProgressBar } from 'primeng/progressbar';
import { Tag } from 'primeng/tag';

type Severity =
  | 'success'
  | 'secondary'
  | 'info'
  | 'warn'
  | 'danger'
  | 'contrast'
  | undefined;

@Component({
  selector: 'app-geschaeftsjahr',
  templateUrl: './geschaeftsjahr.component.html',
  styleUrls: ['./geschaeftsjahr.component.scss'],
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
    Dialog,
    ProgressBar,
    Tag,
  ],
})
export class GeschaeftsjahrComponent implements OnInit {
  private backendService = inject(BackendService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);

  readonly lstFiscalyear = signal<Fiscalyear[]>([]);
  selFiscalyear: Fiscalyear = {};
  readonly loading = signal(true);
  readonly cols = signal<TableOptions[]>([]);
  readonly toolbar = signal<TableToolbar[]>([]);
  readonly editMode = signal(false);
  readonly addMode = signal(false);
  readonly progressVisible = signal(false);
  readonly fSev = signal<Severity>('info');
  readonly fValue = signal('gestartet');
  readonly kSev = signal<Severity>('info');
  readonly kValue = signal('gestartet');
  readonly jSev = signal<Severity>('info');
  readonly jValue = signal('gestartet');

  readonly lstStates = signal([
    { label: 'Offen', value: 1 },
    { label: 'provisorisch Abgeschlossen', value: 2 },
    { label: 'Abgeschlossen', value: 3 },
  ]);
  selState = 1;

  ngOnInit(): void {
    this.cols.set([
      {
        field: 'year',
        header: 'Jahr',
        format: false,
        sortable: false,
        filtering: false,
        filter: undefined,
      },
      {
        field: 'name',
        header: 'Bezeichnung',
        format: false,
        sortable: false,
        filtering: false,
        filter: undefined,
      },
      {
        field: 'state',
        header: 'Status',
        format: true,
        sortable: false,
        filtering: false,
        filter: undefined,
      },
    ]);

    this.toolbar.set([
      {
        label: 'Edit',
        btnClass: 'p-button-primary p-button-outlined',
        icon: 'pi pi-file-edit',
        isDefault: true,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.editFiscalyear,
        roleNeeded: '',
        isEditFunc: true,
      },
      {
        label: 'Delete',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-minus',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.delFiscalyear,
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
        clickfnc: this.addFiscalyear,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Export',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-file-excel',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.exportFiscalyear,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'prov. Abschliessen',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-file-excel',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.closeTempFiscalyear,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Abschliessen',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-file-excel',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.closeFiscalyear,
        roleNeeded: '',
        isEditFunc: false,
      },
    ]);

    from(this.backendService.getFiscalyear()).subscribe((list) => {
      const data = list.data as Fiscalyear[];
      data.forEach((rec) => {
        switch (rec.state) {
          case 1:
            rec.classRow = 'offen';
            break;
          case 2:
            rec.classRow = 'provisorisch';
            break;
          case 3:
            rec.classRow = 'abgeschlossen';
            break;
        }
      });
      this.lstFiscalyear.set(data);
      this.loading.set(false);
    });
  }

  formatField(
    field: string,
    value: string | number | boolean | null,
  ): string | number | boolean | null {
    if (field == 'state') {
      switch (value as number) {
        case 1:
          return 'Offen';

        case 2:
          return 'Provisorisch abgeschlossen';

        case 3:
          return 'Abgeschlossen';
      }
    }
    return value;
  }

  closeTempFiscalyear = (selRec?: Fiscalyear) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: GeschaeftsjahrComponent = this;
    thisRef.messageService.clear();
    this.clearFields();

    if (selRec)
      this.backendService.closeFiscalyear(selRec.year, 2).subscribe({
        complete: () => {
          this.loading.set(true);
          from(this.backendService.getFiscalyear()).subscribe((list) => {
            const data = list.data as Fiscalyear[];
            data.forEach((rec) => {
              switch (rec.state) {
                case 1:
                  rec.classRow = 'offen';
                  break;
                case 2:
                  rec.classRow = 'provisorisch';
                  break;
                case 3:
                  rec.classRow = 'abgeschlossen';
                  break;
              }
            });
            this.lstFiscalyear.set(data);
            this.loading.set(false);
            thisRef.messageService.add({
              detail: 'Das Geschäftsjahr wurde provisorisch abgeschlossen',
              closable: true,
              severity: 'info',
              sticky: false,
              summary: 'Geschäftsjahr abschliessen',
            });
          });
        },
      });
  };

  closeFiscalyear = (selRec?: Fiscalyear) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: GeschaeftsjahrComponent = this;
    thisRef.messageService.clear();
    this.clearFields();

    if (selRec)
      this.backendService.closeFiscalyear(selRec.year, 3).subscribe({
        complete: () => {
          this.loading.set(true);
          from(this.backendService.getFiscalyear()).subscribe((list) => {
            const data = list.data as Fiscalyear[];
            data.forEach((rec) => {
              switch (rec.state) {
                case 1:
                  rec.classRow = 'offen';
                  break;
                case 2:
                  rec.classRow = 'provisorisch';
                  break;
                case 3:
                  rec.classRow = 'abgeschlossen';
                  break;
              }
            });
            this.lstFiscalyear.set(data);
            this.loading.set(false);
            thisRef.messageService.add({
              detail: 'Das Geschäftsjahr wurde abgeschlossen',
              closable: true,
              severity: 'info',
              sticky: false,
              summary: 'Geschäftsjahr abschliessen',
            });
          });
        },
      });
  };

  editFiscalyear = (selRec?: Fiscalyear) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: GeschaeftsjahrComponent = this;
    thisRef.messageService.clear();
    this.clearFields();
    this.editMode.set(true);
    if (selRec) Object.assign(this.selFiscalyear, selRec);
  };

  delFiscalyear = (selRec?: Fiscalyear) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: GeschaeftsjahrComponent = this;
    thisRef.messageService.clear();
    this.clearFields();

    if (selRec)
      this.backendService.delFiscalyear(selRec).subscribe({
        complete: () => {
          thisRef.lstFiscalyear.set(
            thisRef.lstFiscalyear().filter((r) => r !== selRec),
          );

          thisRef.messageService.add({
            detail: 'Das Geschäftsjahr ' + selRec.year + ' wurde gelöscht',
            closable: true,
            severity: 'info',
            sticky: false,
            summary: 'Geschäftsjahr löschen',
          });
        },
      });
  };

  addFiscalyear = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: GeschaeftsjahrComponent = this;
    this.clearFields();
    this.selFiscalyear.state = 1;
    thisRef.messageService.clear();
    this.addMode.set(true);
  };

  exportFiscalyear = (selRec?: Fiscalyear) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: GeschaeftsjahrComponent = this;
    thisRef.messageService.clear();
    this.fSev.set('info');
    this.fValue.set('gestartet');
    this.kSev.set('info');
    this.kValue.set('gestartet');
    this.jSev.set('info');
    this.jValue.set('gestartet');
    thisRef.progressVisible.set(true);

    thisRef.fSev.set('warn');
    thisRef.fValue.set('gestartet');
    let filename: string = '';

    zip([
      thisRef.backendService.exportAccData(Number(selRec.year)),
      thisRef.backendService.exportAccountData(Number(selRec.year)),
      thisRef.backendService.exportJournal(Number(selRec.year), 1),
    ])
      .pipe(
        map(([accDataResult, accountDataResult, journalResult]) => {
          // Handle Acc Data Result
          if (accDataResult.type == 'info') {
            filename = accDataResult.data.filename;
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
              complete: () => {
                thisRef.fSev.set('success');
                thisRef.fValue.set('geladen');
              },
            });
          } else {
            thisRef.fSev.set('danger');
            thisRef.fValue.set('Fehler');
            return;
          }

          // Handle Account Data Result
          if (accountDataResult.type == 'info') {
            const accountFilename = accountDataResult.data.filename;
            thisRef.backendService.downloadFile(accountFilename).subscribe({
              next: (data) => {
                if (data.body) {
                  const blob = new Blob([data.body]);
                  const downloadURL = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = downloadURL;
                  link.download = accountFilename;
                  link.click();
                }
              },
              complete: () => {
                thisRef.kSev.set('success');
                thisRef.kValue.set('geladen');
              },
            });
          } else {
            thisRef.kSev.set('danger');
            thisRef.kValue.set('Fehler');
            return;
          }

          // Handle Journal Result
          if (journalResult.type == 'info') {
            const journalFilename = journalResult.data.filename;
            thisRef.backendService.downloadFile(journalFilename).subscribe({
              next: (data) => {
                if (data.body) {
                  const blob = new Blob([data.body]);
                  const downloadURL = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = downloadURL;
                  link.download = journalFilename;
                  link.click();
                }
              },
              complete: () => {
                thisRef.jSev.set('success');
                thisRef.jValue.set('geladen');
                timer(2000).subscribe(() => {
                  thisRef.progressVisible.set(false);
                });
              },
            });
          } else {
            thisRef.kSev.set('danger');
            thisRef.kValue.set('Fehler');
            return;
          }
        }),
      )
      .subscribe();
  };

  private clearFields() {
    this.addMode.set(false);
    this.editMode.set(false);
    this.selFiscalyear = {};
  }
  save() {
    let sub: Observable<RetData>;

    if (this.addMode) {
      sub = this.backendService.addFiscalyear(this.selFiscalyear);
    } else {
      sub = this.backendService.updFiscalyear(this.selFiscalyear);
    }
    sub.subscribe({
      complete: () => {
         
        this.backendService
          .getOneFiscalyear(this.selFiscalyear.year)
          .subscribe({
            next: (entry) => {
              const fisc = entry.data as Fiscalyear;
              if (this.addMode()) {
                const list = [...this.lstFiscalyear(), fisc];
                list.sort(
                  (a: Fiscalyear, b: Fiscalyear) =>
                    (b.year ? parseInt(b.year) : 0) -
                    (a.year ? parseInt(a.year) : 0),
                );
                this.lstFiscalyear.set(list);
              } else
                this.lstFiscalyear.set(
                  this.lstFiscalyear().map(
                    (obj) => [fisc].find((o) => o.id === obj.id) || obj,
                  ),
                );

              this.clearFields();
            },
          });
      },
    });
  }
}
