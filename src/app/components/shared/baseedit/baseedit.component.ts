import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { TableData } from '../basetable/basetable.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Bind } from 'primeng/bind';
import { ScrollArea, ScrollAreaViewport, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaHandle } from 'primeng/scrollarea';
import { NgSwitch, NgClass } from '@angular/common';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { DatePicker } from 'primeng/datepicker';
import { Toolbar } from 'primeng/toolbar';
import { ButtonDirective } from 'primeng/button';

export class EditOptions {
  public title?: string;
}

export class EditFields {
  public label = '';
  public field = '';
  public format = '';
  public editable = false;
}

export class EditToolbar {
  public label: string;
  public btnClass: string;
  public icon: string;
  public isDefault: boolean;
  public clickfnc: (selRec?: TableData, lstData?: TableData[]) => void;
  constructor(
    label: string,
    btnClass: string,
    icon: string,
    isDefault: boolean,
    clickfnc: (
      selRec?: TableData | undefined,
      lstData?: TableData[] | undefined,
    ) => void,
  ) {
    this.label = label;
    this.btnClass = btnClass;
    this.icon = icon;
    this.isDefault = isDefault;
    this.clickfnc = clickfnc;
  }
}

@Component({
  selector: 'app-baseedit',
  templateUrl: './baseedit.component.html',
  styleUrls: ['./baseedit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    Bind,
    ScrollArea,
    ScrollAreaViewport,
    ScrollAreaContent,
    ScrollAreaScrollbar,
    ScrollAreaHandle,
    NgSwitch,
    InputText,
    InputNumber,
    DatePicker,
    Toolbar,
    ButtonDirective,
    NgClass,
  ],
})
export class BaseeditComponent {
  dialogService = inject(DialogService);

  readonly editOptions = input<EditOptions>({});
  readonly editFields = input<EditFields[]>([]);
  readonly editToolbar = input<EditToolbar[]>([]);
  readonly editData = input<TableData>({});

  clickOnToolbar(ind: number) {
    const editToolbar = this.editToolbar();
    if (editToolbar) {
      editToolbar[ind].clickfnc(this.editData());
    }
  }
}
