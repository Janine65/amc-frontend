import { ComponentFixture, TestBed } from '@angular/core/testing';
import { commonTestProviders } from '@app/testing/test-providers';

import { BaseTableComponent } from './basetable.component';
import { TableToolbar, TableOptions, TableData } from './basetable-types';

describe('BaseTableComponent (Logik)', () => {
  let fixture: ComponentFixture<BaseTableComponent>;
  let component: BaseTableComponent;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [BaseTableComponent],
      providers: commonTestProviders,
    }).compileComponents();

    fixture = TestBed.createComponent(BaseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  const buildToolbar = (opts: Partial<TableToolbar> = {}): TableToolbar => {
    return new TableToolbar(
      opts.label ?? 'Btn',
      opts.btnClass ?? 'primary',
      opts.icon ?? 'pi pi-plus',
      opts.isDefault ?? false,
      opts.disabledWhenEmpty ?? false,
      opts.disabledNoSelection ?? false,
      opts.roleNeeded ?? '',
      opts.clickfnc ?? (() => undefined),
      opts.isEditFunc ?? false,
    );
  };

  it('sollte erzeugt sein', () => {
    expect(component).toBeTruthy();
    expect(component.tableData()).toEqual([]);
    expect(component.tableOptions()).toEqual([]);
    expect(component.tableToolbar()).toEqual([]);
    expect(component.editable()).toBe(true);
  });

  describe('checkSorting / checkFiltering', () => {
    it('checkSorting() false, wenn keine Option sortable', () => {
      fixture.componentRef.setInput('tableOptions', [{ field: 'a' } as TableOptions]);
      expect(component.checkSorting()).toBe(false);
    });

    it('checkSorting() true, wenn eine Option sorting hat', () => {
      fixture.componentRef.setInput('tableOptions', [{ field: 'a', sorting: 'asc' } as TableOptions]);
      expect(component.checkSorting()).toBe(true);
    });

    it('checkFiltering() reagiert auf filtering', () => {
      fixture.componentRef.setInput('tableOptions', [{ field: 'a', filtering: true } as TableOptions]);
      expect(component.checkFiltering()).toBe(true);
    });
  });

  describe('isEditable (computed)', () => {
    it('ist false, wenn keine EditFunc gesetzt', () => {
      fixture.detectChanges();
      expect(component.isEditable()).toBe(false);
    });

    it('ist true, wenn Toolbar-Eintrag isEditFunc=true UND editable=true', () => {
      fixture.componentRef.setInput('tableToolbar', [
        buildToolbar({ isEditFunc: true }),
      ]);
      fixture.detectChanges();
      expect(component.isEditable()).toBe(true);
    });

    it('ist false, wenn editable=false, auch wenn EditFunc existiert', () => {
      fixture.componentRef.setInput('editable', false);
      fixture.componentRef.setInput('tableToolbar', [
        buildToolbar({ isEditFunc: true }),
      ]);
      fixture.detectChanges();
      expect(component.isEditable()).toBe(false);
    });
  });

  describe('isButtonAllowed / isButtonDisabled', () => {
    it('isButtonAllowed() true, wenn keine Rolle erforderlich', () => {
      fixture.componentRef.setInput('tableToolbar', [buildToolbar()]);
      expect(component.isButtonAllowed(0)).toBe(true);
    });

    it('isButtonAllowed() false, wenn Rolle passt nicht', () => {
      sessionStorage.setItem('user', JSON.stringify({ role: 'guest' }));
      fixture.componentRef.setInput('tableToolbar', [buildToolbar({ roleNeeded: 'editor' })]);
      expect(component.isButtonAllowed(0)).toBe(false);
    });

    it('isButtonAllowed() true, wenn User admin', () => {
      sessionStorage.setItem('user', JSON.stringify({ role: 'admin' }));
      fixture.componentRef.setInput('tableToolbar', [buildToolbar({ roleNeeded: 'editor' })]);
      expect(component.isButtonAllowed(0)).toBe(true);
    });

    it('isButtonDisabled() true, wenn nichts selektiert und disabledNoSelection=true', () => {
      fixture.componentRef.setInput('tableToolbar', [buildToolbar({ disabledNoSelection: true })]);
      expect(component.isButtonDisabled(0)).toBe(true);
    });

    it('isButtonDisabled() false, wenn Selektion vorhanden', () => {
      fixture.componentRef.setInput('tableToolbar', [buildToolbar({ disabledNoSelection: true })]);
      component.selectedRecord.set({ id: 1 } as TableData);
      expect(component.isButtonDisabled(0)).toBe(false);
    });

    it('isButtonDisabled() true, wenn gefilterte Liste leer und disabledWhenEmpty=true', () => {
      fixture.componentRef.setInput('tableOptions', [{ field: 'a', filtering: true } as TableOptions]);
      fixture.componentRef.setInput('tableToolbar', [buildToolbar({ disabledWhenEmpty: true })]);
      component.filteredRows.set([]);
      expect(component.isButtonDisabled(0)).toBe(true);
    });
  });

  describe('selectData / editData', () => {
    it('selectData() setzt selectedRecord und ruft Default-Func auf', () => {
      const fn = jest.fn();
      fixture.componentRef.setInput('tableToolbar', [
        buildToolbar({ isDefault: true, clickfnc: fn }),
      ]);
      const rec: TableData = { id: 42 };
      component.selectData(rec);
      expect(component.selectedRecord()).toEqual(rec);
      expect(fn).toHaveBeenCalledWith(rec);
    });

    it('editData() ruft Edit-Func auf, wenn vorhanden', () => {
      const fn = jest.fn();
      fixture.componentRef.setInput('tableToolbar', [
        buildToolbar({ isEditFunc: true, clickfnc: fn }),
      ]);
      const rec: TableData = { id: 7 };
      component.editData(rec);
      expect(fn).toHaveBeenCalledWith(rec);
    });
  });

  describe('clickOnToolbar', () => {
    it('ruft die richtige Toolbar-Funktion mit Selektion und Filter-Rows auf', () => {
      const fn = jest.fn();
      const rec: TableData = { id: 3 };
      fixture.componentRef.setInput('tableToolbar', [buildToolbar({ clickfnc: fn })]);
      component.selectedRecord.set(rec);
      component.filteredRows.set([rec]);
      component.clickOnToolbar(0);
      expect(fn).toHaveBeenCalledWith(rec, [rec]);
    });
  });

  describe('filterEvent', () => {
    it('setzt filteredRows aus event.filteredValue', () => {
      const rows: TableData[] = [{ id: 1 }, { id: 2 }];
      component.filterEvent({ filteredValue: rows });
      expect(component.filteredRows()).toEqual(rows);
    });

    it('setzt leeres Array, wenn kein filteredValue', () => {
      component.filterEvent({});
      expect(component.filteredRows()).toEqual([]);
    });
  });
});
