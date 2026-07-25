import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ParamData } from '@model/datatypes';
import { BackendService, RetData } from '@app/service';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { Bind } from 'primeng/bind';
import { Toast } from 'primeng/toast';
import { ButtonDirective } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-parameter',
  templateUrl: './parameter.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    Bind,
    Toast,
    ButtonDirective,
    Ripple,
    TableModule,
    FormsModule,
    InputText,
    Textarea,
  ],
})
export class ParameterComponent implements OnInit {
  private backendService = inject(BackendService);
  private messageService = inject(MessageService);

  readonly parameters = signal<ParamData[]>([]);
  readonly loading = signal(true);

  clonedParameters: { [s: string]: ParamData } = {};

  ngOnInit(): void {
    this.backendService.getParameterData().subscribe({
      next: (result) => {
        this.parameters.set(result.data as ParamData[]);
        this.loading.set(false);
      },
    });
  }
  onRowEditInit(parameter: ParamData) {
    this.clonedParameters[parameter.id] = { ...parameter };
  }

  onRowDelete(parameter: ParamData, _index: number) {
    this.backendService.delParameterData(parameter).subscribe({
      next: () => {
        this.parameters.set(this.parameters().filter((p) => p !== parameter));
      },
    });
  }

  onRowEditSave(parameter: ParamData, index: number) {
    let sub: Observable<RetData>;
    if (parameter.id == 0)
      sub = this.backendService.addParameterData(parameter);
    else sub = this.backendService.updParameterData(parameter);
    sub.subscribe({
      next: (ret) => {
        delete this.clonedParameters[parameter.id];
        const updated = [...this.parameters()];
        updated[index] = ret.data as ParamData;
        this.parameters.set(updated);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Parameter is updated',
        });
      },
    });
  }

  onRowEditCancel(parameter: ParamData, index: number) {
    const updated = [...this.parameters()];
    updated[index] = this.clonedParameters[parameter.id];
    this.parameters.set(updated);
    delete this.clonedParameters[parameter.id];
  }

  onAddNewRow() {
    this.parameters.set([{ id: 0, key: '', value: '' }, ...this.parameters()]);
  }
}
