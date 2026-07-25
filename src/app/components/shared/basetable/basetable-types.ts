export class TableOptions {
  public header?: string;
  public field?: string;
  public pipe?: any;
  public args?: [any] | any;
  public format = false;
  public sortable = false;
  public sorting?: string;
  public filtering = false;
  public filter?: string;
  public class?: string;
}

export class TableData {
  public id?: number;
  public createdAt?: Date;
  public updatedAt?: Date;
  public classRow?: string;
}

export class TableToolbar {
  public label: string;
  public btnClass: string;
  public icon: string;
  public isDefault: boolean;
  public disabledWhenEmpty: boolean;
  public disabledNoSelection: boolean;
  public roleNeeded: string;
  public isEditFunc: boolean;
  public clickfnc: (selRec?: TableData, lstData?: TableData[]) => void;
  constructor(
    label: string,
    btnClass: string,
    icon: string,
    isDefault: boolean,
    disabledWhenEmpty: boolean,
    disabledNoSelection: boolean,
    roleNeeded: string,
    clickfnc: (
      selRec?: TableData | undefined,
      lstData?: TableData[] | undefined,
    ) => void,
    isEditFunc = false,
  ) {
    this.label = label;
    this.btnClass = btnClass;
    this.icon = icon;
    this.isDefault = isDefault;
    this.roleNeeded = roleNeeded ?? roleNeeded;
    this.disabledWhenEmpty = disabledWhenEmpty;
    this.disabledNoSelection = disabledNoSelection;
    this.clickfnc = clickfnc;
    this.isEditFunc = isEditFunc;
  }
}
