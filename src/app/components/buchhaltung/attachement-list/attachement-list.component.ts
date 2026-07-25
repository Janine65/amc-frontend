/* eslint-disable @typescript-eslint/no-this-alias */
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Receipt } from '@model/datatypes';
import { BackendService } from '@app/service';
import {
  TableOptions,
  TableToolbar,
} from '@shared/basetable/basetable.component';
import {
  ConfirmationService,
  MessageService,
} from 'primeng/api';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { AttachementShowComponent } from '../attachement-show/attachement-show.component';
import { DecimalPipe } from '@angular/common';
import { BaseTableComponent } from '../../shared/basetable/basetable.component';
import { Bind } from 'primeng/bind';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Dialog } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-attachement-list',
  templateUrl: './attachement-list.component.html',
  styleUrls: ['./attachement-list.component.scss'],
  providers: [DialogService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    BaseTableComponent,
    Bind,
    ConfirmDialog,
    Dialog,
    FormsModule,
    InputText,
    ButtonDirective,
  ],
})
export class AttachementListComponent {
  private backendService = inject(BackendService);
  ref = inject(DynamicDialogRef);
  config = inject(DynamicDialogConfig);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  journalid: number;
  jahr: number;
  readonly lstReceipts = signal<Receipt[]>([]);
  configType = '';

  loading = true;
  readonly cols = signal<TableOptions[]>([]);
  readonly toolbar = signal<TableToolbar[]>([]);
  visible = false;
  selAtt: Receipt = {};

  constructor() {
    const config = this.config;

    this.journalid = config.data.journalid;
    this.jahr = config.data.jahr;
    this.configType = config.data.type;

    const cols: TableOptions[] = [
      {
        field: 'receipt',
        header: 'Attachement',
        format: false,
        sortable: true,
        filtering: false,
        filter: undefined,
      },
      {
        field: 'bezeichnung',
        header: 'Beschreibung',
        format: false,
        sortable: true,
        filtering: false,
        filter: undefined,
      },
    ];
    this.cols.set(cols);

    const toolbar: TableToolbar[] = [
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
      {
        label: 'Anzeigen',
        btnClass: 'p-button-primary p-button-outlined',
        clickfnc: this.show,
        disabledNoSelection: true,
        disabledWhenEmpty: true,
        icon: '',
        isDefault: true,
        roleNeeded: '',
        isEditFunc: false,
      },
    ];

    if (config.data.editable) {
      toolbar.push(
        {
          label: 'Ändern',
          btnClass: 'p-button-secondary p-button-outlined',
          clickfnc: this.edit,
          disabledNoSelection: true,
          disabledWhenEmpty: true,
          icon: '',
          isDefault: false,
          roleNeeded: 'admin',
          isEditFunc: true,
        },
        {
          label: 'Löschen',
          btnClass: 'p-button-secondary p-button-outlined p-button-danger',
          clickfnc: this.del,
          disabledNoSelection: true,
          disabledWhenEmpty: true,
          icon: '',
          isDefault: false,
          roleNeeded: 'admin',
          isEditFunc: false,
        },
      );
    }
    if (this.configType == 'one' && this.journalid) {
      this.backendService.getAttachment(this.journalid).subscribe((list) => {
        this.lstReceipts.set(list.data as Receipt[]);
      });
    } else {
      this.backendService
        .getAllAttachment(this.jahr, this.journalid)
        .subscribe((list) => {
          const receipts = list.data as Receipt[];
          receipts.forEach(
            (att) => (att.cntjournal = att.journal_receipt.length),
          );
          this.lstReceipts.set(receipts);
          this.cols.set([
            ...this.cols(),
            {
              field: 'cntjournal',
              header: 'Anzahl Journaleinträge',
              format: false,
              sortable: true,
              filtering: false,
              filter: undefined,
              pipe: DecimalPipe,
              args: '1.0-0',
            },
          ]);
        });
      if (this.configType == 'add' && this.journalid) {
        if (config.data.editable) {
          toolbar.splice(3, 1);
          toolbar.push({
            label: 'Hinzufügen',
            btnClass: 'p-button-secondary p-button-outlined',
            clickfnc: this.addAtt,
            disabledNoSelection: true,
            disabledWhenEmpty: true,
            icon: '',
            isDefault: false,
            roleNeeded: 'admin',
            isEditFunc: false,
          });
        }
      }
    }
    this.toolbar.set(toolbar);
  }

  show = (selRec?: Receipt) => {
    const thisRef = this;

    if (selRec)
      thisRef.dialogService.open(AttachementShowComponent, {
        data: {
          receipt: selRec.receipt,
          year: this.jahr.toFixed(),
        },
        header: 'Attachment anzeigen ' + selRec.receipt,
        width: '90%',
        height: '90%',
        resizable: true,
        modal: true,
        maximizable: true,
        draggable: true,
      });
  };

  addAtt = (selRec?: Receipt) => {
    const thisRef = this;
    if (selRec) {
      thisRef.backendService.addAtt(this.journalid, [selRec]).subscribe({
        next: () => {
          thisRef.lstReceipts.set(
            thisRef.lstReceipts().filter((rec) => rec.id !== selRec.id),
          );
        },
      });
    }
  };

  edit = (selRec?: Receipt) => {
    const thisRef = this;
    if (selRec) {
      thisRef.selAtt = selRec;
      thisRef.visible = true;
    }
  };

  editAttBez() {
    this.visible = false;
    this.backendService.updReceipt(this.selAtt).subscribe({
      next: () => {
        const list = [...this.lstReceipts()];
        const ind = list.findIndex((rec) => rec.id === this.selAtt.id);
        if (ind >= 0) list[ind].bezeichnung = this.selAtt.bezeichnung;
        this.lstReceipts.set(list);
        this.selAtt = {};
      },
    });
  }

  del = (selRec?: Receipt) => {
    const thisRef = this;
    if (selRec) {
      if (this.configType == 'one') {
        thisRef.backendService.delAtt(this.journalid, selRec).subscribe({
          next: () => {
            thisRef.lstReceipts.set(
              thisRef.lstReceipts().filter((rec) => rec.id !== selRec.id),
            );
          },
        });
      } else {
        if (selRec.cntjournal && selRec.cntjournal > 0) {
          thisRef.confirmationService.confirm({
            message:
              'Es gibt Journaleinträge, die dieses Attachment verwenden. Bist du sicher, dass du dieses endgültig löschen willst?',
            accept: () => {
              thisRef.backendService.delReceipt(selRec).subscribe({
                next: () => {
                  thisRef.lstReceipts.set(
                    thisRef.lstReceipts().filter((r) => r !== selRec),
                  );
                  thisRef.messageService.add({
                    summary: 'Attachment löschen',
                    detail: 'Das Attachment wurde gelöscht',
                    severity: 'info',
                    sticky: false,
                  });
                },
              });
            },
          });
        } else {
          thisRef.backendService.delReceipt(selRec).subscribe({
            next: () => {
              thisRef.lstReceipts.set(
                thisRef.lstReceipts().filter((r) => r !== selRec),
              );
              thisRef.messageService.add({
                summary: 'Attachment löschen',
                detail: 'Das Attachment wurde gelöscht',
                severity: 'info',
                sticky: false,
              });
            },
          });
        }
      }
    }
  };
  back = () => {
    this.ref.close();
  };
}
