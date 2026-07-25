import { DecimalPipe } from '@angular/common';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { AccountService } from '@app/service';
import { Table, TableModule } from 'primeng/table';
import { Bind } from 'primeng/bind';
import { Toast } from 'primeng/toast';
import { ButtonDirective } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { DynamicPipe } from '@shared/basetable/dynamicpipe';

export { TableOptions, TableData, TableToolbar } from './basetable-types';
import { TableData, TableOptions, TableToolbar } from './basetable-types';

@Component({
  selector: 'app-basetable',
  templateUrl: './basetable.component.html',
  styleUrls: ['./basetable.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    Bind,
    Toast,
    ButtonDirective,
    TableModule,
    Ripple,
    DynamicPipe,
  ],
})
export class BaseTableComponent implements OnInit, OnDestroy {
  private accountService = inject(AccountService);

  readonly tableOptions = input<TableOptions[]>([]);
  readonly tableData = input<TableData[]>([]);
  readonly formatFunction = input<
    | ((
        field: string,
        value: string | number | boolean | null,
      ) => string | number | boolean | null)
    | undefined
  >(undefined);
  readonly tableToolbar = input<TableToolbar[]>([]);
  readonly localStorage = input('basetable');
  readonly diffCalcHight = input(300);
  readonly editable = input(true);
  readonly rowClassField = input('');

  readonly selectedRecord = signal<TableData | undefined>(undefined);
  readonly filteredRows = signal<TableData[]>([]);
  readonly objHeight$ = signal('500px');
  readonly isEditable = computed(
    () => this.editable() && !!this.getEditFunc(),
  );
  getScreenWidth = 0;
  getScreenHeight = 0;
  DecimalPipe?: DecimalPipe;

  @HostListener('window:resize')
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    this.getHeight();
  }

  ngOnInit(): void {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    this.getHeight();
  }

  ngOnDestroy() {
    return;
  }

  private getHeight() {
    this.objHeight$.set(
      (this.getScreenHeight - this.diffCalcHight()).toFixed(0) + 'px',
    );
  }

  clear(table: Table) {
    table.clear();
    localStorage.removeItem(this.localStorage());
  }

  checkSorting(): boolean {
    let retVal = false;
    retVal = this.tableOptions().find((opt) => opt.sorting) != undefined;
    return retVal;
  }

  checkFiltering(): boolean {
    let retVal = false;
    retVal = this.tableOptions().find((opt) => opt.filtering) != undefined;
    return retVal;
  }

  getEditFunc() {
    const tableToolbar = this.tableToolbar();
    const funcEdit = tableToolbar?.findIndex((entry) => entry.isEditFunc);
    if (funcEdit != undefined && funcEdit > -1)
      if (this.isButtonAllowed(funcEdit))
        return tableToolbar?.at(funcEdit)?.clickfnc;

    return false;
  }

  retDefaultFunc(): any {
    const tableToolbar = this.tableToolbar();
    const funcDefault = tableToolbar?.find((entry) => entry.isDefault);
    if (funcDefault) {
      // check first the role
      const ind = tableToolbar?.findIndex(
        (value) => value.label == funcDefault.label,
      );
      if (ind != undefined && !this.isButtonDisabled(ind))
        return funcDefault.clickfnc;
    }
    return;
  }

  filterEvent(event: any) {
    this.filteredRows.set(event.filteredValue ?? []);
  }

  selectData(data: TableData) {
    this.selectedRecord.set(data);
    const funcDefault = this.retDefaultFunc();
    if (funcDefault && this.selectedRecord())
      funcDefault(this.selectedRecord());
  }

  editData(data: TableData) {
    this.selectedRecord.set(data);
    const funcDefault = this.getEditFunc();
    if (funcDefault && this.selectedRecord())
      funcDefault(this.selectedRecord());
  }

  isButtonAllowed(ind: number): boolean {
    const tableToolbar = this.tableToolbar();
    if (tableToolbar) {
      if (tableToolbar[ind].roleNeeded != '') {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role != tableToolbar[ind].roleNeeded && user.role != 'admin')
            return false;
        }
      }
    }
    return true;
  }

  isButtonDisabled(ind: number): boolean {
    const tableToolbar = this.tableToolbar();
    if (tableToolbar) {
      if (!this.isButtonAllowed(ind)) return true;
      if (this.filteredRows().length == 0 && this.checkFiltering())
        return tableToolbar[ind].disabledWhenEmpty;

      if (this.selectedRecord() == undefined)
        return tableToolbar[ind].disabledNoSelection;

      return false;
    }

    return true;
  }

  clickOnToolbar(ind: number) {
    const tableToolbar = this.tableToolbar();
    if (tableToolbar) {
      tableToolbar[ind].clickfnc(
        this.selectedRecord() ?? undefined,
        this.filteredRows(),
      );
    }
  }
}
