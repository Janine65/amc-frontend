/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  TableData,
  TableOptions,
  TableToolbar,
} from '@app/components/shared/basetable/basetable.component';
import { User } from '@app/models';
import { AccountService } from '@app/service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { AddEditComponent } from '../add-edit/add-edit.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DecimalPipe } from '@angular/common';
import { BaseTableComponent } from '../../shared/basetable/basetable.component';
import { Bind } from 'primeng/bind';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  providers: [DialogService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [BaseTableComponent, Bind, ConfirmDialog],
})
export class ListComponent implements OnInit {
  private accountService = inject(AccountService);
  private dialogService = inject(DialogService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  readonly userList = signal<User[]>([]);
  readonly loading = signal(true);
  subs!: Subscription;

  dialogRef?: DynamicDialogRef;
  readonly cols = signal<TableOptions[]>([]);
  readonly toolbar = signal<TableToolbar[]>([]);

  ngOnInit(): void {
    this.cols.set([
      {
        field: 'id',
        header: 'ID',
        format: false,
        sortable: false,
        filtering: false,
        filter: '',
        pipe: DecimalPipe,
        args: '1.0-0',
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
        field: 'email',
        header: 'Email',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'text',
      },
      {
        field: 'role',
        header: 'Rolle',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'text',
      },
      {
        field: 'last_login',
        header: 'Letzter Login',
        format: false,
        sortable: true,
        filtering: true,
        filter: 'text',
      },
    ]);

    this.toolbar.set([
      {
        label: 'Ändern',
        btnClass: 'p-button-primary p-button-outlined',
        icon: 'pi pi-user-edit',
        isDefault: true,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.editUser,
        roleNeeded: '',
        isEditFunc: true,
      },
      {
        label: 'Register',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-user-plus',
        isDefault: false,
        disabledWhenEmpty: false,
        disabledNoSelection: false,
        clickfnc: this.addUser,
        roleNeeded: '',
        isEditFunc: false,
      },
      {
        label: 'Löschen',
        btnClass: 'p-button-secondary p-button-outlined',
        icon: 'pi pi-user-minus',
        isDefault: false,
        disabledWhenEmpty: true,
        disabledNoSelection: true,
        clickfnc: this.delUser,
        roleNeeded: '',
        isEditFunc: false,
      },
    ]);

    this.accountService.getAll().subscribe((list) => {
      this.userList.set(list.data as User[]);
      this.loading.set(false);
    });
  }

  addUser = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: ListComponent = this;
    const newUser = new User();
    newUser.role = 'user';

    thisRef.dialogRef = thisRef.dialogService.open(AddEditComponent, {
      data: {
        user: newUser,
        withRole: true,
        withPwd: false,
      },
      header: 'Neuen Benutzer registrieren',
      width: '70%',
      height: '70%',
      resizable: true,
      modal: true,
      maximizable: true,
      draggable: true,
    });
    thisRef.dialogRef.onClose.subscribe((user: User) => {
      if (user) {
        this.userList.set([...this.userList(), user]);
      }
    });
  };

  editUser = (selRec?: TableData | undefined) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: ListComponent = this;
    const newUser = structuredClone(selRec);

    thisRef.dialogRef = thisRef.dialogService.open(AddEditComponent, {
      data: {
        user: newUser,
        withRole: true,
        withPwd: false,
      },
      header: 'User ändern',
      width: '70%',
      height: '70%',
      resizable: true,
      modal: true,
      maximizable: true,
      draggable: true,
    });
    thisRef.dialogRef.onClose.subscribe((user: User) => {
      if (user) {
        // update List
        thisRef.userList.set(
          thisRef
            .userList()
            .map((obj) => [user].find((o) => o.id === obj.id) || obj),
        );
      }
    });
  };

  delUser = (selRec?: TableData) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisRef: ListComponent = this;
    thisRef.confirmationService.confirm({
      message: 'Bist Du sicher, dass du diesen Benutzer löschen willst?',
      accept: () => {
        thisRef.accountService.delete((selRec as User).id || -1).subscribe({
          next: () => {
            thisRef.userList.set(
              thisRef.userList().filter((u) => u !== (selRec as User)),
            );
            thisRef.messageService.add({
              summary: 'User löschen',
              detail: 'Der User wurde gelöscht',
              severity: 'info',
              sticky: false,
            });
          },
        });
      },
    });
  };
}
