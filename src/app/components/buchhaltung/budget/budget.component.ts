 
import { Component, HostListener, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Account, Budget, Fiscalyear, ParamData } from '@model/datatypes';
import { AlertService, BackendService } from '@app/service';
import { AlertType } from '@app/models';
import {
  ConfirmationService,
  MessageService,
} from 'primeng/api';
import { map, zip } from 'rxjs';
import { Bind } from 'primeng/bind';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    Bind,
    Select,
    FormsModule,
    ButtonDirective,
    Ripple,
    TableModule,
    InputNumber,
    InputText,
    ConfirmDialog,
    DecimalPipe,
  ],
})
export class BudgetComponent {
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private alertService = inject(AlertService);

  readonly selJahre = signal<{ label?: string; value?: number }[]>([]);
  selJahr = 0;
  parameter: ParamData[];
  jahr: number;
  readonly lstBudget = signal<Budget[]>([]);
  clonedlstBudget: Budget[] = [];
  selBudget: Budget = {};
  readonly lstAccounts = signal<Account[]>([]);
  readonly loading = signal(true);
  readonly addRow = signal(false);
  selFiscalyear: Fiscalyear = {};
  readonly objHeight$ = signal('500px');
  private getScreenWidth = 0;
  private getScreenHeight = 0;

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

    this.backendService.getAccount().subscribe({
      next: (list) => {
        const lAcc = list.data as Account[];
        const accounts: Account[] = [];
        lAcc.forEach((rec) => {
          if (rec.level && rec.level >= 4) {
            rec.disabled = rec.status == 0;
            accounts.push(rec);
          }
        });
        this.lstAccounts.set(accounts);
      },
    });

    this.readBudget();
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    this.getHeight();
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    this.getHeight();
  }

  private getHeight() {
    this.objHeight$.set((this.getScreenHeight - 300).toFixed(0) + 'px');
  }

  readBudget() {
    this.loading.set(true);
    zip(
      this.backendService.getBudget(this.selJahr),
      this.backendService.getOneFiscalyear(this.selJahr.toFixed(0)),
    )
      .pipe(
        map(([list, result]) => {
          const data = list.data as Budget[];
          data.forEach((rec) => {
            rec.acc_id = rec.account_budget_accountToaccount?.id;
            rec.acc_name = rec.account_budget_accountToaccount?.name;
            rec.acc_order = rec.account_budget_accountToaccount?.order;
            if (rec.account_budget_accountToaccount?.status == 0)
              rec.classRow = 'inactive';
          });
          this.lstBudget.set(data);
          this.selFiscalyear = result.data as Fiscalyear;
          this.loading.set(false);
        }),
      )
      .subscribe();
  }

  chgJahr() {
    this.readBudget();
  }

  isEditable() {
    if (this.selFiscalyear) return this.selFiscalyear.state < 3;
    else return false;
  }

  copyYear() {
    const nextYear = this.selJahr + 1;

    this.backendService.getOneFiscalyear(nextYear.toFixed(0)).subscribe({
      next: (retData) => {
        if (retData.type == 'info') {
          if (retData.data != null && retData.data instanceof Fiscalyear) {
            this.confirmationService.confirm({
              message:
                'Die Daten werden vom Jahr ' +
                this.selJahr +
                ' zum Jahr ' +
                nextYear +
                ' kopiert. Alle vorhandenen Einträge werden vorgängig gelöscht. Bitte bestätige diesen Vorgang',
              accept: () => {
                this.backendService
                  .copyBudget(this.selJahr, nextYear)
                  .subscribe({
                    complete: () => {
                      this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Kopiervorgang abgeschlossen',
                      });
                    },
                    error: (err) => {
                      this.messageService.add({
                        severity: 'error',
                        summary: 'Fehler',
                        detail: err.message,
                      });
                    },
                  });
              },
            });
          } else {
            this.alertService.alert({
              autoClose: false,
              fade: false,
              type: AlertType.Error,
              message: `Das Geschäftsjahr ${nextYear} muess zuerst eröffnet werden.`,
              keepAfterRouteChange: false,
            });
          }
        }
      },
    });
  }

  rowIsEditing(data: Budget): boolean {
    if (this.clonedlstBudget[data.id]) return true;
    else return false;
  }

  chgAcc(budget: Budget) {
    const acc = this.lstAccounts().find((rec) => rec.id == budget.acc_id);
    if (acc) {
      budget.acc_name = acc.name;
      budget.acc_order = acc.order;
    }
  }

  onRowEditInit(budget: Budget) {
    this.clonedlstBudget[budget.id] = { ...budget };
    this.addRow.set(false);
  }

  onRowEditSave(budget: Budget) {
    budget.account = budget.acc_id;
    let sub;
    if (budget.id === 0) sub = this.backendService.addBudget(budget);
    else sub = this.backendService.updBudget(budget);

    sub.subscribe({
      next: (rec: Budget) => {
        this.addRow.set(false);
        delete this.clonedlstBudget[budget.id];
        const ind: Budget | undefined = this.lstBudget().find(
          (rec) => rec.id == budget.id,
        );
        if (ind) {
          Object.assign(ind, rec);
          ind.acc_id = ind.account;
          const acc = this.lstAccounts().find((rec) => rec.id == ind.acc_id);
          if (acc) {
            ind.acc_name = acc.name;
            ind.acc_order = acc.order;
          }
        }
        this.lstBudget.set([...this.lstBudget()]);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'budget is updated',
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: err.message,
        });
      },
    });
  }

  onRowEditDelete(budget: Budget) {
    this.backendService.delBudget(budget).subscribe({
      next: () => {
        delete this.clonedlstBudget[budget.id];
        this.lstBudget.set(
          this.lstBudget().filter((rec) => rec.id != budget.id),
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'budget is deleted',
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Fehler',
          detail: err.message,
        });
      },
    });
  }

  onRowEditCancel(budget: Budget, index: number) {
    const list = [...this.lstBudget()];
    if (budget.id === 0) {
      list.splice(index, 1);
    } else {
      list[index] = this.clonedlstBudget[budget.id];
    }
    this.lstBudget.set(list);
    delete this.clonedlstBudget[budget.id];
    this.addRow.set(false);
  }

  onAddNewRow() {
    const newRow: Budget = {
      id: 0,
      acc_id: null,
      acc_name: null,
      acc_order: null,
      amount: 0,
      memo: '',
      year: this.selJahr,
    };
    this.lstBudget.set([newRow, ...this.lstBudget()]);
    this.clonedlstBudget[0] = { ...newRow };
    this.addRow.set(true);
  }
}
